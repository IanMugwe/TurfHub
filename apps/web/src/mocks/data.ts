import type { Booking, BookingSource, Customer, PlayerBooking, Session, StaffRole } from '../types'
import { phoneToParam } from '@turfhub/validation'
import { addDays, formatDay, todayKey } from '../lib/dates'

export const VENUE = {
  id: 'greenfield',
  slug: 'greenfield-arena',
  name: 'Greenfield Arena',
  area: 'Kilimani, Nairobi',
  pitches: [
    { id: 'A', name: 'Pitch A', type: '5-a-side', priceOffPeak: 2500, pricePeak: 3500 },
    { id: 'B', name: 'Pitch B', type: '7-a-side', priceOffPeak: 2500, pricePeak: 3500 },
    { id: 'C', name: 'Pitch C', type: '11-a-side', priceOffPeak: 3000, pricePeak: 4500 },
  ]
}

// Fixed "now" for the demo: today at 14:00, so the story plays out the same whatever time you present.
// Replaced by server time when the API lands.
export const NOW_HOUR = 14

export const PEAK_START = 17
export const PEAK_END = 22

/** Hourly price for a pitch at a start hour (peak 17:00–22:00) */
export function hourlyPrice(pitchId: string, hour: number) {
  const pitch = VENUE.pitches.find(p => p.id === pitchId) ?? VENUE.pitches[0]
  return hour >= PEAK_START && hour < PEAK_END ? pitch.pricePeak : pitch.priceOffPeak
}

const TODAY = todayKey()
const dayLabel = (offset: number) => formatDay(addDays(TODAY, offset))

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

export function customerByName(name: string) {
  return CUSTOMERS.find(c => c.name === name)
}

/** Look up a customer from the phone segment used in URLs */
export function customerByPhoneParam(param: string) {
  return CUSTOMERS.find(c => phoneToParam(c.phone) === param)
}

const PHONE = Object.fromEntries(CUSTOMERS.map(c => [c.name, c.phone]))
const PITCH_TYPE: Record<string, string> = Object.fromEntries(VENUE.pitches.map(p => [p.name, p.type]))

type Seed = Omit<Booking, 'id' | 'phone' | 'pitchType' | 'dateKey' | 'date'> & { offset: number }

function toBooking(s: Seed, id: string): Booking {
  const { offset, ...rest } = s
  const dateKey = addDays(TODAY, offset)
  return { ...rest, id, phone: PHONE[s.customer] ?? '', pitchType: PITCH_TYPE[s.pitch], dateKey, date: formatDay(dateKey) }
}

// Today's bookings: the core of the demo story
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

// Earlier bookings that give customers a history
const HISTORY_SEEDS: Seed[] = [
  { offset: -2, ref: 'TRF-3H2A', customer: 'Aisha Hassan', pitch: 'Pitch B', time: '16:00–17:00', duration: '1h', status: 'completed', payment: 'paid', amount: 2500, paid: 2500, source: 'walkin' },
  { offset: -10, ref: 'TRF-7Q1Z', customer: 'Aisha Hassan', pitch: 'Pitch A', time: '18:00–19:00', duration: '1h', status: 'noshow', payment: 'unpaid', amount: 3500, paid: 0, source: 'app' },
  { offset: -17, ref: 'TRF-2K8M', customer: 'Aisha Hassan', pitch: 'Pitch A', time: '19:00–20:00', duration: '1h', status: 'noshow', payment: 'waived', amount: 3500, paid: 0, source: 'app' },
  { offset: -1, ref: 'TRF-9B4D', customer: 'Brian Otieno', pitch: 'Pitch A', time: '08:00–09:00', duration: '1h', status: 'completed', payment: 'paid', amount: 2500, paid: 2500, source: 'phone' },
  { offset: -3, ref: 'TRF-4C6E', customer: 'Dennis Kamau', pitch: 'Pitch A', time: '18:00–19:00', duration: '1h', status: 'noshow', payment: 'unpaid', amount: 3500, paid: 0, source: 'app' },
  // Brian's booking from the player app for tomorrow (also in his My Bookings)
  { offset: 1, ref: 'TRF-8H3N', customer: 'Brian Otieno', pitch: 'Pitch A', time: '18:00–19:00', duration: '1h', status: 'confirmed', payment: 'unpaid', amount: 3500, paid: 0, source: 'app' },
]

