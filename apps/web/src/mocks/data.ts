import type { Booking, BookingSource, Customer, Payment, PaymentMethod, PlayerBooking, Review, Session, StaffRole, Venue } from '../types'
import { phoneToParam } from '@turfhub/validation'
import { addDays, formatDay, todayKey } from '../lib/dates'
import { DEFAULT_HOURS, priceFor } from '../lib/venue'

// Fixed "now" for the demo: today at 14:00, so the story plays out the same whatever time you present.
// Replaced by server time when the API lands.
export const NOW_HOUR = 14

/** Where "near me" measures from: the demo player is in Kilimani */
export const PLAYER_LOCATION = { lat: -1.2905, lng: 36.7837, label: 'Kilimani' }

export const GREENFIELD_ID = 'greenfield'

const TODAY = todayKey()
const dayLabel = (offset: number) => formatDay(addDays(TODAY, offset))
const img = (id: string) => `https://images.unsplash.com/${id}?w=800&h=450&fit=crop&auto=format`

// ── Venues ──

const NOTIFY_ALL = { newRequests: true, cancellations: true, dailySummary: true, paymentReminders: false }

export function seedVenues(): Venue[] {
  return [
    {
      id: GREENFIELD_ID,
      slug: 'greenfield-arena',
      name: 'Greenfield Arena',
      area: 'Kilimani, Nairobi',
      address: 'Argwings Kodhek Road, opposite Yaya Centre',
      description: 'Three floodlit artificial-grass pitches for 5, 7 and 11-a-side, with changing rooms and secure parking. A favourite for office leagues and weekend teams.',
      phone: '+254 722 000 111',
      lat: -1.2931, lng: 36.7876,
      images: [img('photo-1529900748604-07564a03e7a6'), img('photo-1574629810360-7efbbe195018'), img('photo-1543326727-cf6c39e8f84c')],
      amenities: ['💡 Floodlights', '🅿 Parking', '🚿 Changing rooms'],
      status: 'approved',
      pitches: [
        { id: 'A', name: 'Pitch A', type: '5-a-side', priceOffPeak: 2500, pricePeak: 3500, active: true },
        { id: 'B', name: 'Pitch B', type: '7-a-side', priceOffPeak: 2500, pricePeak: 3500, active: true },
        { id: 'C', name: 'Pitch C', type: '11-a-side', priceOffPeak: 3000, pricePeak: 4500, active: true },
      ],
      hours: DEFAULT_HOURS.map(h => ({ ...h })),
      peak: { start: 17, end: 22, weekendsAllDay: false },
      blocked: [{ id: 'blk-1', pitchId: 'C', dateKey: TODAY, startH: 10, endH: 12, reason: 'Maintenance' }],
      cancellationHours: 2,
      autoConfirm: false,
      team: [
        { name: 'James Kariuki', phone: '+254 722 000 111', role: 'owner', status: 'active' },
        { name: 'Achieng Odhiambo', phone: '+254 733 000 222', role: 'manager', status: 'active' },
      ],
      notifications: { ...NOTIFY_ALL },
      baseRating: 4.7,
      baseReviewCount: 134,
    },
    {
      id: 'westlands',
      slug: 'westlands-turf',
      name: 'Westlands Turf',
      area: 'Westlands, Nairobi',
      address: 'Ring Road Parklands, behind Sarit Centre',
      description: 'A rooftop 5 and 7-a-side venue in the heart of Westlands, popular for after-work games.',
      phone: '+254 711 222 333',
      lat: -1.2615, lng: 36.8025,
      images: [img('photo-1574629810360-7efbbe195018'), img('photo-1575361204480-aadea25e6e68')],
      amenities: ['💡 Floodlights', '🅿 Parking'],
      status: 'approved',
      pitches: [
        { id: 'A', name: 'Pitch A', type: '5-a-side', priceOffPeak: 2500, pricePeak: 3500, active: true },
        { id: 'B', name: 'Pitch B', type: '7-a-side', priceOffPeak: 3000, pricePeak: 4000, active: true },
      ],
      hours: DEFAULT_HOURS.map((h, i) => ({ ...h, open: 7, close: i === 0 ? 20 : 23 })),
      peak: { start: 17, end: 22, weekendsAllDay: true },
      blocked: [],
      cancellationHours: 4,
      autoConfirm: false,
      team: [{ name: 'Wanjiru Mwangi', phone: '+254 711 222 333', role: 'owner', status: 'active' }],
      notifications: { ...NOTIFY_ALL },
      baseRating: 4.4,
      baseReviewCount: 89,
    },
    {
      id: 'lavington',
      slug: 'lavington-sports-centre',
      name: 'Lavington Sports Centre',
      area: 'Lavington, Nairobi',
      address: 'James Gichuru Road, Lavington',
      description: 'Full-size natural-feel turf and a 7-a-side cage, with a canteen and spectator stand. Great for tournaments and team training.',
      phone: '+254 700 555 444',
      lat: -1.2769, lng: 36.7690,
      images: [img('photo-1543326727-cf6c39e8f84c'), img('photo-1529900748604-07564a03e7a6')],
      amenities: ['💡 Floodlights', '🅿 Parking', '🚿 Changing rooms', '🏪 Canteen'],
      status: 'approved',
      pitches: [
        { id: '1', name: 'Pitch 1', type: '7-a-side', priceOffPeak: 3000, pricePeak: 4000, active: true },
        { id: '2', name: 'Pitch 2', type: '11-a-side', priceOffPeak: 4500, pricePeak: 6000, active: true },
      ],
      hours: DEFAULT_HOURS.map(h => ({ ...h, open: 6, close: 22 })),
      peak: { start: 16, end: 21, weekendsAllDay: false },
      blocked: [],
      cancellationHours: 6,
      autoConfirm: true,
      team: [{ name: 'Daniel Kiprop', phone: '+254 700 555 444', role: 'owner', status: 'active' }],
      notifications: { ...NOTIFY_ALL },
      baseRating: 4.8,
      baseReviewCount: 201,
    },
  ]
}

