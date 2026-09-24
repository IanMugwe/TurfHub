# Turf — MVP Implementation Plan

**Source:** [SRS](SRS) v1.2

> **Status (update):** the UI is designed and the frontend is built with mock data in `apps/web` (Vite + React, not Next.js). The web stack decision and the frontend build order live in [BUILD_PLAN.md](BUILD_PLAN.md), which adds a frontend milestone (F0) before M0. The backend design below is unchanged.
**Scope:** MVP, focused on **turf management**. Online payment (M-Pesa, SRS §12, §26) is **deferred**. Players today pay at the venue after playing, and asking them to pay upfront would slow adoption. Turf records payments taken at the venue and keeps the data model ready for online payment later. The 3D map (SRS §18–21) is also out of scope.

**Why management comes first:** an owner can run their turf on Turf, with bookings, walk-ins, payments and reports, before any customers use the app. Owners get value on day one, and customer-facing discovery launches with real, accurate availability instead of an empty catalogue.

---

## 0. Decisions needed before building

Each decision has a proposed default so work can start. Please confirm or change them before the milestone listed in the right-hand column.

| # | Decision | Proposed default | Needed by |
|---|----------|------------------|-----------|
| D1 | Customer authentication | Phone number + SMS one-time code (OTP). No password. | M1 |
| D2 | Owner/staff/admin authentication | Phone OTP + password. Add 2FA for admins after launch. | M1 |
| D3 | Staff roles | An owner can invite **managers** to specific venues. Managers handle bookings and record payments. Only owners see revenue reports and edit pricing. | M1 |
| D4 | Confirming customer bookings | Set per venue. **Auto-confirm** is the default, with an option to require owner approval. | M4 |
| D5 | No-show handling | Staff mark no-shows. A customer with 2 no-shows in 90 days needs owner approval for future bookings at that venue. | M5 |
| D6 | Customer cancellation | Free cancellation up to 2 h before start. After that, only the venue can cancel. No money is involved. | M8 |
| D7 | Slot model | Each turf has a fixed slot length (e.g. 60 min) with slots starting at opening time. Staff can book multiple consecutive slots. | M3 |
| D8 | Recurring bookings (SRS §3.2 lists these as future scope) | **Pull into the MVP on the owner side only.** "Repeat weekly for N weeks" when staff create a booking, because regular teams are common. | M4 |
| D9 | SMS provider | Africa's Talking | M1 |
| D10 | Map provider | MapLibre GL + OpenStreetMap-based tiles, for cost and to avoid lock-in. | M7 |
| D11 | Hosting | Web as a static site (Vercel, Netlify or Cloudflare Pages). API + worker as containers on Fly.io/Render/Railway. Managed Postgres with PostGIS. Managed Redis. | M0 |

---

## 1. Repository and tooling

```
turfhub/
├── apps/
│   ├── web/            Vite + React + Tailwind v4 (built): owner/staff, customer and admin UIs
│   └── api/            NestJS REST API, with a second entrypoint for the BullMQ worker
├── packages/
│   ├── database/       Prisma schema, migrations (incl. raw SQL), seed, client export
│   ├── validation/     Zod schemas shared by web + api (request/response contracts)
│   ├── types/          Shared enums and DTO types
│   ├── ui/             Shared React components (touch-first, accessible)
│   └── config/         tsconfig, ESLint, Prettier, Tailwind preset
├── infrastructure/     docker-compose (postgis/postgis:16, redis:7), deploy configs
├── docs/
└── tests/              Cross-app e2e (Playwright) and concurrency suites
```

- **Workspace:** pnpm workspaces + Turborepo, Node 22 LTS, TypeScript `strict`.
- **Package scope:** `@turfhub/*`. The `@turf/*` npm scope already belongs to Turf.js, a geospatial library we may use, so we avoid it.
- **Testing:** Vitest for unit and integration tests (NestJS through `unplugin-swc`), Playwright for e2e.
- **CI (GitHub Actions):** lint → typecheck → unit → integration (Postgres + Redis service containers) → e2e on PRs to `main`.

---

## 2. Key technical designs

### 2.1 Time and money
- Store every instant as `timestamptz` in UTC. Business rules run in `Africa/Nairobi` (UTC+3, no daylight saving).
- Operating hours are stored as local wall-clock times (`time`) with a day of the week.
- Amounts (prices and recorded payments) are integer **KES** (`amount_kes int`). No floats anywhere.

### 2.2 Preventing double booking (SRS §11, §38)
Postgres enforces this itself, not the application code. It matters even without online payment: staff entering a walk-in and a customer booking online can hit the same slot at the same moment.

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE bookings ADD CONSTRAINT bookings_no_overlap
  EXCLUDE USING gist (
    turf_id WITH =,
    tstzrange(starts_at, ends_at, '[)') WITH &&
  )
  WHERE (status IN ('PENDING', 'CONFIRMED'));
