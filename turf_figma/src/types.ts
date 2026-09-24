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