// ── Customers (Greenfield's regulars) ──

export const CUSTOMERS: Customer[] = [
  { name: 'Brian Otieno', phone: '+254 712 345 678', visits: 24, lastVisit: dayLabel(0), totalPaid: 62500, unpaid: 0, noShows: 0, notes: 'Plays with the Kilimani office league every week.' },
  { name: 'Faith Wanjiru', phone: '+254 723 456 789', visits: 18, lastVisit: dayLabel(0), totalPaid: 45000, unpaid: 2500, noShows: 1 },
  { name: 'Kevin Mwangi', phone: '+254 734 567 890', visits: 31, lastVisit: dayLabel(0), totalPaid: 84250, unpaid: 1750, noShows: 0 },
  { name: 'Team Umoja FC', phone: '+254 745 678 901', visits: 9, lastVisit: dayLabel(0), totalPaid: 40500, unpaid: 6000, noShows: 0, notes: 'Captain: Peter. Prefers Pitch C.' },
  { name: 'Aisha Hassan', phone: '+254 756 789 012', visits: 5, lastVisit: dayLabel(-2), totalPaid: 10000, unpaid: 0, noShows: 2 },
  { name: 'Dennis Kamau', phone: '+254 767 890 123', visits: 12, lastVisit: dayLabel(-3), totalPaid: 33000, unpaid: 0, noShows: 2 },
  { name: 'Sandra Njeri', phone: '+254 778 901 234', visits: 7, lastVisit: dayLabel(-4), totalPaid: 21000, unpaid: 0, noShows: 1 },
  { name: 'Moses Ochieng', phone: '+254 789 012 345', visits: 42, lastVisit: dayLabel(0), totalPaid: 105000, unpaid: 0, noShows: 0 },
  { name: 'Lydia Chebet', phone: '+254 700 123 456', visits: 15, lastVisit: dayLabel(0), totalPaid: 37500, unpaid: 2500, noShows: 0 },
]

// Occasional players who fill the calendar alongside the regulars
const OCCASIONAL: [string, string][] = [
  ['Kilimani Old Boys', '+254 701 111 222'], ['Peter Kamau', '+254 702 333 444'], ['Safaricom 5s', '+254 703 555 666'],
  ['Joy Achieng', '+254 704 777 888'], ['Nairobi Hawks FC', '+254 705 999 000'], ['Samuel Kiptoo', '+254 706 121 212'],
]