```

- Prisma can't express exclusion constraints, so this goes into a hand-written SQL migration.
- A constraint violation (SQLSTATE `23P01`) maps to `409 SLOT_UNAVAILABLE`.
- Blocked periods are checked in the same transaction. Staff can't block time that already has a booking without cancelling or moving it first.

**Booking states.** The SRS states `HELD`, `PAYMENT_PENDING`, `EXPIRED`, `REFUND_PENDING` and `REFUNDED` exist only for online payment and are dropped for now. `REJECTED` and `NO_SHOW` are added.

```
PENDING ──► CONFIRMED ──► COMPLETED ──► NO_SHOW (staff, within 48 h after end)
   │            │
   ▼            ▼
REJECTED    CANCELLED
```

- `PENDING` is only used when a venue requires approval (D4), or when the customer has a no-show record (D5). Staff-created bookings are always `CONFIRMED`.
- After `ends_at`, a job marks a `CONFIRMED` booking as `COMPLETED`. Staff can change it to `NO_SHOW` within 48 h.
- Allowed state transitions live in one pure module (`booking-state.ts`). Every status change goes through it, and it gets exhaustive unit tests.

**Payment status** is separate from booking status and is calculated from the recorded payments: `UNPAID` / `PARTIALLY_PAID` / `PAID` / `WAIVED`.

### 2.3 Availability engine (SRS §10)
A pure function turns rules into slots:

```
slots(turf, dateRange) =
  generate from operating_hours + availability_overrides (fixed slot length)
  − blocked_periods
  − active bookings (PENDING / CONFIRMED)
  − past slots
  priced by pricing_rules (highest-priority match, else turf base price)
