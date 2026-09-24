# Turf — UI Design Brief

> For the existing Figma Make project, use the staged prompts in [FIGMA_MAKE_PROMPTS.md](FIGMA_MAKE_PROMPTS.md), which are the short version of this brief. This document stays the full reference.

Paste the **Product overview** and **Design system** sections first, then add one screen group (A, B, C or D) per prompt. Each group stands on its own. Group D covers future features. Design them on a separate page so they don't mix with the MVP screens.

---

## Product overview

Turf is a mobile-first web app for booking and managing 5-a-side, 7-a-side and 11-a-side football turfs in Nairobi, Kenya.

It has three types of user:

1. **Turf owners and their staff (managers).** They use Turf to run their venue day to day: taking bookings from walk-ins, phone calls and WhatsApp, and from customers who book in the app. They also record who has paid, track no-shows and see revenue. This is the most important part of the product: it replaces the paper booking book or WhatsApp chat that owners use today.
2. **Customers (players).** They find nearby turfs, see free time slots and book a slot. **In the first release, customers pay at the venue after playing, so the MVP customer screens (group B) have no online payment, checkout or "Pay now" step.** Every price is shown as "Pay at venue". Online payment, reviews and the 3D map come later and are designed separately in group D.
3. **Platform admins.** They approve new venues and oversee the platform, using a desktop web dashboard.

Staff use the app on a phone, often standing at the pitch, sometimes one-handed, in bright sunlight or at night under floodlights. Screens must be fast to read and quick to act on. Creating a walk-in booking should take three taps or fewer.

**Design at:** mobile 390 × 844 for owner and customer screens, desktop 1440 × 900 for admin screens.

---

## Design system

- **Style:** clean, modern and confident, a sports feel without being loud. Plenty of white space, rounded cards (12–16 px radius), soft shadows, big clear numbers.
- **Colours:**
  - **Primary:** deep pitch green `#0F7A3D`. **Accent:** lime `#B6F23A`, used sparingly for highlights and the main CTA on dark surfaces.
  - **Neutrals:** near-black text `#111827`, grey text `#6B7280`, borders `#E5E7EB`, background `#F7F8F7`, white cards.
  - **Dark mode:** provide one. Background `#0B0F0D`, cards `#151B18`.
- **Typography:** Inter (or a similar geometric sans-serif). 28/22/18/16/14/12 scale. Prices and stats in semibold with tabular numbers.
- **Touch:** minimum 44 px touch targets, bottom sheets for quick actions, sticky bottom CTAs, a bottom tab bar for navigation.
- **Booking status colours** (use them consistently everywhere):
  - Confirmed: green
  - Pending approval: amber
  - Completed: slate/grey
  - No-show: red
  - Cancelled or rejected: grey with strikethrough
- **Payment badges:**
  - Unpaid: red outline pill
  - Partly paid: amber pill
  - Paid: green pill with a check
  - Waived: grey pill
- **Currency:** always "KES 2,500" style. Phone numbers look like "+254 712 345 678". Times use the 24-hour format "19:00–20:00". Dates look like "Tue 22 Sep".
- **Sample data** (use it for realism):
  - Venues: "Greenfield Arena" (Kilimani), "Kasarani Sports Hub" (Kasarani), "Westlands Five" (Westlands), "Karen Turf Club" (Karen).
  - Turfs: "Pitch A · 5-a-side", "Pitch B · 7-a-side".
  - Prices: KES 2,500/hr off-peak, KES 3,500/hr peak (17:00–22:00).
  - Customers: "Brian Otieno", "Faith Wanjiru", "Kevin Mwangi", "Team Umoja FC".
- **States:** design empty states (friendly illustration + one action), loading skeletons, and error or conflict messages (e.g. "That slot was just taken — pick another time").

---

## A. Owner and staff app (mobile, highest priority)

**Bottom tab bar:** Today · Calendar · Customers · Reports · More.

Managers see the same app, but the Reports tab and pricing and team settings are hidden.

### A1. Sign in
- Turf logo, a phone number field with a +254 prefix, and a "Send code" button.
- Next step: enter a 6-digit code (large boxes), a resend timer, and "Sign in".

### A2. Today (home)
- **Header:** venue name with a venue switcher, today's date, and a profile avatar.
- **Four stat cards:**
  - Bookings today: 14
  - Occupancy: 72%
  - Collected: KES 31,000
  - Unpaid: KES 7,500 (in red)