export function customerByName(name: string) {
  return CUSTOMERS.find(c => c.name === name)
}

/** Look up a customer from the phone segment used in URLs */
export function customerByPhoneParam(param: string) {
  return CUSTOMERS.find(c => phoneToParam(c.phone) === param)
}

const PHONE: Record<string, string> = Object.fromEntries([...CUSTOMERS.map(c => [c.name, c.phone]), ...OCCASIONAL])

// ── Bookings ──

type Seed = Omit<Booking, 'id' | 'phone' | 'pitchType' | 'dateKey' | 'date' | 'venueId' | 'pitchId'> & { offset: number; venueId?: string }

const METHODS: PaymentMethod[] = ['mpesa', 'mpesa', 'mpesa', 'cash', 'mpesa', 'cash', 'other', 'mpesa', 'cash', 'mpesa']

function hash(s: string) {
  let h = 0
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0
  return Math.abs(h)
}

/** A plausible payment record for a paid sample booking */
function samplePayment(ref: string, amount: number, time: string): Payment {
  const method = METHODS[hash(ref) % METHODS.length]
  const code = method === 'mpesa' ? `S${(hash(ref) * 7919).toString(36).toUpperCase().padEnd(9, 'X').slice(0, 9)}` : undefined
  return { amount, method, code, at: time.split('–')[1] }
}

function toBooking(s: Seed, id: string, venues: Venue[]): Booking {
  const { offset, venueId = GREENFIELD_ID, ...rest } = s
  const venue = venues.find(v => v.id === venueId)!
  const pitch = venue.pitches.find(p => p.name === s.pitch)!
  const dateKey = addDays(TODAY, offset)
  const payments = rest.payments ?? (rest.paid > 0 ? [samplePayment(rest.ref, rest.paid, rest.time)] : undefined)
  return { ...rest, payments, id, venueId, pitchId: pitch.id, phone: PHONE[s.customer] ?? '', pitchType: pitch.type, dateKey, date: formatDay(dateKey) }
}

// Today at Greenfield: the core of the demo story
const TODAY_SEEDS: Seed[] = [
  { offset: 0, ref: 'TRF-4K7Q', customer: 'Brian Otieno', pitch: 'Pitch A', time: '08:00–09:00', duration: '1h', status: 'confirmed', payment: 'paid', amount: 2500, paid: 2500, source: 'phone', series: { index: 5, total: 8 }, payments: [{ amount: 2500, method: 'cash', at: '08:05' }] },
  { offset: 0, ref: 'TRF-9M2X', customer: 'Faith Wanjiru', pitch: 'Pitch B', time: '10:00–11:00', duration: '1h', status: 'confirmed', payment: 'unpaid', amount: 2500, paid: 0, source: 'whatsapp' },
  { offset: 0, ref: 'TRF-2R5T', customer: 'Kevin Mwangi', pitch: 'Pitch A', time: '12:00–13:30', duration: '1.5h', status: 'confirmed', payment: 'partpaid', amount: 3750, paid: 2000, source: 'app', payments: [{ amount: 2000, method: 'mpesa', code: 'SIJ4X8Y2ZQ', at: '12:10' }] },
  { offset: 0, ref: 'TRF-8W1P', customer: 'Team Umoja FC', pitch: 'Pitch C', time: '14:00–16:00', duration: '2h', status: 'confirmed', payment: 'unpaid', amount: 6000, paid: 0, source: 'phone' },
  { offset: 0, ref: 'TRF-5L3N', customer: 'Aisha Hassan', pitch: 'Pitch B', time: '17:00–18:00', duration: '1h', status: 'confirmed', payment: 'unpaid', amount: 3500, paid: 0, source: 'walkin' },
  { offset: 0, ref: 'TRF-7G6J', customer: 'Dennis Kamau', pitch: 'Pitch A', time: '18:00–19:00', duration: '1h', status: 'pending', payment: 'unpaid', amount: 3500, paid: 0, source: 'app', expiresIn: '1h 20m' },
  { offset: 0, ref: 'TRF-3F9H', customer: 'Sandra Njeri', pitch: 'Pitch C', time: '19:00–21:00', duration: '2h', status: 'pending', payment: 'unpaid', amount: 9000, paid: 0, source: 'app', expiresIn: '2h 05m' },
  { offset: 0, ref: 'TRF-6D4K', customer: 'Moses Ochieng', pitch: 'Pitch B', time: '06:00–07:00', duration: '1h', status: 'completed', payment: 'paid', amount: 2500, paid: 2500, source: 'walkin', payments: [{ amount: 2500, method: 'cash', at: '07:02' }] },
  { offset: 0, ref: 'TRF-1B8C', customer: 'Lydia Chebet', pitch: 'Pitch A', time: '07:00–08:00', duration: '1h', status: 'completed', payment: 'unpaid', amount: 2500, paid: 0, source: 'phone', notes: 'Regular customer, comes every week', series: { index: 3, total: 12 } },
]

