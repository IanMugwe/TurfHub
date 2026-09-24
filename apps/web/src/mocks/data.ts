import type { Booking, Customer, Session, StaffRole } from '../types'
import { phoneToParam } from '@turfhub/validation'

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

export const TODAY_BOOKINGS: Booking[] = [
  { id: '1', ref: 'TRF-4K7Q', customer: 'Brian Otieno', phone: '+254 712 345 678', pitch: 'Pitch A', pitchType: '5-a-side', date: 'Tue 22 Sep', time: '08:00–09:00', duration: '1h', status: 'confirmed', payment: 'paid', amount: 2500, paid: 2500, source: 'phone', series: { index: 5, total: 8 } },
  { id: '2', ref: 'TRF-9M2X', customer: 'Faith Wanjiru', phone: '+254 723 456 789', pitch: 'Pitch B', pitchType: '7-a-side', date: 'Tue 22 Sep', time: '10:00–11:00', duration: '1h', status: 'confirmed', payment: 'unpaid', amount: 2500, paid: 0, source: 'whatsapp' },
  { id: '3', ref: 'TRF-2R5T', customer: 'Kevin Mwangi', phone: '+254 734 567 890', pitch: 'Pitch A', pitchType: '5-a-side', date: 'Tue 22 Sep', time: '12:00–13:30', duration: '1.5h', status: 'confirmed', payment: 'partpaid', amount: 3750, paid: 2000, source: 'app' },
  { id: '4', ref: 'TRF-8W1P', customer: 'Team Umoja FC', phone: '+254 745 678 901', pitch: 'Pitch C', pitchType: '11-a-side', date: 'Tue 22 Sep', time: '14:00–16:00', duration: '2h', status: 'confirmed', payment: 'unpaid', amount: 6000, paid: 0, source: 'phone' },
  { id: '5', ref: 'TRF-5L3N', customer: 'Aisha Hassan', phone: '+254 756 789 012', pitch: 'Pitch B', pitchType: '7-a-side', date: 'Tue 22 Sep', time: '17:00–18:00', duration: '1h', status: 'confirmed', payment: 'unpaid', amount: 3500, paid: 0, source: 'walkin' },
  { id: '6', ref: 'TRF-7G6J', customer: 'Dennis Kamau', phone: '+254 767 890 123', pitch: 'Pitch A', pitchType: '5-a-side', date: 'Tue 22 Sep', time: '18:00–19:00', duration: '1h', status: 'pending', payment: 'unpaid', amount: 3500, paid: 0, source: 'app', expiresIn: '1h 20m' },
  { id: '7', ref: 'TRF-3F9H', customer: 'Sandra Njeri', phone: '+254 778 901 234', pitch: 'Pitch C', pitchType: '11-a-side', date: 'Tue 22 Sep', time: '19:00–21:00', duration: '2h', status: 'pending', payment: 'unpaid', amount: 9000, paid: 0, source: 'app', expiresIn: '2h 05m' },
  { id: '8', ref: 'TRF-6D4K', customer: 'Moses Ochieng', phone: '+254 789 012 345', pitch: 'Pitch B', pitchType: '7-a-side', date: 'Tue 22 Sep', time: '06:00–07:00', duration: '1h', status: 'completed', payment: 'paid', amount: 2500, paid: 2500, source: 'walkin' },
  { id: '9', ref: 'TRF-1B8C', customer: 'Lydia Chebet', phone: '+254 700 123 456', pitch: 'Pitch A', pitchType: '5-a-side', date: 'Tue 22 Sep', time: '07:00–08:00', duration: '1h', status: 'completed', payment: 'unpaid', amount: 2500, paid: 0, source: 'phone', notes: 'Regular customer, comes every Tuesday', series: { index: 3, total: 12 } },
]

export const PENDING_REQUESTS = TODAY_BOOKINGS.filter(b => b.status === 'pending')
export const PAST_UNPAID = TODAY_BOOKINGS.filter(b => b.status === 'completed' && b.payment === 'unpaid')

// Fixed "now" for mock data: Tue 22 Sep, 14:00. Replaced by server time when the API lands.
export const NOW_HOUR = 14