- **"Needs attention" section:** 2 booking requests awaiting approval, with Accept/Reject buttons inline, and 3 past bookings still unpaid.
- **"Up next" list:** time, pitch, customer name, status and payment badge. Tapping a row opens the booking.
- **Floating "+ New booking" button.**

### A3. Calendar, day view (the core screen)
- **Top:** a horizontal date strip, a Day/Week toggle and a "Today" button.
- **Grid:** one column per pitch (Pitch A · 5-a-side, Pitch B · 7-a-side) and hourly rows from 06:00 to 23:00, with peak hours lightly shaded.
- **Booking blocks** show the customer name, time, source icon (walk-in / phone / WhatsApp / app), a repeat icon for recurring bookings, and a payment badge. The block colour follows the booking status.
- **Empty slots** show a faint "+". Tapping one opens New booking with the pitch and time filled in.
- Blocked or maintenance periods are shown with a hatched pattern and a label.
- The current time appears as a horizontal line.
- **Also design the week view:** 7 day columns for one pitch, with a pitch selector.

### A4. New booking (bottom sheet)
- Pitch and time are pre-filled and editable. A duration stepper sets the length (1 h, 1.5 h, 2 h).
- **Customer:** name and phone fields, with suggestions from past customers as the user types.
- **Source:** chips for Walk-in, Phone and WhatsApp.
- **Repeat:** a "Repeat weekly" toggle. When it's on, show a "for [8] weeks" stepper and a note such as "2 weeks clash with existing bookings — they'll be skipped" listing those dates.
- **Price** calculated automatically ("KES 3,500 · peak"), plus an optional notes field.
- **Sticky "Save booking" button.**

### A5. Booking details
- **Header:** status pill, customer name (tappable) with call and WhatsApp buttons.
- **Details:** pitch, date, time, source, reference (e.g. "TRF-4K7Q"), who created it and notes.
- **Payment card:** price, amount paid, balance, payment badge, and a list of recorded payments with method and time. Primary button: "Record payment".
- **Actions:** Move, Extend, Cancel booking, Mark as no-show (only available after the start time).
- For recurring bookings: "Part of weekly series (5 of 8)", with a choice between "this booking" and "this and following".

### A6. Record payment (bottom sheet)
- Amount, pre-filled with the balance and editable.
- Method chips: Cash, M-Pesa, Other.
- An M-Pesa code field, shown only when M-Pesa is selected (e.g. "SIJ4X8Y2ZQ").
- A "Waive remaining balance" link and a "Save payment" button.

### A7. Booking requests
- A list of pending requests from customers booking in the app.
- Each shows the customer, time, pitch and their no-show history (e.g. "2 no-shows").
- Accept and Reject buttons, plus a short countdown ("auto-declines in 1h 20m").

### A8. Customers
- A search bar and a list of customers.
- Each row shows the name, phone, visit count, last visit and a warning flag for no-shows.
- **Customer detail:**
  - Stats: visits, total paid, no-shows, unpaid balance.
  - Booking history and notes.
  - A "Flag customer" option and a "New booking for this customer" button.

### A9. Reports (owners only)
- A date range selector (This week / This month / Custom) and a pitch filter.
- **Revenue:** total collected, with a small bar chart of revenue by day split by Cash / M-Pesa / Other.
- **Outstanding unpaid:** total amount and a list.
- **Occupancy heatmap:** weekdays by hours (06–23), coloured by how full each slot is, so owners can spot quiet hours.
- **Also show:** bookings by source (donut chart), no-show rate, top 5 customers, and an "Export CSV" button.

### A10. More (settings)
- **Venue details:** name, description, area, address, a map pin picker and photos.
- **Pitches:** a list, and an edit screen with name, type (5/7/11-a-side), slot length and base price.
- **Opening hours:** a row per weekday with open and close times and a "Closed" toggle, plus date-specific overrides.
- **Pricing rules:** e.g. "Weekdays 17:00–22:00 · KES 3,500", and "Weekends all day · KES 3,000".
- **Blocked periods:** add maintenance or private events with a date/time range and a reason.
- **Booking settings:** a toggle between "Auto-confirm app bookings" and "Approve each request", and a free-cancellation window.
- **Team:** a list of members with their roles (Owner/Manager) and an "Invite manager" button that asks for a phone number.
- Venue status banner while the venue awaits approval: "Pending approval — customers can't see your venue yet".

---

## B. Customer app (mobile)