// Specific earlier and upcoming bookings referenced elsewhere (customer history, My Bookings)
const FIXED_SEEDS: Seed[] = [
  { offset: -2, ref: 'TRF-3H2A', customer: 'Aisha Hassan', pitch: 'Pitch B', time: '16:00–17:00', duration: '1h', status: 'completed', payment: 'paid', amount: 2500, paid: 2500, source: 'walkin' },
  { offset: -10, ref: 'TRF-7Q1Z', customer: 'Aisha Hassan', pitch: 'Pitch A', time: '18:00–19:00', duration: '1h', status: 'noshow', payment: 'unpaid', amount: 3500, paid: 0, source: 'app' },
  { offset: -17, ref: 'TRF-2K8M', customer: 'Aisha Hassan', pitch: 'Pitch A', time: '19:00–20:00', duration: '1h', status: 'noshow', payment: 'waived', amount: 3500, paid: 0, source: 'app' },
  { offset: -1, ref: 'TRF-9B4D', customer: 'Brian Otieno', pitch: 'Pitch A', time: '08:00–09:00', duration: '1h', status: 'completed', payment: 'paid', amount: 2500, paid: 2500, source: 'phone' },
  { offset: -3, ref: 'TRF-4C6E', customer: 'Dennis Kamau', pitch: 'Pitch A', time: '18:00–19:00', duration: '1h', status: 'noshow', payment: 'unpaid', amount: 3500, paid: 0, source: 'app' },
  { offset: -4, ref: 'TRF-Q6D4', customer: 'Brian Otieno', pitch: 'Pitch A', time: '19:00–20:00', duration: '1h', status: 'noshow', payment: 'unpaid', amount: 3500, paid: 0, source: 'app' },
  // Brian's bookings from the player app, also in his My Bookings
  { offset: 1, ref: 'TRF-8H3N', customer: 'Brian Otieno', pitch: 'Pitch A', time: '18:00–19:00', duration: '1h', status: 'confirmed', payment: 'unpaid', amount: 3500, paid: 0, source: 'app' },
  { offset: 2, ref: 'TRF-W7K2', customer: 'Brian Otieno', pitch: 'Pitch B', time: '19:00–20:00', duration: '1h', status: 'pending', payment: 'unpaid', amount: 4000, paid: 0, source: 'app', venueId: 'westlands', expiresIn: '1h 45m' },
  { offset: -3, ref: 'TRF-W2R5', customer: 'Brian Otieno', pitch: 'Pitch B', time: '17:00–18:00', duration: '1h', status: 'completed', payment: 'paid', amount: 4000, paid: 4000, source: 'app', venueId: 'westlands' },
  { offset: 4, ref: 'TRF-L4P9', customer: 'Brian Otieno', pitch: 'Pitch 2', time: '10:00–12:00', duration: '2h', status: 'confirmed', payment: 'unpaid', amount: 9000, paid: 0, source: 'app', venueId: 'lavington' },
]

type Template = [pitch: string, start: number, hours: number, customer: string, source: BookingSource]