```

It has no database access, so it is easy to unit-test (SRS §36). The staff calendar and customer availability both use this same function.

### 2.4 Bookings from staff and from customers
- **Where a booking came from:** `APP` (customer online), `WALK_IN`, `PHONE`, `WHATSAPP`. Owners can see which channels their business comes from.
- **Who booked:** a booking stores `contact_name` + `contact_phone`, and a `customer_id` too if the person has an account. Staff never have to create an account for a walk-in.
- **Customer records:** a per-venue view of customers built from bookings, keyed by normalized phone number (`+2547…`). It shows visit count, total paid, no-shows and notes.
- **Recurring bookings (D8):** a `booking_series` row plus one booking per occurrence. Weeks that clash are reported to staff, not skipped silently. Staff can cancel a single occurrence or the rest of the series.

### 2.5 Recording payments
- Staff record each payment against a booking with an amount, a method (`CASH`, `MPESA`, `OTHER`), an optional M-Pesa code, who recorded it, and when.
- Voiding a payment requires a reason, and every void is written to the audit log.
- This table is where online payments will go later. An online M-Pesa integration would write rows with `method = MPESA_ONLINE` behind a provider interface, so bookings and reports don't need to change.

### 2.6 Background jobs (BullMQ, SRS §31)
| Job | Trigger |
|-----|---------|
| `send-notification` | Outbox rows (§2.7) |
| `booking-reminder` | Delayed until 2 h before start. Reminders are the main defence against no-shows now that nobody pays upfront. |
| `complete-booking` | After `ends_at` |
| `expire-pending` | If staff haven't answered a `PENDING` request in 2 h, or by 1 h before start, it is rejected and the customer is told |
| `process-image` | After upload: resize to WebP variants with `sharp` |

### 2.7 Notifications (SRS §13)
- **Outbox pattern:** a state change writes its `notifications` row in the same transaction, and a job sends it.
- **SMS (Africa's Talking) first:**
  - Staff: new booking or booking request, customer cancellation.
  - Customer: booking confirmed or rejected, reminder, change, cancellation.
- Email and WhatsApp can be added later behind the same channel interface.

### 2.8 Location (SRS §17, §24.1)
- `venues.location geography(Point, 4326)` with a GiST index. Prisma models it as `Unsupported`, and "near me" search uses raw `ST_DWithin` / `ST_Distance` queries.
- A **Location module** owns geo queries and map-provider integration. The booking and availability modules never import it. This is the boundary the future 3D module plugs into (SRS §45).

### 2.9 Authentication and authorization (SRS §6.1, §33)
- **OTP:** hashed and kept in Redis with a 5-minute TTL. Rate-limited per phone number and per IP.
- **Tokens:** a JWT access token (15 min) plus a rotating refresh token, both sent as httpOnly cookies. Refresh tokens are stored hashed in `sessions`.
- **Roles:** `CUSTOMER`, `OWNER`, `ADMIN`, plus **venue membership** (`OWNER` / `MANAGER`) for staff (D3). A policy helper checks both the user's role and their access to the venue on every owner and staff endpoint.
- An audit-log interceptor covers every staff and admin write.

### 2.10 API conventions (SRS §32)
- All routes live under `/api/v1/...`. Request bodies are validated with the shared Zod schemas.
- Errors use one format: `{ code, message, details? }`. Lists use cursor pagination.
- An OpenAPI spec is generated from the Zod schemas, and the web app uses a typed client.

---

## 3. Initial data model

| Table | Key fields |
|-------|-----------|
| `users` | phone (unique), name, email?, role, status, password_hash? |
| `sessions` | user_id, refresh_token_hash, expires_at, revoked_at |
| `venue_members` | venue_id, user_id, role (`OWNER`/`MANAGER`), invited_by, status |
| `venues` | name, description, address, area, `location` (PostGIS), contact, confirmation_mode (`AUTO`/`APPROVAL`), status (`DRAFT`/`PENDING_APPROVAL`/`APPROVED`/`SUSPENDED`) |
| `venue_images` / `turf_images` | storage key, order, variants |
| `turf_types` | 5-a-side, 7-a-side, 11-a-side, … |
| `turfs` | venue_id, turf_type_id, name, capacity, base_price_kes, slot_minutes, status |
| `operating_hours` | turf_id, day_of_week, opens_at, closes_at |
| `availability_overrides` | turf_id, date, opens_at?, closes_at?, closed |
| `pricing_rules` | turf_id, days mask, start_time, end_time, price_kes, priority |
| `blocked_periods` | turf_id, starts_at, ends_at, reason (`MAINTENANCE`/`BLOCKED`/`EVENT`) |
| `booking_series` | turf_id, weekday, start_time, slots, starts_on, ends_on, contact |
| `bookings` | reference, turf_id, series_id?, customer_id?, contact_name, contact_phone, source, starts_at, ends_at, status, price_kes, notes, created_by, cancelled_at, cancel_reason |
| `booking_payments` | booking_id, amount_kes, method, mpesa_code?, recorded_by, recorded_at, voided_at?, void_reason? |
| `customer_notes` | venue_id, phone, note, flags |
| `notifications` | user_id?, phone, channel, template, payload, status, sent_at |
| `audit_logs` | actor_id, action, entity, entity_id, before, after, created_at |

The SRS §40 tables `payments` and `refunds` are deferred along with online payment. `reviews` and `favorites` are future scope (SRS §3.2).

---

## 4. Milestones

Owner and staff features come first (M1–M6), then customer-facing features (M7–M9). Each milestone ships the API, the UI and the tests together. Sizes are relative: S < M < L.

### M0: Foundations (S)
- Monorepo scaffold, shared config, docker-compose (PostGIS + Redis), Prisma setup, CI pipeline.
- NestJS skeleton: config validation, logging, error format, health check, `/api/v1` prefix, Sentry.
- Web: already exists in `apps/web`. Add the API client and a dev proxy to the API (see BUILD_PLAN.md, F0 and M0).
- **Exit:** `pnpm dev` runs web + api + db + redis locally, and CI is green.

### M1: Authentication, owners and staff (M)
- OTP login, refresh, logout, owner registration.
- Venue membership: invite a manager by phone, accept, remove (D3). Role and venue-access guards, rate limiting.
- UI: login/OTP screens, owner sign-up, team management.
- **Exit:** an owner signs in on a phone and invites a manager. The manager can't see revenue or edit pricing.

### M2: Venues and turfs (M)
- CRUD for venues and turfs. Image upload through presigned URLs to S3-compatible storage, plus the `process-image` job.
- Venue approval workflow (submit → admin approves or rejects), with a minimal admin queue.
- **Exit:** an owner sets up a venue with three turfs and images, and an admin approves it.

### M3: Availability and pricing (M)
- Operating hours, date overrides, pricing rules (peak and off-peak, weekend), blocked and maintenance periods.
- The slot-generation function.
- **Exit:** unit tests cover edge cases: slots crossing midnight, overlapping price rules, blocks that cover part of a slot, and past slots.

### M4: Booking calendar, the core of the owner's day (L)
- Day and week calendar per venue, showing all turfs side by side, built for phones first.
- Create a booking in three taps or fewer: tap an empty slot → name and phone → save. Source is walk-in, phone or WhatsApp.
- Move, extend, cancel. Recurring series (D8).
- Exclusion-constraint migration and the booking state machine.
- **Concurrency suite:** 50 parallel attempts on the same slot against real Postgres, and exactly one succeeds.
- **Exit:** a manager can run a full evening of bookings from a phone without a paper book.

### M5: Payments at the venue, customers and no-shows (M)
- Record and void payments. Payment status on the calendar ("unpaid" badges).
- Mark bookings completed or no-show. Per-venue customer list with history, notes and flags. No-show rule (D5).
- **Exit:** at close of day, staff can see which bookings were played, paid, unpaid or no-shows.

### M6: Owner dashboard and reports (M)
- Today view: upcoming bookings, unpaid balance, occupancy.
- Reports by date range and turf:
  - Revenue from recorded payments, by payment method.
  - Outstanding unpaid amounts.
  - Occupancy by hour and weekday (a heatmap to spot dead hours worth discounting).
  - Bookings by source, no-show rate, top customers.
- CSV export. Only owners can see revenue (D3).
- **Exit:** an owner can answer "what did I make this week, and when are my turfs empty?" from their phone.

### M7: Customer discovery (M)
- Search by text or area, near-me (PostGIS), filters (price, turf type, date and time using the availability engine).
- Venue and turf profile pages (server-rendered or with API-served meta tags, BUILD_PLAN.md W2), with live availability, optimized images and a map with directions (D10).
- **Exit:** a customer on a mobile connection finds a nearby free slot in under 30 s. The Lighthouse mobile performance score is 85 or higher.

### M8: Customer booking and notifications (M)
- Customer books a slot: auto-confirm or request (D4). "Pay at venue" is clearly labelled.
- Staff approve or reject requests from the calendar, plus the `expire-pending` job.
- SMS outbox: confirmations, requests, reminders, cancellations, changes.
- "My bookings" (upcoming and past) and cancellation rule (D6).
- **Exit:** the e2e journey (Search → Select slot → Book → SMS confirmation → Reminder) works. Staff see app bookings on the same calendar as walk-ins.

### M9: Admin console (M)
- Manage users, owners and venues (approve, suspend, reinstate). Monitor bookings.
- Disputes: a simple case log tied to a booking. Audit log viewer.
- Platform reports: active venues, bookings, booking value, no-show rates.
- Admins can create venues on an owner's behalf to speed up pilot onboarding.
- **Exit:** every admin action shows up in the audit log.

### M10: Hardening and pilot launch (M)
- Security review (OWASP Top 10, authz tests on every endpoint, especially manager vs owner), load test of the calendar, availability and search, backups with a tested restore, OpenTelemetry traces, error alerts.
- **Pilot in two stages:**
  1. Owners only: venues run their daily bookings in Turf.
  2. Customer booking is switched on for those venues.
- **Exit:** the pilot venues use Turf as their only booking record for 2 weeks.

```
M0 ─► M1 ─► M2 ─► M3 ─► M4 ─► M5 ─► M6 ─► M7 ─► M8 ─► M9 ─► M10
                         (owner-only pilot can start after M6)