**Bottom tab bar:** Explore · My bookings · Profile.

### B1. Explore
- A search field ("Search area or venue") and a "Near me" button.
- **Filter chips:** 5-a-side / 7-a-side / 11-a-side, Date, Time, Price.
- **List/Map toggle.**
- **Venue cards:** photo, name, area, distance ("2.1 km"), "From KES 2,500/hr", and a row of the next free slot chips ("18:00", "19:00", "21:00").
- **Map view:** pins showing the price, and a bottom card carousel.

### B2. Venue page
- A photo gallery, the venue name, area and distance, and "Get directions" and "Call" buttons.
- Pitch selector tabs.
- A horizontal date strip.
- **Slot grid:** available slots show the time and price, peak slots are marked, and booked slots are greyed out.
- Details: amenities (floodlights, parking, changing rooms) and a small map.
- **Sticky bottom bar** once a slot is selected: "Pitch A · Tue 22 Sep · 19:00–20:00 · KES 3,500 — Book".

### B3. Review booking
- A summary card: venue, pitch, date, time and price.
- A clear info banner: "No payment now — pay at the venue after your game."
- Name and phone, pre-filled if signed in (otherwise sign in with an OTP inline).
- The cancellation note: "Free cancellation up to 2 hours before."
- A "Confirm booking" button.

### B4. Confirmation
- **Confirmed version:** a success check, booking reference, summary, "Pay KES 3,500 at the venue", and buttons for Get directions, Add to calendar and View my bookings. Include the note "We'll SMS you a reminder 2 hours before."
- **Approval required version:** "Request sent — Greenfield Arena will confirm shortly. We'll SMS you."

### B5. My bookings
- Tabs for Upcoming and Past.
- Cards show the venue, pitch, date and time, the status pill and "Pay at venue · KES 3,500".
- **Booking detail:** a map and directions, the reference, and "Cancel booking". The cancel button is disabled inside the 2-hour window, with an explanation.

### B6. Profile
- Name, phone, notification preferences and sign out.

---

## C. Admin dashboard (desktop, lower priority)

- **Layout:** a left sidebar with Overview, Venue approvals, Venues, Users, Bookings, Disputes and Audit log.
- **Overview:** active venues, bookings this week, total booking value and no-show rate, plus a trend chart.
- **Venue approvals:** a queue table. Clicking a row opens a detail panel with photos, the map location, owner details, and Approve / Reject (with a reason) buttons.
- **Venues and Users:** searchable tables with status filters and a Suspend / Reinstate action.
- **Bookings:** a searchable table filterable by venue, status and date.
- **Disputes:** a list of cases linked to a booking, with a notes thread and a status (Open / Resolved).
- **Audit log:** a table of time, actor, action, entity and a before/after diff.

---

## D. Future features (design on a separate page labelled "Future — not in MVP")

These screens show where the product is heading. Don't add them to the MVP flows in groups A–C. Each should appear as an optional extension of an existing screen, so it can be added later without redesigning that screen.

### D1. Online payment (M-Pesa)
- **Review booking (B3), payment variant:** a choice between "Pay at venue" and "Pay now with M-Pesa". An optional deposit, e.g. "Pay KES 1,000 deposit now, KES 2,500 at venue".
- **M-Pesa prompt screen:** "Check your phone — enter your M-Pesa PIN to pay KES 3,500 to Turf". Show a phone number with an edit option, a waiting spinner with a countdown, and "Didn't get it? Resend".
- **Payment result:** success (with the M-Pesa receipt code) and failure (with "Try again" and "Pay at venue instead").
- **Refunds:** refund status on My bookings. Admin refund queue in the dashboard (C).
- **Owner side:** payments marked "Paid online" on booking blocks and in Reports' method breakdown. Payout history.

### D2. Reviews, ratings and favourites
- A star rating and short review prompt after a completed booking.
- Reviews section and average rating on the venue page (B2) and venue cards (B1).
- A heart icon on venue cards and a "Favourites" list in Profile.
- Owner: a reviews list with a reply option.

### D3. 3D map
- A "3D" toggle next to List/Map on Explore (B1).
- A simplified 3D view of a Nairobi neighbourhood: roads, turf pitches as green 3D blocks, venue buildings, entrance markers and parking icons.
- Tapping a pitch opens a card with live next free slots and a "Book" button.
- **Navigation mode:** a route line to the venue entrance, with walking/driving tabs.
