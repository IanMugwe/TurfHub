import type { BookingStatus, PaymentStatus } from '../types'

const STATUS_MAP: Record<BookingStatus, { label: string; color: string; bg: string }> = {
  confirmed: { label: 'Confirmed', color: 'var(--color-confirmed)', bg: 'var(--color-confirmed-bg)' },
  pending:   { label: 'Pending', color: 'var(--color-pending)', bg: 'var(--color-pending-bg)' },
  completed: { label: 'Completed', color: 'var(--color-completed)', bg: 'var(--color-completed-bg)' },
  noshow:    { label: 'No-show', color: 'var(--color-noshow)', bg: 'var(--color-noshow-bg)' },
  cancelled: { label: 'Cancelled', color: 'var(--color-completed)', bg: 'var(--color-completed-bg)' },
}

const PAY_MAP: Record<PaymentStatus, { label: string; color: string; bg: string; border?: string }> = {
  unpaid:   { label: 'Unpaid', color: 'var(--color-unpaid)', bg: 'transparent', border: 'var(--color-unpaid)' },
  partpaid: { label: 'Partly paid', color: 'var(--color-partpaid)', bg: 'transparent', border: 'var(--color-partpaid)' },
  paid:     { label: 'Paid ✓', color: 'var(--color-paid)', bg: 'var(--color-paid-bg)', border: 'transparent' },
  waived:   { label: 'Waived', color: 'var(--color-waived)', bg: 'var(--color-waived-bg)', border: 'transparent' },
}

export function StatusPill({ status }: { status: BookingStatus }) {
  const m = STATUS_MAP[status]
  return (
    <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 8px', borderRadius: 20, background: m.bg, color: m.color, lineHeight: 1.4, textDecoration: status === 'cancelled' ? 'line-through' : 'none', whiteSpace: 'nowrap' }}>
      {m.label}
    </span>
  )
}

export function PayPill({ status }: { status: PaymentStatus }) {
  const m = PAY_MAP[status]
  return (
    <span style={{ fontSize: 12, fontWeight: 500, padding: '2px 7px', borderRadius: 20, background: m.bg, color: m.color, border: `1px solid ${m.border || 'transparent'}`, lineHeight: 1.4, whiteSpace: 'nowrap' }}>
      {m.label}
    </span>
  )
}
