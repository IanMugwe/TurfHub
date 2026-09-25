export type BookingStatus = 'confirmed' | 'pending' | 'completed' | 'noshow' | 'cancelled'
export type PaymentStatus = 'unpaid' | 'partpaid' | 'paid' | 'waived'
export type BookingSource = 'walkin' | 'phone' | 'whatsapp' | 'app'

export interface Booking {
  id: string
  ref: string
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