// Typical bookings used to fill the rest of the week so every calendar day has activity
const WEEK_TEMPLATES: [pitch: string, start: number, hours: number, customer: string, source: BookingSource][] = [
  ['Pitch A', 7, 1, 'Moses Ochieng', 'walkin'],
  ['Pitch B', 9, 1, 'Faith Wanjiru', 'whatsapp'],
  ['Pitch C', 11, 2, 'Team Umoja FC', 'phone'],
  ['Pitch A', 13, 1, 'Kevin Mwangi', 'app'],
  ['Pitch B', 17, 1, 'Sandra Njeri', 'app'],
  ['Pitch A', 19, 1, 'Lydia Chebet', 'phone'],
  ['Pitch C', 18, 2, 'Team Umoja FC', 'phone'],
  ['Pitch B', 20, 1, 'Moses Ochieng', 'walkin'],
]

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function overlaps(time: string, start: number, hours: number) {
  const [s, e] = time.split('–').map(t => { const [h, m] = t.split(':').map(Number); return h + m / 60 })
  return start < e && s < start + hours
}

function weekSeeds(existing: Seed[]): Seed[] {
  const seeds: Seed[] = []
  for (let offset = -7; offset <= 7; offset++) {
    if (offset === 0) continue
    const weekend = [0, 6].includes(new Date(addDays(TODAY, offset) + 'T12:00').getDay())
    WEEK_TEMPLATES.forEach(([pitch, start, hours, customer, source], i) => {
      // Busier at weekends; otherwise every other template, varying by day
      if (!weekend && (i + offset + 14) % 2 !== 0) return
      const clash = [...existing, ...seeds].some(s => s.offset === offset && s.pitch === pitch && overlaps(s.time, start, hours))
      if (clash) return
      const amount = hourlyPrice(pitch.slice(-1), start) * hours
      const past = offset < 0
      const paid = past && i !== 5 // one unpaid booking per past day keeps "unpaid" realistic
      seeds.push({
        offset,
        ref: `TRF-${(Math.abs(offset) * 37 + i * 11 + (past ? 500 : 900)).toString(36).toUpperCase().padStart(4, 'X')}`,
        customer,
        pitch,
        time: `${pad(start)}:00–${pad(start + hours)}:00`,
        duration: `${hours}h`,
        status: past ? 'completed' : 'confirmed',
        payment: paid ? 'paid' : 'unpaid',
        amount,
        paid: paid ? amount : 0,
        source,
      })
    })
  }
  return seeds
}

/** The venue's bookings for the demo, dated relative to today */
export function seedBookings(): Booking[] {
  const fixed = [...TODAY_SEEDS, ...HISTORY_SEEDS]
  return [...fixed, ...weekSeeds(fixed)].map((s, i) => toBooking(s, String(i + 1)))
}

/** Brian Otieno's bookings across venues, as he sees them in My Bookings */
export function seedPlayerBookings(): PlayerBooking[] {
  const at = (offset: number) => ({ dateKey: addDays(TODAY, offset), date: dayLabel(offset) })
  return [
    { ref: 'TRF-8H3N', venue: 'Greenfield Arena', area: 'Kilimani', pitch: 'Pitch A · 5-a-side', ...at(1), time: '18:00–19:00', price: 3500, status: 'confirmed' },
    { ref: 'TRF-W7K2', venue: 'Westlands Turf', area: 'Westlands', pitch: 'Pitch B · 7-a-side', ...at(2), time: '19:00–20:00', price: 3500, status: 'pending' },
    { ref: 'TRF-L4P9', venue: 'Lavington Sports', area: 'Lavington', pitch: 'Pitch C · 11-a-side', ...at(4), time: '10:00–12:00', price: 6000, status: 'confirmed' },
    { ref: 'TRF-9B4D', venue: 'Greenfield Arena', area: 'Kilimani', pitch: 'Pitch A · 5-a-side', ...at(-1), time: '08:00–09:00', price: 2500, status: 'completed' },
    { ref: 'TRF-W2R5', venue: 'Westlands Turf', area: 'Westlands', pitch: 'Pitch B · 7-a-side', ...at(-3), time: '17:00–18:00', price: 3500, status: 'completed' },
    { ref: 'TRF-Q6D4', venue: 'Greenfield Arena', area: 'Kilimani', pitch: 'Pitch A · 5-a-side', ...at(-4), time: '19:00–20:00', price: 3500, status: 'noshow' },
  ]
}

/** Start hour of a booking, e.g. "18:00–19:00" → 18 */
export function startHour(b: { time: string }) {
  return parseInt(b.time.split(':')[0])
}

// Staff accounts for the demo; any other number signs in as a customer
export const STAFF_ACCOUNTS: { name: string; phone: string; staffRole: StaffRole }[] = [
  { name: 'James Kariuki', phone: '+254 722 000 111', staffRole: 'owner' },
  { name: 'Achieng Odhiambo', phone: '+254 733 000 222', staffRole: 'manager' },
]

/** Resolve a signed-in phone number to a staff or customer session */
export function sessionForPhone(phone: string): Session {
  const staff = STAFF_ACCOUNTS.find(a => a.phone === phone)
  if (staff) return { role: 'staff', ...staff }
  const customer = CUSTOMERS.find(c => c.phone === phone)
  return { role: 'customer', name: customer?.name ?? 'New player', phone }
}

export function initials(name: string) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}
