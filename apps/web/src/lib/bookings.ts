import type { Booking, PaymentStatus } from '../types'

/** "15:30" → 930 */
export function toMinutes(t: string) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

/** "HH:MM–HH:MM" as a [start, end) range in minutes */
export function rangeOf(b: { time: string }) {
  const [s, e] = b.time.split('–').map(toMinutes)
  return [s, e] as const
}

/** Bookings that still hold their slot */
export function isActive(b: Booking) {
  return b.status !== 'cancelled'
}

export function paymentStatusFor(amount: number, paid: number): PaymentStatus {
  if (paid >= amount) return 'paid'
  return paid > 0 ? 'partpaid' : 'unpaid'
}

/** Amount still owed; nothing is owed once a balance is waived */
export function balanceOf(b: Booking) {
  return b.payment === 'waived' ? 0 : Math.max(0, b.amount - b.paid)
}
