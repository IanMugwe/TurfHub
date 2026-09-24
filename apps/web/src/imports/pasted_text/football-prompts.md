# Turf — Figma Make prompt sequence

Prompts to paste into the **existing** "Football Management System" Make project, one at a time, in order. Wait for each to finish and glance at the result before sending the next. Prompt 1 resets the direction; the rest add one screen group each.

Full detail lives in [FIGMA_UI_BRIEF.md](FIGMA_UI_BRIEF.md). These prompts are the short, staged version of it.

---

## Prompt 1 — Reset the product and the shell

```
Let's change direction. This app is for Nairobi, Kenya: it's a booking and management tool for football turf venues that rent pitches by the hour. It is NOT a league or club manager.

KEEP:
- The dark green/navy colour scheme — make it the app's dark mode.
- The availability heatmap component (pitches x hours). We'll reuse the idea.
- The stat cards and the Recharts revenue chart.
- The bookings table — it moves to the admin dashboard later.

REMOVE ENTIRELY:
- The Matches page (scores, leagues, divisions, cup rounds, man of the match).
- The Teams page (squads, players, positions, goals, assists).
- Anything about seasons, matchweeks or standings, including the sidebar season badge.
- All euro amounts and European sample data.

CHANGE:
- Rename "Fields" to "Pitches". A venue has pitches like "Pitch A · 5-a-side", "Pitch B · 7-a-side", "Pitch C · 11-a-side".
- Currency is Kenyan shillings, written "KES 3,500". Prices are KES 2,500/hr off-peak, KES 3,500/hr peak (17:00–22:00).
- Phone numbers look like "+254 712 345 678". Times are 24-hour ("19:00–20:00"). Dates look like "Tue 22 Sep".
- Sample customers: Brian Otieno, Faith Wanjiru, Kevin Mwangi, Team Umoja FC. Venue: Greenfield Arena, Kilimani, Nairobi. Staff user: Achieng Odhiambo, Manager.

MOST IMPORTANT CHANGE — this is a mobile app:
- Design every screen for a 390 x 844 phone first. Staff use it standing at the pitch, often one-handed, in sunlight or under floodlights.
- Replace the fixed 220px sidebar with a bottom tab bar: Today, Calendar, Customers, Reports, More.
- Minimum 44px touch targets. Body text 16px, never below 12px. High contrast.
- Light mode is the default; keep the dark theme as an option.
- Colours: primary deep green #0F7A3D, accent lime #B6F23A, text #111827, muted #6B7280, borders #E5E7EB, background #F7F8F7. Font: Inter.

Start by rebuilding the "Today" home screen for mobile:
- Header: venue name with a switcher, today's date, profile avatar.
- Four stat cards: Bookings today 14 / Occupancy 72% / Collected KES 31,000 / Unpaid KES 7,500 (unpaid in red).
- "Needs attention": 2 booking requests awaiting approval with Accept and Reject buttons inline, and 3 past bookings still unpaid.
- "Up next": a list of time, pitch, customer name, booking status pill and payment badge.
- A floating "+ New booking" button.

Status colours, used everywhere from now on: Confirmed green, Pending approval amber, Completed grey, No-show red, Cancelled/rejected grey struck through.
Payment badges: Unpaid red outline, Partly paid amber, Paid green with a check, Waived grey.
```

---

## Prompt 2 — The calendar (the most important screen)

```
Now build the Calendar tab, day view. This is the screen staff use most, so it has to be fast to read on a phone.

- Top: a horizontal date strip (scrollable), a Day/Week toggle, and a "Today" button.
- Grid: one column per pitch (Pitch A · 5-a-side, Pitch B · 7-a-side), hourly rows from 06:00 to 23:00. Shade peak hours (17:00–22:00) lightly. The grid scrolls both ways, with the hour column pinned on the left and the pitch names pinned at the top.
- Booking blocks show the customer name, the time, a small icon for the source (walk-in, phone, WhatsApp, app), a repeat icon for recurring bookings, and a payment badge. Block colour follows booking status.
- Empty slots show a faint "+". Tapping one opens the new booking sheet with pitch and time already filled in.
- Blocked/maintenance periods are shown hatched, with a label like "Maintenance".
- A line across the grid marks the current time.
- Also build the week view: 7 day columns for one pitch, with a pitch selector above.
```

