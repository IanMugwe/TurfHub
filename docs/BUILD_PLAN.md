# Turf: Build Plan

**Inputs:**
- [SRS](SRS) v1.2: what the product must do.
- [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md): backend architecture, data model, booking rules and milestones M0–M10.
- [`apps/web`](../apps/web): the web app. It started as the Figma Make prototype and is now the project's frontend codebase.

**What this document covers:** what is already built, the decisions that came out of building it, how `apps/web` grows from a mock-data prototype into the production frontend, which API each screen needs, and the remaining build order. The backend design in the implementation plan (NestJS, Postgres/PostGIS, Redis/BullMQ, Africa's Talking SMS) still applies and is not repeated here.

---

## 1. Where things stand

### 1.1 Repository

```
TurfHub/
├── apps/
│   └── web/                 Vite + React 19 + Tailwind v4 (built)
├── docs/                    SRS, plans, UI brief, Figma prompts
├── package.json             pnpm workspace root (pnpm dev / build / typecheck)
└── pnpm-workspace.yaml      apps/*, packages/*
```

Still to come: `apps/api` (NestJS), `packages/database`, `packages/validation`, `packages/types`, and `infrastructure/` for docker-compose.

### 1.2 Built so far (frontend, mock data only)

Every screen below runs in the browser from `src/data.ts` sample data. None of it talks to a server yet.

| Area | Screens built | Missing compared with the UI brief |
|------|---------------|-----------------------------|
| Sign in | Phone (+254) → 6-digit code, resend timer, wrong-code error. The number decides the app: owner, manager or player. | Real OTP, sessions, owner sign-up |
| Staff: Today | Four stat cards, "Needs attention" with inline Accept/Reject, "Up next", loading skeleton | Venue switcher is decorative |
| Staff: Calendar | Day view (pitch columns, peak shading, maintenance hatching, now-line), week view with a pitch selector, status colours, payment dots | Tapping an empty slot doesn't prefill the pitch and time; blocks aren't editable |
| Staff: New booking | Pitch, time, duration, source chips, repeat weekly with a clash note, live peak/off-peak price, slot-conflict error | Customer suggestions while typing, notes field |
| Staff: Booking detail | Status, call/WhatsApp, details, payment card, inline record payment (Cash/M-Pesa/Other, M-Pesa code, waive), weekly-series scope, no-show only after the start time | List of recorded payments, Move/Extend flows, cancel confirmation |
| Staff: Requests | Requests screen with no-show history, auto-decline countdown, Accept/Reject, "All caught up" empty state | — |
| Staff: Customers | Search, list with no-show and flag markers, empty state, customer detail (stats, history, notes, flag, "New booking for this customer") | — |
| Staff: Reports | Date range chips, revenue by day split by method, outstanding list, occupancy heatmap, top 5 customers, Export CSV button | Bookings by source (donut), no-show rate, pitch filter |
| Staff: More | Settings list, pending-approval banner, dark mode toggle, sign out. Managers don't see pricing rules or the team section, and Reports is hidden from them. | Every sub-page (venue details, pitches, hours, pricing, blocks, team) |
| Player | Explore (search, filters, list), venue page (gallery, pitch tabs, day strip, slot grid), review, confirmation (confirmed or pending), my bookings (upcoming, past, cancelled), profile, sign out | Map view (the toggle does nothing), favourites, first-booking name capture |
| Cross-cutting | Design tokens with light and dark themes, empty/loading/error states, 390 px phone frame, URL routing, lint, tests, CI (F0) | Real data, accessibility pass |

### 1.3 Technical debt in `apps/web`

These came from the prototype. F0 fixed most of them:

- ~~**Navigation is component state.**~~ Fixed: every screen has a URL (§3.3).
- ~~**Loose typing.**~~ Fixed: no `as any` casts remain.
- **Duplicated UI.** Partly fixed: the tab bar, bottom sheet, toggle and icons are shared. Headers, chips and steppers are extracted as their screens get wired to the API.
- **Styling is mostly inline `style={{}}`.** Left as is on purpose. The design is final, so styles only change if the result is pixel-identical.
- **Fake "now".** `NOW_HOUR` now lives in one place (`src/mocks/data.ts`) and goes away when the API provides server time (P7).
- **Figma Make leftovers.** The Figma Make plugins in `vite.config.ts` and `.figma/` stay while the design may still be edited in Figma Make.

---

## 2. Decisions

The implementation plan's D1–D11 still stand, except that **the web stack changes from Next.js to Vite + React** (W1). The new decisions have proposed defaults.

| # | Decision | Proposed default |
|---|----------|------------------|
| W1 | **Web stack** | Keep `apps/web` on Vite + React as a single-page app. Use **React Router** for URLs and **TanStack Query** for server data. Host it as static files (Vercel, Netlify or Cloudflare Pages). |
| W3 | **Visual design** | **Final.** The app keeps the current look. The phone frame adapts: on screens wider than 500 px it shows as a 390 px device on a grey background; on phones it fills the screen edge to edge (`.phone-frame` in `src/index.css`). Code changes must not change how screens look; F0 was checked with before/after screenshots of 24 screens. |
| W2 | **Search engines and link previews for public venue pages** (the SRS wants venues discoverable) | Ship the SPA first. In M7, add server rendering only for `/venues/:slug`, either with Vike (Vite's SSR layer) or by having the API serve those pages' `<title>`/OpenGraph tags. Staff pages never need it. |
| P1 | **One sign-in for everyone** (already built as a mock) | `POST /auth/otp/verify` returns the user and their venue memberships. People with a membership go to the staff app; everyone else goes to the player app. **This changes D2:** owners and managers use OTP only in the MVP, and password + 2FA applies to admins only. |
| P2 | **People with both roles** | Default to the staff app. Add "Switch to player app" in More and "Switch to venue" in Profile. This needs a small design addition. |
| P3 | **New phone numbers** | Signing in with a new number creates a `CUSTOMER` account. Owners sign up through a separate "List your venue" flow. |
| P4 | **Manager limits** (already hidden in the UI) | Also enforce them on the server with the venue-membership policy. Hiding a tab is not access control. |
| P5 | **Multiple venues** | The venue goes in the URL (`/v/:venueId/…`). Remember the last-used venue on the device. |
| P6 | **Dark mode** (already built) | Default to the system setting, with the manual override stored in `localStorage`. |
| P7 | **"Now"** | Server time in `Africa/Nairobi` drives Up next, the now-line, no-show gating and countdowns. Until then, `NOW_HOUR` in `src/mocks/data.ts` stands in for it. |
| P8 | **Request countdown** (already built) | Render it from `expires_at` on `PENDING` bookings, which the `expire-pending` job sets. |
| P9 | **Live updates** | Poll every 30 s on Today, Calendar and Requests while visible, and refetch when the tab regains focus. Add server-sent events only if polling isn't enough. |

---

## 3. Frontend architecture

### 3.1 Folder structure (`apps/web/src`)

```
src/
├── app/              router (routes.tsx, RouteScreens.tsx), layouts (PhoneFrame, StaffLayout, PlayerLayout), app state
├── features/
│   ├── auth/  today/  calendar/  bookings/  requests/  customers/  reports/  settings/
│   └── player/       explore, venue, booking flow, my bookings, profile
├── ui/               shared components (§3.2)
├── lib/              format helpers (KES, +254 phones)
├── mocks/            sample data, replaced by the API milestone by milestone
└── api/              typed client + TanStack Query hooks (from M0)
```

Everything except `api/` exists since F0. Screens stay presentational: they get data and callbacks as props, and the route components in `app/RouteScreens.tsx` connect them to the URL and app state. Wiring a screen to the API means changing its route component, not its markup.

### 3.2 Shared UI (`src/ui`, later `packages/ui` if a second app needs it)

| Component | Where it comes from |
|-----------|------------------|
| Component | Status |
|-----------|--------|
| `StatusPill`, `PayPill`, `StatCard`, `EmptyState`, `Skeleton` | **Done** |
| `BottomSheet` (backdrop, handle, Escape to close) | **Done** in F0 |
| `TabBar` and the tab icons | **Done** in F0 |
| `Toggle` | **Done** in F0 |
| `BackHeader`, `Fab`, `SegmentedControl`, `Chip`, `Stepper` | Extract when their screens are wired to the API |
| `PhoneInput`, `OtpInput` | Extract from `SignInScreen.tsx` in M1 |
| `Money`, `TimeRange`, `DateLabel` | The helpers exist in `src/lib/format.ts`; switch screens over as they're wired |

The design is final (W3), so extracting a component must not change how it looks. The tokens in `src/index.css` stay the single source of truth for colours in both themes.

### 3.3 Routes

```
/login                              Sign in → routed by role (P1)

/v/:venueId/today                   Staff
/v/:venueId/calendar                ?date=&view=week&turf=
/v/:venueId/requests
/v/:venueId/customers
/v/:venueId/customers/:phone
/v/:venueId/reports                 owners only
/v/:venueId/settings/...
   ?booking=TRF-4K7Q                booking detail sheet (shareable; back closes it)
   ?new=1&turf=A&start=18:00        new booking sheet, prefilled from a tapped slot

/explore                            Player
/venues/:slug
/book/review
/book/:ref
/bookings
/profile
```

Route guards redirect signed-out users to `/login`. Venue routes require a membership for that venue, and `/reports` requires the owner role. The server enforces the same rules (P4).

### 3.4 Data

- A typed API client is generated from the shared Zod schemas (`packages/validation`). Each resource gets its own TanStack Query hooks (`useCalendar`, `useRecordPayment`, …).
- These actions update the screen straight away and roll back with a toast if the server rejects them: Accept/Reject, Record payment, Flag customer.
- A `409 SLOT_UNAVAILABLE` shows the conflict banner that New booking already has and refetches the calendar.
- `src/data.ts` becomes the seed data for `packages/database` and for tests, then leaves the app.

---

## 4. Build order

**F0** is new and turns the prototype into a production frontend. **M0–M10** follow the implementation plan, with each milestone now wiring existing screens to the API instead of designing them from scratch. Durations are rough and assume **one full-stack developer**. A second developer working on the API in parallel would roughly halve the time from M2 onwards.

| Milestone | Status |
|-----------|--------|
| UI design and clickable prototype | **Done** |
| Repo as pnpm workspace, web app in `apps/web` | **Done** |
| F0: Frontend foundations | **Done** |
| M0 → M10 | To do |

### F0: Frontend foundations (done)
- **Routing:** React Router with the routes in §3.3 (`src/app/routes.tsx`). Sign-in, role redirects, the owner-only Reports route and a not-found page all work by URL. Sheets open from the URL (`?booking=`, `?new=1&turf=&start=`), so back closes them. Tapping an empty calendar slot now fills in the pitch and time.
- **Layout:** `src/app` (router, layouts, app state), `src/features/*` (screens), `src/ui` (shared components), `src/lib` (format helpers), `src/mocks` (sample data).
- **State:** the session and theme are remembered on the device, so a refresh keeps you signed in. The API will replace this with session cookies in M1.
- **Quality:** ESLint, Vitest + Testing Library (19 tests: format helpers, toggle, routing and role rules), and GitHub Actions CI (typecheck → lint → test → build).
- **Design unchanged:** the phone frame and every screen look the same (W3). This was checked by screenshotting 24 screens before and after F0 in light and dark mode, with identical page markup and CSS.
- **Kept on purpose:** inline styles, the Figma Make tooling, and `NOW_HOUR` until the API provides server time.

### M0: Backend foundations (≈1 week)
- `apps/api` (NestJS), `packages/{database,validation,types}`, docker-compose (`postgis/postgis:16`, `redis:7`), Prisma, `/api/v1` health check.
- Vite dev proxy from `/api` to the API.
- **Exit:** `pnpm dev` starts web + API + DB + Redis, and the web app shows the API's health status.

### M1: Auth, roles and routing (≈1.5 weeks)
- OTP request/verify, refresh rotation, logout, venue membership, policy guard, manager invites (implementation plan §2.9).
- Wire the existing sign-in screen to the API. The mock `sessionForPhone` becomes `GET /me`.
- **Exit:** an owner lands on Today; a manager lands on Today without Reports, and `GET /reports/*` returns `403`; a new number lands on Explore.

### M2: Venues and turfs (≈1.5 weeks)
- Venue and turf CRUD, image upload with the `process-image` job, approval status. The pending-approval banner uses real status.
- **Build** the Settings › Venue details and Pitches pages, and the working venue switcher (P5).
- **Exit:** an owner sets up a venue with three pitches and photos from a phone.

### M3: Availability and pricing (≈1.5 weeks)
- Hours, overrides, pricing rules, blocked periods, and the slot-generation function with edge-case tests.
- **Build** the Settings › Opening hours, Pricing rules and Blocked periods pages.
- **Exit:** the quote endpoint gives the right price and peak flag for any turf and time.

### M4: Calendar and bookings (≈2.5 weeks, less than before because the UI exists)
- Exclusion constraint, state machine, recurring series, concurrency suite (implementation plan §2.2, M4).
- **Wire** Calendar, New booking and Booking detail. **Add** a slot tap that prefills the sheet, customer suggestions, a notes field, Move/Extend and cancel confirmation.
- **Exit:** a manager runs a full evening of walk-ins and phone bookings from a phone.

### M5: Payments, customers and no-shows (≈1.5 weeks)
- **Wire** record/void/waive payments, the customer list and detail, notes and flags. **Add** the recorded-payments list and void-with-reason.
- **Exit:** at close of day, staff can see what was played, paid, unpaid or a no-show.

### M6: Today and reports (≈1 week)
- **Wire** Today and Reports. **Add** the bookings-by-source donut, no-show rate and pitch filter. Make the CSV export work.
- **Exit:** **owner-only pilot gate.** Pilot venues start running their bookings in Turf.

### M7: Player discovery (≈2 weeks)
- Search, near-me (PostGIS), filters. **Wire** Explore and the venue page. **Build** the map view (MapLibre).
- Server rendering or meta tags for `/venues/:slug` (W2).
- **Exit:** a player finds a free nearby slot in under 30 s on a mobile connection; Lighthouse mobile performance ≥ 85.

### M8: Player booking, requests and SMS (≈1.5 weeks)
- **Wire** Review, Confirmation, My bookings, Profile and the Requests screen. Add the `expire-pending` job and the SMS outbox.
- **Exit:** search → book → SMS → staff accept → reminder works end to end, and the booking appears on the staff calendar within 30 s.

### M9: Admin console (≈2 weeks, design first)
- The admin console is not designed yet (UI brief section C). Design it first, then build it as a separate route tree, `/admin`.
- **Exit:** every admin action appears in the audit log.

### M10: Hardening and pilot (≈2 weeks)
- Security review with an authorization test for every endpoint, load tests, backups with a tested restore, monitoring.
- Accessibility pass: contrast in both themes, focus handling in sheets, labels on pills and icons.
- **Exit:** pilot venues use Turf as their only booking record for 2 weeks, then player booking is switched on.

**Total remaining:** about **17 weeks** for one developer. The owner-only pilot can start after M6, around week 10.

```
F0 → M0 → M1 → M2 → M3 → M4 → M5 → M6 ─┬→ M7 → M8 → M9 → M10
                                        └ owner-only pilot starts
```

---

## 5. Design still needed

| Needed by | Screen or flow |
|-----------|----------------|
| M1 | Owner sign-up / "List your venue"; role switch (P2); manager invite and accept |
| M2–M3 | Settings pages: venue details with map pin and photos, pitch editor, opening hours with overrides, pricing rules, blocked periods, booking settings |
| M4 | Move and Extend; cancel confirmation (single vs series); customer suggestions in New booking |
| M5 | Recorded-payments list; void payment with reason |
| M7–M8 | Map view on Explore; first-booking name capture; "slot was just taken" on Review; player cancel confirmation; SMS wording |
| M9 | Admin console (desktop) |
| All | Offline and network-error states; 403/404 pages |

---

## 6. Screen → API map

All routes are under `/api/v1`. Venue routes check membership, and routes marked *owner* check the owner role.

| Screen (`apps/web/src/…`) | Endpoints | Milestone |
|--------|-----------|-----------|
| Sign in (`screens/SignInScreen.tsx`) | `POST /auth/otp/request` · `POST /auth/otp/verify` → `{ user, memberships[] }` · `POST /auth/refresh` · `POST /auth/logout` · `GET /me` | M1 |
| Today (`screens/TodayScreen.tsx`) | `GET /venues/:id/today` | M6 (basic in M4) |
| Calendar (`screens/CalendarScreen.tsx`) | `GET /venues/:id/calendar?from&to&turf` | M4 |
| New booking (`components/NewBookingSheet.tsx`) | `GET /venues/:id/customers/suggest?q=` · `POST /venues/:id/quote` · `POST /venues/:id/bookings` (optional `repeatWeeks`) | M4 |
| Booking detail (`components/BookingDetailSheet.tsx`) | `GET /bookings/:ref` · `PATCH /bookings/:ref` (`scope=one\|following`) · `POST /bookings/:ref/cancel` · `POST /bookings/:ref/no-show` · `POST /bookings/:ref/payments` · `POST /payments/:id/void` · `POST /bookings/:ref/waive` | M4, M5 |
| Requests (`screens/BookingRequestsScreen.tsx`) | `GET /venues/:id/requests` · `POST /bookings/:ref/accept` · `POST /bookings/:ref/reject` | M8 |
| Customers (`screens/CustomersScreen.tsx`, `CustomerDetailScreen.tsx`) | `GET /venues/:id/customers?q&cursor` · `GET /venues/:id/customers/:phone` · `PUT …/notes` · `PUT …/flag` | M5 |
| Reports *(owner)* (`screens/ReportsScreen.tsx`) | `GET /venues/:id/reports/{revenue,outstanding,occupancy,sources,top-customers}?from&to&turf` · `GET …/export.csv` | M6 |
| More (`screens/MoreScreen.tsx`) | venue, turfs, hours, overrides, pricing rules *(owner)*, blocked periods, settings, members *(owner)* | M1–M3 |
| Explore (`customer/ExploreScreen.tsx`) | `GET /venues/search?q&lat&lng&radiusKm&type&date&time` | M7 |
| Venue page (`customer/VenuePage.tsx`) | `GET /venues/:slug` · `GET /turfs/:id/availability?date` | M7 |
| Review → Confirmation (`customer/ReviewBooking.tsx`, `ConfirmationScreen.tsx`) | `POST /bookings` → `CONFIRMED` or `PENDING` with `expiresAt` | M8 |
| My bookings (`customer/MyBookingsScreen.tsx`) | `GET /me/bookings?tab=upcoming\|past\|cancelled` · `POST /me/bookings/:ref/cancel` | M8 |
| Profile (`customer/ProfileScreen.tsx`) | `GET/PATCH /me` · `PUT /me/notification-preferences` | M8 |

File paths are the current ones. They move under `features/*` in F0.

---

## 7. Testing

Adds to the implementation plan's §5:

- **Component tests** (Vitest + Testing Library) for `src/ui` and the format helpers, starting in F0.
- **Playwright journeys** on Pixel and iPhone viewports:
  - Owner: accept a request → create a walk-in → hit a slot conflict → record an M-Pesa payment → mark a no-show.
  - Manager: confirm Reports and pricing are absent and blocked.
  - Player: book → cancel.
- **Authorization matrix:** every endpoint × {owner, manager of this venue, manager of another venue, player, signed out}, generated from one table so new endpoints can't be missed.
- **Visual snapshots** of `src/ui` components in light and dark mode to catch token regressions.

---

## 8. Housekeeping

- [x] SRS moved to `docs/SRS`.
- [x] Prototype promoted to `apps/web`, repo turned into a pnpm workspace.
- [ ] Confirm W1–W2 and P1–P9 before F0 and M1.
- [ ] Decide whether to keep `docs/Football Management System/`. It's an older generated dashboard that `apps/web` replaces, so it can probably be deleted.