```

---

## 5. Testing strategy (SRS §36)

| Level | What | How |
|-------|------|-----|
| Unit | Slot generation, pricing, state machine, recurring-series generation, cancellation and no-show rules, payment-status calculation | Vitest, pure functions, no I/O |
| Integration | API ↔ DB ↔ jobs, exclusion constraint, venue-access rules, outbox | Vitest + real Postgres/Redis (CI service containers) |
| Concurrency | Parallel bookings on one slot from staff and customers at the same time | Dedicated suite in `tests/concurrency`, run in CI |
| E2E | Owner setup → calendar booking → record payment. Customer search → book → cancel. Admin approval. | Playwright on mobile viewports (Pixel, iPhone) + desktop |

---

## 6. Risks

| Risk | Mitigation |
|------|-----------|
| Owners stick with a notebook or WhatsApp | Calendar built for speed on phones (booking in three taps or fewer), walk-ins without accounts, owner-only pilot phase |
| No-shows, since nobody pays upfront | SMS reminders, approval mode (D4), no-show tracking and flags (D5) |
| Payments not recorded, so reports are wrong | "Unpaid" badges on past bookings, end-of-day unpaid list |
| Owners slow to enter venue data | Admins can onboard venues on the owner's behalf (M9) |
| SMS/OTP costs and abuse | Per-phone and per-IP rate limits, OTP cooldowns, reminders sent once only |
| Map provider costs grow with traffic | Location module isolation. MapLibre/OSM default (D10). |

---

## 7. Deferred

- **Online payment (M-Pesa STK Push)**, with deposits, refunds and payouts. The plan for adding it later: a provider interface writes into `booking_payments`, and the `HELD`/`PAYMENT_PENDING` states come back. Revisit once the pilot shows whether no-shows or collecting payment are a real problem.
- **Other future scope:** 3D map and navigation, reviews, favorites, customer-side recurring bookings, teams, tournaments, coaches, equipment rental, memberships, loyalty, promotions, native apps.
- **Boundaries kept for these:** the Location module is isolated, `/api/v1/map/*` is reserved, and there are no map or payment-provider dependencies in the booking core.
