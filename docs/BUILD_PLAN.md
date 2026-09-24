# Turf: Build Plan, from Prototype to Working System

**Inputs:**
- [SRS](SRS) v1.2: what the product must do.
- [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md): architecture, data model, booking rules, milestones M0–M10.
- [`turf_figma/`](../turf_figma): the clickable UI prototype, used as the visual and interaction reference.

**What this document adds:** the implementation plan was written before the UI existed. This plan connects the two. It lists the decisions the prototype raises, how the design becomes production code, which API each screen needs, and a build order with concrete tasks and exit checks. Architecture choices in the implementation plan (Next.js + NestJS monorepo, Postgres/PostGIS, Redis/BullMQ, Africa's Talking SMS) still apply and are not repeated here.

---

## 1. Decisions raised by the prototype

The implementation plan's D1–D11 still stand except where noted. Each row has a proposed default.

| # | Decision | Proposed default | Affects |
|---|----------|------------------|---------|
| P1 | **One sign-in for everyone.** The prototype uses a single phone + OTP screen and sends each person to the right app based on who they are. | `POST /auth/otp/verify` returns the user plus their venue memberships. The client routes to the staff app when there is at least one membership, otherwise to the player app. **Changes D2:** owners and managers use OTP only in the MVP; password + 2FA applies to admins only. | M1 |
| P2 | **People with both roles** (e.g. an owner who also plays). | Default to the staff app, with "Switch to player app" in More, and "Switch to venue" in Profile. The prototype has no switch yet, so it needs a small design addition. | M1, M7 |
| P3 | **Unknown phone numbers.** | Signing in with a new number creates a `CUSTOMER` account (sign-up is sign-in). The name is asked on first booking, which Review booking already collects. Owners sign up through a separate "List your venue" flow (§5). | M1 |
| P4 | **Manager restrictions.** The prototype hides Reports, pricing rules and team settings from managers. | Hide them in the UI **and** enforce on the server (venue-membership policy, implementation plan §2.9). Hiding a tab is not access control. | M1, M6 |
| P5 | **Multiple venues.** Today's header has a venue switcher (▾). | The venue lives in the URL (`/v/[venueId]/…`). The last-used venue is remembered per device. | M2 |
| P6 | **Dark mode.** | Follow `prefers-color-scheme` by default, with a manual override in More/Profile stored in `localStorage`. The tokens already exist (§2.1). | M0.5 |
| P7 | **"Now".** The prototype fixes now at 15:00 on Tue 22 Sep. | The server's `Africa/Nairobi` time drives "Up next", the now-line, no-show gating and request countdowns. The client never does timezone arithmetic itself. | M4 |
| P8 | **Request countdown.** "auto-declines in 1h 20m". | Store `expires_at` on `PENDING` bookings (the `expire-pending` job, implementation plan §2.6) and render the countdown from it. | M8 |
| P9 | **Live updates.** Staff must see app bookings appear without refreshing. | Poll every 30 s on Today, Calendar and Requests while the tab is visible, plus refetch on focus. Server-sent events come later if polling is not enough. | M4, M8 |

---

## 2. Carrying the design into code

The prototype is a **reference, not a codebase to port**. It uses inline styles, mock data and a fixed phone frame. The production app rebuilds the same screens properly and reuses its tokens, components and copy.

### 2.1 Design tokens
- Move the `@theme` block and the `[data-theme='dark']` block from `turf_figma/src/index.css` into `packages/ui/src/tokens.css`, and expose them through the shared Tailwind preset (`packages/config`).
- Keep the token names (`--color-primary`, `--color-pending-bg`, `--color-noshow-border`, …) so screens map one-to-one.
- Add `--radius-*`, the type scale from the brief (28/22/18/16/14/12) and `tabular-nums` for prices and stats.

### 2.2 Component kit (`packages/ui`)
Extract from the prototype, rebuilt with Tailwind classes, accessible labels and 44 px touch targets:

| Component | Prototype source |
|-----------|------------------|
| `StatusPill`, `PayPill` | `components/Pill.tsx` |
| `StatCard` | `components/StatCard.tsx` |
| `EmptyState`, `Skeleton` | `components/EmptyState.tsx`, `components/Skeleton.tsx` |
| `BottomSheet` (overlay, handle, focus trap, swipe to close) | pattern in `NewBookingSheet.tsx`, `BookingDetailSheet.tsx` |
| `TabBar`, `BackHeader`, `Fab` | `App.tsx`, `CustomerApp.tsx`, detail screens |
| `SegmentedControl`, `Chip`, `Toggle`, `Stepper` | calendar Day/Week, source chips, repeat toggle and weeks stepper |
| `PhoneInput` (+254), `OtpInput` (6 boxes, paste, autofill) | `SignInScreen.tsx` |
| `Money`, `TimeRange`, `DateLabel` | formatting used everywhere |

Formatting and parsing helpers go in `packages/validation` so web and API share them: `formatKES(2500) → "KES 2,500"`, `normalizePhoneKE("0712 345 678") → "+254712345678"`, `formatPhoneKE`, `formatDay → "Tue 22 Sep"`, `formatTimeRange → "19:00–20:00"`.

### 2.3 Routes (Next.js App Router)

```
/login                              Sign in (phone → code) → routed by role (P1)

/v/[venueId]/today                  Staff: Today
/v/[venueId]/calendar               Calendar (?date=, ?view=week&turf=)
/v/[venueId]/requests               Booking requests
/v/[venueId]/customers              Customers
/v/[venueId]/customers/[phone]      Customer detail
/v/[venueId]/reports                Reports (owners only)
/v/[venueId]/more/...               Settings sub-pages
   ?booking=TRF-4K7Q                Booking detail sheet (shareable, back button closes it)
   ?new=1&turf=A&start=18:00        New booking sheet, prefilled from a tapped slot

/explore                            Player: Explore (list / map)
/venues/[slug]                      Venue page + slot picker
/book/review                        Review booking
/book/[ref]                         Confirmation
/bookings                           My bookings (upcoming / past / cancelled)
/profile                            Profile

/admin/...                          Admin console (desktop, M9)
```

Middleware reads the session cookie. It sends signed-out users to `/login` and returns `404` for staff routes when the user has no membership for that venue.

### 2.4 Data layer
- Use TanStack Query over the typed API client generated from the shared Zod schemas (implementation plan §2.10).
- Apply **optimistic updates** to Accept/Reject, Record payment and Flag customer, with rollback and a toast on failure.
- Show skeletons on first load, as Today does in the prototype. Never show a spinner on a full screen.
- A `409 SLOT_UNAVAILABLE` from the API renders the conflict banner already designed in New booking ("That slot was just taken — pick another time") and refetches the calendar.

---

## 3. Screen → API map

All routes are under `/api/v1`. "Venue" routes check venue membership, and routes marked *owner* check the `OWNER` role.

| Screen | Endpoints | Milestone |
|--------|-----------|-----------|
| Sign in | `POST /auth/otp/request` · `POST /auth/otp/verify` → `{ user, memberships[] }` · `POST /auth/refresh` · `POST /auth/logout` · `GET /me` | M1 |
| Today | `GET /venues/:id/today` → stats, requests needing attention, past unpaid, up next | M6 (basic version in M4) |
| Calendar (day/week) | `GET /venues/:id/calendar?from&to&turf` → bookings, blocked periods, peak bands, now | M4 |
| New booking sheet | `GET /venues/:id/customers/suggest?q=` · `POST /venues/:id/quote` → price, peak flag, clashes (incl. repeat weeks) · `POST /venues/:id/bookings` (optional `repeatWeeks`) | M4 |
| Booking detail | `GET /bookings/:ref` · `PATCH /bookings/:ref` (move/extend, `scope=one\|following`) · `POST /bookings/:ref/cancel` · `POST /bookings/:ref/no-show` | M4, M5 |
| Record payment | `POST /bookings/:ref/payments` · `POST /payments/:id/void` · `POST /bookings/:ref/waive` | M5 |
| Booking requests | `GET /venues/:id/requests` · `POST /bookings/:ref/accept` · `POST /bookings/:ref/reject` | M8 |
| Customers / detail | `GET /venues/:id/customers?q&cursor` · `GET /venues/:id/customers/:phone` · `PUT …/notes` · `PUT …/flag` | M5 |
| Reports *(owner)* | `GET /venues/:id/reports/{revenue,outstanding,occupancy,sources,top-customers}?from&to&turf` · `GET …/export.csv` | M6 |
| More | venue, turfs, hours, overrides, pricing rules *(owner)*, blocked periods, booking settings, members *(owner)* | M1–M3 |
| Explore | `GET /venues/search?q&lat&lng&radiusKm&type&date&time` | M7 |
| Venue page | `GET /venues/:slug` · `GET /turfs/:id/availability?date` | M7 |
| Review → Confirmation | `POST /bookings` (player) → `CONFIRMED` or `PENDING` with `expiresAt` | M8 |
| My bookings | `GET /me/bookings?tab=upcoming\|past\|cancelled` · `POST /me/bookings/:ref/cancel` | M8 |
| Profile | `GET/PATCH /me` · `PUT /me/notification-preferences` | M8 |

---

## 4. Build order

This keeps the implementation plan's milestones and inserts **M0.5 UI kit**, so every later milestone builds screens from finished parts. Durations are rough and assume **one full-stack developer**. Two developers working in parallel (one on the API, one on the web app) would roughly halve the calendar time from M2 onwards.

### M0: Foundations (≈1 week)
- Monorepo (pnpm + Turborepo), `apps/web`, `apps/api`, `packages/{database,validation,types,ui,config}`.
- docker-compose with `postgis/postgis:16` and `redis:7`, Prisma, CI (lint → typecheck → test).
- **Exit:** `pnpm dev` starts web + API + DB + Redis; CI is green on a PR.

### M0.5: UI kit (≈1 week)
- Tokens (§2.1) and components (§2.2), each with a light/dark preview page (`/dev/kit`, dev builds only).
- Format helpers with unit tests (KES, +254 phones, dates, time ranges).
- **Exit:** the Today screen can be built from kit components with mock data and matches the prototype side by side in both themes.

### M1: Auth, roles and routing (≈1.5 weeks)
- OTP request/verify (Redis, hashed, 5-min TTL, rate limits), refresh rotation, logout (implementation plan §2.9).
- Venue membership and the policy guard. Owner registration stub, manager invite by phone.
- Web: `/login` from `PhoneInput` + `OtpInput`, role routing (P1–P3), middleware, sign out from More and Profile.
- **Exit:** an owner's number lands on Today; a manager's number lands on Today without the Reports tab, and `GET /reports/*` returns `403`; an unknown number lands on Explore.

### M2: Venues and turfs (≈1.5 weeks)
- Venue and turf CRUD, image upload (presigned URL + `process-image` job), approval status and banner ("Pending approval — customers can't see your venue yet").
- More › Venue details, Pitches, and the venue switcher (P5).
- **Exit:** an owner sets up a venue with three pitches and photos from a phone.

### M3: Availability and pricing (≈1.5 weeks)
- Operating hours, date overrides, pricing rules, blocked periods. The pure slot-generation function (implementation plan §2.3) with its edge-case tests.
- More › Opening hours, Pricing rules, Blocked periods.
- **Exit:** the quote endpoint returns the right price and peak flag for any turf and time, including overlapping rules.

### M4: Calendar and bookings (≈3 weeks)
- Exclusion-constraint migration, the booking state machine, recurring series.
- Calendar day and week views: turf columns, peak shading, hatched blocks, now-line, tap an empty slot to open New booking prefilled.
- New booking sheet with customer suggestions, live quote, repeat weekly and clash list. Booking detail with move, extend, cancel and series scope.
- Basic Today (up next + counts). Polling (P9).
- **Concurrency suite:** 50 parallel bookings on one slot, exactly one succeeds.
- **Exit:** a manager runs a full evening of walk-ins and phone bookings from a phone, with no paper book.

### M5: Payments, customers and no-shows (≈1.5 weeks)
- Record, void and waive payments; payment badges everywhere; completion job; no-show only after start time.
- Customers list and detail: stats, history, notes, flag, "New booking for this customer". No-show rule (D5).
- **Exit:** at close of day, staff can see what was played, paid, unpaid or a no-show.

### M6: Today and reports (≈1.5 weeks)
- Full Today: four stat cards, "Needs attention", "Up next".
- Reports: revenue by method (stacked bars), outstanding, occupancy heatmap, sources donut, no-show rate, top customers, CSV export. Owner-only on the server.
- **Exit:** this is the **owner-only pilot gate**. Pilot venues start using Turf for their own bookings (implementation plan M10 stage 1).

### M7: Player discovery (≈2 weeks)
- Search, near-me (PostGIS), filters, list and map (MapLibre), venue page with gallery, pitch tabs and the slot grid (booked slots struck through, peak slots marked).
- Server-rendered venue pages with optimised images.
- **Exit:** a player on a mobile connection finds a free nearby slot in under 30 s; Lighthouse mobile performance ≥ 85.

### M8: Player booking, requests and SMS (≈2 weeks)
- Player booking (auto-confirm or request), Review and Confirmation screens, My bookings with the cancellation window (D6).
- Booking requests screen with no-show history and countdown (P8), plus the `expire-pending` job.
- SMS outbox: confirmation, request, accepted/rejected, reminder, cancellation.
- **Exit:** the e2e journey search → book → SMS → staff accept → reminder passes, and the app booking shows on the staff calendar within 30 s.

### M9: Admin console (≈1.5 weeks)
- Venue approval queue, users/owners/venues management, disputes log, audit viewer, platform reports, onboarding a venue for an owner.
- **Needs design first** (brief section C). See §5.
- **Exit:** every admin action appears in the audit log.

### M10: Hardening and pilot (≈2 weeks)
- As in the implementation plan: security review with authz tests on every endpoint (manager vs owner vs player), load tests, backups with a tested restore, tracing, alerts.
- Accessibility pass: contrast in both themes, focus order in sheets, screen-reader labels on pills and icons.
- **Exit:** pilot venues use Turf as their only booking record for 2 weeks, then player booking is switched on.

**Total:** about **20 weeks** for one developer, including the owner-only pilot starting after M6 (about week 12).

```
M0 → M0.5 → M1 → M2 → M3 → M4 → M5 → M6 ─┬→ M7 → M8 → M9 → M10
                                          └ owner-only pilot starts
```

---

## 5. Design still needed

The prototype covers the daily-use screens. These are still missing, and should be designed before the milestone that needs them:

| Needed by | Screen or flow |
|-----------|----------------|
| M1 | Owner sign-up / "List your venue" onboarding (venue, first pitch, hours, price); role switch for people with both roles (P2); manager invite and accept |
| M2–M3 | More sub-pages: venue details editor with map pin and photos, pitch editor, opening hours with overrides, pricing rules, blocked periods, booking settings |
| M4 | Move and Extend flows; cancel confirmation (single vs series); a standalone Record payment sheet (it is inline in the prototype) |
| M5 | Void payment with reason; payment history list inside booking detail |
| M7–M8 | Map view on Explore; first-booking name capture; "slot was just taken" on Review; player cancel confirmation; SMS copy for every notification |
| M9 | Admin console (desktop): approval queue, venue and user management, disputes, audit log |
| All | Offline and network-error states; 403/404 pages |

---

## 6. Testing additions

These add to the implementation plan's §5:

- **Playwright journeys that mirror the prototype walkthrough,** on Pixel and iPhone viewports:
  - sign in as owner → accept a request → create a walk-in → hit a slot conflict → record an M-Pesa payment → mark a no-show;
  - sign in as manager → confirm Reports and pricing are absent;
  - sign in as player → book → cancel.
- **Authorization matrix test:** every endpoint × {owner, manager of this venue, manager of another venue, player, signed out}, with the expected status codes. This is generated from a single table so new endpoints can't be forgotten.
- **Visual check of kit components** in light and dark mode (Playwright screenshots) to catch token regressions.

---

## 7. Housekeeping before M0

- The SRS has been moved to `docs/SRS` locally, but the move isn't committed. Commit it, and fix the `../SRS` link at the top of `IMPLEMENTATION_PLAN.md`.
- Commit or discard the other untracked design files: `docs/FIGMA_UI_BRIEF.md`, `docs/FIGMA_MAKE_PROMPTS.md`, `docs/Football Management System/` (an older generated dashboard that the new prototype replaces) and `turf_figma.zip`. Add `.DS_Store` to `.gitignore`.
- Keep `turf_figma/` as the design reference until M0.5 is done, then move it to `docs/design/prototype/` so it isn't mistaken for the product code.
- Confirm P1–P9 above (and D1–D11 if not already confirmed) before M1 starts.