---

## Prompt 3 — Booking, payment and details

```
Add three connected screens.

1. New booking (bottom sheet, opens from the calendar or the + button):
- Pitch and time pre-filled but editable; a duration stepper (1h, 1.5h, 2h).
- Customer name and phone, suggesting past customers as you type.
- Source chips: Walk-in, Phone, WhatsApp.
- A "Repeat weekly" toggle. When on, a "for [8] weeks" stepper and a warning like "2 of these dates clash with existing bookings and will be skipped: 6 Oct, 20 Oct".
- The price is calculated automatically and shown as "KES 3,500 · peak". An optional notes field.
- A sticky "Save booking" button. The whole flow should take three taps for a simple walk-in.

2. Booking details:
- Header: status pill, customer name, call and WhatsApp buttons.
- Pitch, date, time, source, reference (like TRF-4K7Q), who created it, notes.
- A payment card: price, paid, balance, payment badge, and the list of payments received with method and time. Primary button "Record payment".
- Actions: Move, Extend, Cancel, and "Mark as no-show" (only after the start time).
- For a recurring booking: "Part of a weekly series (5 of 8)", and cancelling asks "just this one" or "this and the following".

3. Record payment (bottom sheet):
- Amount, pre-filled with the balance owed.
- Method chips: Cash, M-Pesa, Other.
- An M-Pesa code field appears only when M-Pesa is chosen (example: SIJ4X8Y2ZQ).
- A "Waive remaining balance" link, and a "Save payment" button.

Note: customers pay at the venue. Staff record what they received. There is no online payment, invoice or checkout anywhere.
```

---

## Prompt 4 — Requests, customers and reports

```
Add three tabs.

1. Booking requests (reached from Today): pending requests from customers who booked in the app. Each row shows customer, time, pitch, and any no-show history ("2 no-shows"), with Accept and Reject buttons and a countdown like "auto-declines in 1h 20m".

2. Customers tab: a search field and a list showing name, phone, number of visits, last visit, and a warning flag for no-shows.
Customer detail: stats (visits, total paid, no-shows, unpaid balance), booking history, free-text notes, a "Flag customer" option, and "New booking for this customer".

3. Reports tab (owners only — hidden for managers):
- A date range selector (This week / This month / Custom) and a pitch filter.
- Total collected, with a bar chart of revenue per day split by Cash / M-Pesa / Other.
- Outstanding unpaid: a total and a list of the bookings.
- An occupancy heatmap, weekdays by hours 06:00–23:00, coloured by how full each slot is, so an owner can spot dead hours. Reuse the heatmap you already built, restyled to the new palette.
- Bookings by source (donut), no-show rate, top 5 customers, and an "Export CSV" button.
```

---

## Prompt 5 — Venue setup (the More tab)

```
Build the More tab and its settings screens, all mobile:
- Venue details: name, description, area, address, map pin picker, photos.
- Pitches: a list, plus an edit screen with name, type (5/7/11-a-side), slot length and base price.
- Opening hours: one row per weekday with open and close times and a "Closed" toggle, plus date-specific overrides ("Closed 25 Dec", "Opens late 1 Jan").
- Pricing rules: a list like "Weekdays 17:00–22:00 · KES 3,500" and "Weekends all day · KES 3,000", with an add/edit screen.
- Blocked periods: add maintenance or a private event with a date/time range and a reason.
- Booking settings: choose "Auto-confirm app bookings" or "Approve each request", and set the free-cancellation window.
- Team: members with roles (Owner / Manager), and an "Invite manager" button that asks for a phone number.
- A banner shown while a venue awaits approval: "Pending approval — customers can't see your venue yet".
- Sign-in screens: phone number with a +254 prefix and a "Send code" button, then a 6-digit code entry with a resend timer.
```

---

## Prompt 6 — The customer app