export const CUSTOMERS: Customer[] = [
  { name: 'Brian Otieno', phone: '+254 712 345 678', visits: 24, lastVisit: 'Mon 21 Sep', totalPaid: 62500, unpaid: 0, noShows: 0, notes: 'Plays with the Kilimani office league on Tuesdays.' },
  { name: 'Faith Wanjiru', phone: '+254 723 456 789', visits: 18, lastVisit: 'Tue 22 Sep', totalPaid: 45000, unpaid: 2500, noShows: 1 },
  { name: 'Kevin Mwangi', phone: '+254 734 567 890', visits: 31, lastVisit: 'Tue 22 Sep', totalPaid: 84250, unpaid: 1750, noShows: 0 },
  { name: 'Team Umoja FC', phone: '+254 745 678 901', visits: 9, lastVisit: 'Tue 22 Sep', totalPaid: 40500, unpaid: 6000, noShows: 0, notes: 'Captain: Peter. Prefers Pitch C.' },
  { name: 'Aisha Hassan', phone: '+254 756 789 012', visits: 5, lastVisit: 'Sun 20 Sep', totalPaid: 10000, unpaid: 0, noShows: 2 },
  { name: 'Dennis Kamau', phone: '+254 767 890 123', visits: 12, lastVisit: 'Sat 19 Sep', totalPaid: 33000, unpaid: 0, noShows: 2 },
  { name: 'Sandra Njeri', phone: '+254 778 901 234', visits: 7, lastVisit: 'Fri 18 Sep', totalPaid: 21000, unpaid: 0, noShows: 1 },
  { name: 'Moses Ochieng', phone: '+254 789 012 345', visits: 42, lastVisit: 'Tue 22 Sep', totalPaid: 105000, unpaid: 0, noShows: 0 },
  { name: 'Lydia Chebet', phone: '+254 700 123 456', visits: 15, lastVisit: 'Tue 22 Sep', totalPaid: 37500, unpaid: 2500, noShows: 0 },
]

export function customerByName(name: string) {
  return CUSTOMERS.find(c => c.name === name)
}

// Past bookings shown in customer history (today's come from TODAY_BOOKINGS)
export const PAST_BOOKINGS: Booking[] = [
  { id: 'p1', ref: 'TRF-3H2A', customer: 'Aisha Hassan', phone: '+254 756 789 012', pitch: 'Pitch B', pitchType: '7-a-side', date: 'Sun 20 Sep', time: '16:00–17:00', duration: '1h', status: 'completed', payment: 'paid', amount: 2500, paid: 2500, source: 'walkin' },
  { id: 'p2', ref: 'TRF-7Q1Z', customer: 'Aisha Hassan', phone: '+254 756 789 012', pitch: 'Pitch A', pitchType: '5-a-side', date: 'Sat 12 Sep', time: '18:00–19:00', duration: '1h', status: 'noshow', payment: 'unpaid', amount: 3500, paid: 0, source: 'app' },
  { id: 'p3', ref: 'TRF-2K8M', customer: 'Aisha Hassan', phone: '+254 756 789 012', pitch: 'Pitch A', pitchType: '5-a-side', date: 'Sat 5 Sep', time: '19:00–20:00', duration: '1h', status: 'noshow', payment: 'waived', amount: 3500, paid: 0, source: 'app' },
  { id: 'p4', ref: 'TRF-9B4D', customer: 'Brian Otieno', phone: '+254 712 345 678', pitch: 'Pitch A', pitchType: '5-a-side', date: 'Mon 21 Sep', time: '08:00–09:00', duration: '1h', status: 'completed', payment: 'paid', amount: 2500, paid: 2500, source: 'phone' },
  { id: 'p5', ref: 'TRF-4C6E', customer: 'Dennis Kamau', phone: '+254 767 890 123', pitch: 'Pitch A', pitchType: '5-a-side', date: 'Sat 19 Sep', time: '18:00–19:00', duration: '1h', status: 'noshow', payment: 'unpaid', amount: 3500, paid: 0, source: 'app' },
]

export function bookingsFor(name: string) {
  return [...TODAY_BOOKINGS, ...PAST_BOOKINGS].filter(b => b.customer === name)
}

/** Start hour of a booking, e.g. "18:00–19:00" → 18 */
export function startHour(b: Booking) {
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

export function findBooking(ref: string) {
  return [...TODAY_BOOKINGS, ...PAST_BOOKINGS].find(b => b.ref === ref)
}

/** Look up a customer from the phone segment used in URLs */
export function customerByPhoneParam(param: string) {
  return CUSTOMERS.find(c => phoneToParam(c.phone) === param)
}