const TEMPLATES: Record<string, Template[]> = {
  [GREENFIELD_ID]: [
    ['Pitch B', 6, 1, 'Moses Ochieng', 'walkin'],
    ['Pitch A', 7, 1, 'Lydia Chebet', 'phone'],
    ['Pitch B', 9, 1, 'Faith Wanjiru', 'whatsapp'],
    ['Pitch C', 11, 2, 'Team Umoja FC', 'phone'],
    ['Pitch A', 13, 1, 'Kevin Mwangi', 'app'],
    ['Pitch B', 16, 1, 'Joy Achieng', 'app'],
    ['Pitch A', 17, 1, 'Peter Kamau', 'whatsapp'],
    ['Pitch B', 17, 1, 'Sandra Njeri', 'app'],
    ['Pitch C', 18, 2, 'Kilimani Old Boys', 'phone'],
    ['Pitch A', 19, 1, 'Safaricom 5s', 'app'],
    ['Pitch B', 20, 1, 'Nairobi Hawks FC', 'walkin'],
    ['Pitch A', 21, 1, 'Samuel Kiptoo', 'app'],
  ],
  westlands: [
    ['Pitch A', 8, 1, 'Peter Kamau', 'app'],
    ['Pitch B', 12, 1, 'Joy Achieng', 'app'],
    ['Pitch A', 18, 1, 'Safaricom 5s', 'app'],
    ['Pitch B', 19, 1, 'Nairobi Hawks FC', 'phone'],
    ['Pitch A', 20, 1, 'Samuel Kiptoo', 'whatsapp'],
  ],
  lavington: [
    ['Pitch 1', 9, 1, 'Kilimani Old Boys', 'phone'],
    ['Pitch 2', 10, 2, 'Nairobi Hawks FC', 'app'],
    ['Pitch 1', 17, 1, 'Joy Achieng', 'app'],
    ['Pitch 2', 18, 2, 'Safaricom 5s', 'phone'],
  ],
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function overlaps(time: string, start: number, hours: number) {
  const [s, e] = time.split('–').map(t => { const [h, m] = t.split(':').map(Number); return h + m / 60 })
  return start < e && s < start + hours
}

/** Typical bookings so every day has activity: a busy month at Greenfield, a week either side elsewhere */
function generatedSeeds(existing: Seed[], venues: Venue[]): Seed[] {
  const seeds: Seed[] = []
  for (const venue of venues) {
    const templates = TEMPLATES[venue.id] ?? []
    const [from, to] = venue.id === GREENFIELD_ID ? [-35, 7] : [-7, 7]
    for (let offset = from; offset <= to; offset++) {
      if (offset === 0 && venue.id === GREENFIELD_ID) continue // today is hand-written above
      const dateKey = addDays(TODAY, offset)
      const weekday = new Date(`${dateKey}T12:00`).getDay()
      const weekend = weekday === 0 || weekday === 6
      templates.forEach(([pitch, start, hours, customer, source], i) => {
        // Busier in the evenings and at weekends; the pattern varies by day
        const evening = start >= 16
        const keep = weekend || (evening ? (i + offset + 35) % 4 !== 0 : (i + offset + 35) % 3 === 0)
        if (!keep) return
        const clash = [...existing, ...seeds].some(s => (s.venueId ?? GREENFIELD_ID) === venue.id && s.offset === offset && s.pitch === pitch && overlaps(s.time, start, hours))
        if (clash) return
        const pitchId = venue.pitches.find(p => p.name === pitch)!.id
        const amount = priceFor(venue, pitchId, dateKey, start, hours)
        const past = offset < 0
        const noShow = past && (i + offset + 35) % 17 === 0
        const unpaid = past && !noShow && (i + offset + 35) % 9 === 0
        const ref = `TRF-${(hash(`${venue.id}${offset}${i}`) % 1679616).toString(36).toUpperCase().padStart(4, 'X')}`
        seeds.push({
          offset, venueId: venue.id, ref, customer, pitch,
          time: `${pad(start)}:00–${pad(start + hours)}:00`,
          duration: `${hours}h`,
          status: noShow ? 'noshow' : past ? 'completed' : 'confirmed',
          payment: past && !noShow && !unpaid ? 'paid' : 'unpaid',
          amount,
          paid: past && !noShow && !unpaid ? amount : 0,
          source,
        })
      })
    }
  }
  return seeds
}

/** Every venue's bookings for the demo, dated relative to today */
export function seedBookings(venues: Venue[]): Booking[] {
  const fixed = [...TODAY_SEEDS, ...FIXED_SEEDS]
  const all = [...fixed, ...generatedSeeds(fixed, venues)]
  // Keep refs unique even if two generated ones collide
  const seen = new Set<string>()
  return all.filter(s => !seen.has(s.ref) && seen.add(s.ref)).map((s, i) => toBooking(s, String(i + 1), venues))
}

/** Brian Otieno's bookings across venues, as he sees them in My Bookings */
export function seedPlayerBookings(): PlayerBooking[] {
  const at = (offset: number) => ({ dateKey: addDays(TODAY, offset), date: dayLabel(offset) })
  return [
    { ref: 'TRF-8H3N', venueId: GREENFIELD_ID, venue: 'Greenfield Arena', area: 'Kilimani', pitch: 'Pitch A · 5-a-side', ...at(1), time: '18:00–19:00', price: 3500, status: 'confirmed' },
    { ref: 'TRF-W7K2', venueId: 'westlands', venue: 'Westlands Turf', area: 'Westlands', pitch: 'Pitch B · 7-a-side', ...at(2), time: '19:00–20:00', price: 4000, status: 'pending' },
    { ref: 'TRF-L4P9', venueId: 'lavington', venue: 'Lavington Sports Centre', area: 'Lavington', pitch: 'Pitch 2 · 11-a-side', ...at(4), time: '10:00–12:00', price: 9000, status: 'confirmed' },
    { ref: 'TRF-9B4D', venueId: GREENFIELD_ID, venue: 'Greenfield Arena', area: 'Kilimani', pitch: 'Pitch A · 5-a-side', ...at(-1), time: '08:00–09:00', price: 2500, status: 'completed' },
    { ref: 'TRF-W2R5', venueId: 'westlands', venue: 'Westlands Turf', area: 'Westlands', pitch: 'Pitch B · 7-a-side', ...at(-3), time: '17:00–18:00', price: 4000, status: 'completed' },
    { ref: 'TRF-Q6D4', venueId: GREENFIELD_ID, venue: 'Greenfield Arena', area: 'Kilimani', pitch: 'Pitch A · 5-a-side', ...at(-4), time: '19:00–20:00', price: 3500, status: 'noshow' },
  ]
}

/** Recent written reviews shown on venue pages (the averages also count earlier ratings) */
export function seedReviews(): Review[] {
  return [
    { id: 'rv-1', venueId: GREENFIELD_ID, author: 'Kevin M.', rating: 5, comment: 'Best 5-a-side surface in Kilimani, and booking takes seconds.', dateKey: addDays(TODAY, -2) },
    { id: 'rv-2', venueId: GREENFIELD_ID, author: 'Faith W.', rating: 4, comment: 'Great floodlights. Parking fills up after 6pm.', dateKey: addDays(TODAY, -6) },
    { id: 'rv-3', venueId: GREENFIELD_ID, author: 'Team Umoja FC', rating: 5, comment: 'Pitch C is perfect for our 11-a-side sessions.', dateKey: addDays(TODAY, -12) },
    { id: 'rv-4', venueId: 'westlands', author: 'Joy A.', rating: 4, comment: 'Rooftop views are amazing. Changing rooms would help.', dateKey: addDays(TODAY, -4) },
    { id: 'rv-5', venueId: 'lavington', author: 'Nairobi Hawks FC', rating: 5, comment: 'Proper full-size pitch, well kept.', dateKey: addDays(TODAY, -3) },
  ]
}

/** Start hour of a booking, e.g. "18:00–19:00" → 18 */
export function startHour(b: { time: string }) {
  return parseInt(b.time.split(':')[0])
}

/**
 * Resolve a signed-in phone number to a session: anyone on a venue's team signs in
 * as staff (including managers invited during the demo); everyone else is a player.
 */
export function sessionForPhone(phone: string, venues: Venue[] = seedVenues()): Session {
  for (const venue of venues) {
    const member = venue.team.find(m => m.phone === phone)
    if (member) return { role: 'staff', staffRole: member.role as StaffRole, name: member.name, phone }
  }
  const customer = CUSTOMERS.find(c => c.phone === phone)
  return { role: 'customer', name: customer?.name ?? 'New player', phone }
}

export function initials(name: string) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}