```
Now build the customer side, a separate mobile app in the same design system. Bottom tabs: Explore, My bookings, Profile.

1. Explore: a search field ("Search area or venue"), a "Near me" button, filter chips (5-a-side / 7-a-side / 11-a-side, Date, Time, Price), and a List/Map toggle. Venue cards show a photo, name, area, distance ("2.1 km"), "From KES 2,500/hr", and chips of the next free slots ("18:00", "19:00", "21:00"). Map view: price pins and a card carousel at the bottom.

2. Venue page: photo gallery, name, area, distance, "Get directions" and "Call" buttons, pitch tabs, a date strip, and a grid of slots showing time and price, with peak slots marked and booked ones greyed out. Amenities (floodlights, parking, changing rooms) and a small map. Once a slot is picked, a sticky bar: "Pitch A · Tue 22 Sep · 19:00–20:00 · KES 3,500 — Book".

3. Review booking: a summary card, a clear banner reading "No payment now — pay at the venue after your game", name and phone fields, the note "Free cancellation up to 2 hours before", and a "Confirm booking" button.

4. Confirmation, two versions: confirmed (success check, reference, "Pay KES 3,500 at the venue", Get directions, Add to calendar, and "We'll SMS you a reminder 2 hours before"), and awaiting approval ("Request sent — Greenfield Arena will confirm shortly. We'll SMS you.").

5. My bookings: Upcoming and Past tabs, cards showing venue, pitch, date, time, status and "Pay at venue · KES 3,500". Detail screen with a map, directions, reference, and "Cancel booking", disabled inside the 2-hour window with an explanation.

6. Profile: name, phone, notification settings, sign out.

There is no payment step. Every price reads "Pay at venue".
```

---

## Prompt 7 — Admin dashboard (desktop)

```
Build an admin dashboard at 1440x900 desktop, same design system. This is for Turf platform staff, not venue owners. Reuse the table styling you built earlier.

Left sidebar: Overview, Venue approvals, Venues, Users, Bookings, Disputes, Audit log.
- Overview: active venues, bookings this week, total booking value, no-show rate, and a trend chart.
- Venue approvals: a queue table; clicking a row opens a detail panel with photos, map location, owner details, and Approve / Reject (with a reason).
- Venues and Users: searchable tables with status filters and Suspend / Reinstate actions.
- Bookings: a searchable table filtered by venue, status and date.
- Disputes: cases linked to a booking, with a notes thread and Open/Resolved status.
- Audit log: time, actor, action, entity, and a before/after diff.
```

---

## Prompt 8 — Future screens (optional, keep separate)

```
On a separate page labelled "Future — not in MVP", design these. Do not add them to the flows we've already built.

1. Online payment (M-Pesa): a version of Review booking offering "Pay at venue" or "Pay now with M-Pesa", with an optional deposit ("Pay KES 1,000 now, KES 2,500 at venue"). An M-Pesa waiting screen ("Check your phone — enter your M-Pesa PIN to pay KES 3,500") with a countdown and a resend link. Success (with an M-Pesa receipt code) and failure ("Try again" / "Pay at venue instead"). Refund status in My bookings, and a refund queue in the admin dashboard.

2. Reviews and favourites: a rating prompt after a completed booking, reviews and an average rating on the venue page and venue cards, a heart icon for favourites and a Favourites list in Profile, and a reviews list with replies for owners.

3. 3D map: a "3D" toggle next to List/Map on Explore, showing a simplified 3D view of a Nairobi neighbourhood with roads, pitches as green blocks, venue buildings, entrance markers and parking. Tapping a pitch opens a card with the next free slots and a Book button. A navigation mode draws a route to the venue entrance with walking and driving tabs.
```

---

## If Make drifts off course

Short corrections that work well:

- "This is a turf rental business, not a football club. No teams, players, leagues or scores anywhere."
- "Phone first. Show me this at 390px wide. No desktop sidebar."
- "Customers pay at the venue. Remove any checkout, invoice or Pay now step."
- "Use KES, not euros or dollars. Keep the exact Nairobi sample data we set."
- "Make touch targets at least 44px and body text 16px."
