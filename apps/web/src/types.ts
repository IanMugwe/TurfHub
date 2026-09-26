export type BookingStatus = 'confirmed' | 'pending' | 'completed' | 'noshow' | 'cancelled'
export type PaymentStatus = 'unpaid' | 'partpaid' | 'paid' | 'waived'
export type BookingSource = 'walkin' | 'phone' | 'whatsapp' | 'app'

export interface Booking {
  id: string
  ref: string
  venueId: string
  pitchId: string
  /** Links bookings created together with "Repeat weekly" */
  seriesId?: string
  customer: string
  phone: string
  pitch: string
  pitchType: string
  /** Local calendar date, "YYYY-MM-DD" */
  dateKey: string
  /** Display label, e.g. "Tue 22 Sep" */
  date: string
  time: string
  duration: string
  status: BookingStatus
  payment: PaymentStatus
  amount: number
  paid: number
  source: BookingSource
  notes?: string
  expiresIn?: string
  series?: { index: number; total: number }
  payments?: Payment[]
}

export type PaymentMethod = 'cash' | 'mpesa' | 'other'

export interface Payment {
  amount: number
  method: PaymentMethod
  /** M-Pesa confirmation code, e.g. "SIJ4X8Y2ZQ" */
  code?: string
  /** "14:05" */
  at: string
}

/** A booking as the player sees it in My Bookings (can be at any venue) */
export interface PlayerBooking {
  ref: string
  venueId: string
  venue: string
  area: string
  /** "Pitch A · 5-a-side" */
  pitch: string
  dateKey: string
  date: string
  time: string
  price: number
  status: 'confirmed' | 'pending' | 'completed' | 'noshow' | 'cancelled'
}

export type StaffRole = 'owner' | 'manager'

/** Who is signed in; decides which app they see */
export type Session =
  | { role: 'staff'; staffRole: StaffRole; name: string; phone: string }
  | { role: 'customer'; name: string; phone: string }

export interface Customer {
  name: string
  phone: string
  visits: number
  lastVisit: string
  totalPaid: number
  unpaid: number
  noShows: number
  notes?: string
}

export type PitchType = '5-a-side' | '7-a-side' | '11-a-side'

export interface Pitch {
  id: string
  name: string
  type: PitchType
  priceOffPeak: number
  pricePeak: number
  active: boolean
}

/** Opening hours for one weekday, as whole hours (e.g. 6 → 06:00, 23 → 23:00) */
export interface DayHours {
  open: number
  close: number
  closed: boolean
}

export interface BlockedPeriod {
  id: string
  /** A pitch id, or 'all' for the whole venue */
  pitchId: string
  dateKey: string
  startH: number
  endH: number
  reason: string
}

export interface TeamMember {
  name: string
  phone: string
  role: StaffRole
  status: 'active' | 'invited'
}

export type NotificationKey = 'newRequests' | 'cancellations' | 'dailySummary' | 'paymentReminders'

export interface Venue {
  id: string
  slug: string
  name: string
  area: string
  address: string
  description: string
  phone: string
  lat: number
  lng: number
  images: string[]
  amenities: string[]
  status: 'approved' | 'pending'
  pitches: Pitch[]
  /** Index 0 = Sunday … 6 = Saturday */
  hours: DayHours[]
  peak: { start: number; end: number; weekendsAllDay: boolean }
  blocked: BlockedPeriod[]
  /** Free cancellation up to this many hours before the start */
  cancellationHours: number
  /** App bookings confirm instantly instead of waiting for approval */
  autoConfirm: boolean
  team: TeamMember[]
  notifications: Record<NotificationKey, boolean>
  /** Rating from reviews collected before the demo data starts */
  baseRating: number
  baseReviewCount: number
}

export interface Review {
  id: string
  venueId: string
  author: string
  rating: number
  comment: string
  dateKey: string
  /** The booking being reviewed, so each booking is reviewed once */
  bookingRef?: string
}
