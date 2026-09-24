import { useState } from 'react'
import { bookingsFor } from '../../mocks/data'
import StatCard from '../../ui/StatCard'
import EmptyState from '../../ui/EmptyState'
import { StatusPill, PayPill } from '../../ui/Pill'
import type { Booking, Customer } from '../../types'
import { useIsDesktop } from '../../lib/useIsDesktop'

export default function CustomerDetailScreen({ customer: c, flagged, onToggleFlag, onBack, onBookingTap, onNewBooking }: {
  customer: Customer
  flagged: boolean
  onToggleFlag: () => void
  onBack: () => void
  onBookingTap: (b: Booking) => void
  onNewBooking: () => void
}) {
  const desktop = useIsDesktop()
  const [notes, setNotes] = useState(c.notes ?? '')
  const history = bookingsFor(c.name)
  const initials = c.name.split(' ').map(w => w[0]).slice(0, 2).join('')

  return (
    <div style={{ paddingBottom: desktop ? 0 : 90 }}>
      {/* Header */}
      <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: desktop ? '28px 32px 16px' : '52px 16px 16px', ...(desktop && { background: 'transparent', borderBottom: 'none' }) }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: 15, fontWeight: 600, cursor: 'pointer', padding: '6px 0', marginBottom: 8 }}>‹ Customers</button>
        <div className="flex items-center gap-3">
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, flexShrink: 0 }}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text)' }}>{c.name}</span>
              {flagged && <span style={{ fontSize: 16 }}>🚩</span>}
            </div>
            <div style={{ fontSize: 14, color: 'var(--color-muted)' }}>{c.phone}</div>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <a href={`tel:${c.phone}`} style={{ flex: 1, padding: '10px', borderRadius: 10, background: 'var(--color-primary-light)', color: 'var(--color-primary)', fontSize: 14, fontWeight: 600, textDecoration: 'none', textAlign: 'center' }}>📞 Call</a>
          <a href={`https://wa.me/${c.phone.replace(/\D/g, '')}`} style={{ flex: 1, padding: '10px', borderRadius: 10, background: 'var(--color-whatsapp-bg)', color: 'var(--color-whatsapp)', fontSize: 14, fontWeight: 600, textDecoration: 'none', textAlign: 'center' }}>💬 WhatsApp</a>
        </div>
      </div>

      <div style={{ padding: desktop ? '24px 32px 0' : '14px 16px 0' }}>
        {flagged && (
          <div style={{ background: 'var(--color-noshow-bg)', border: '1px solid var(--color-noshow-border)', borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-noshow)' }}>🚩 Flagged customer</div>
            <div style={{ fontSize: 13, color: 'var(--color-muted)', marginTop: 2 }}>Staff will see a warning when booking for this customer. App requests need your approval.</div>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: desktop ? 'repeat(4, minmax(0, 1fr))' : '1fr 1fr', gap: desktop ? 16 : 10, marginBottom: 20 }}>
          <StatCard label="Visits" value={`${c.visits}`} sub={`Last: ${c.lastVisit}`} />
          <StatCard label="Total paid" value={`KES ${c.totalPaid.toLocaleString()}`} valueColor="var(--color-primary)" />
          <StatCard label="No-shows" value={`${c.noShows}`} valueColor={c.noShows > 0 ? 'var(--color-noshow)' : undefined} sub={c.noShows > 0 ? `${Math.round((c.noShows / c.visits) * 100)}% of bookings` : 'Always turns up'} />
          <StatCard label="Unpaid balance" value={`KES ${c.unpaid.toLocaleString()}`} valueColor={c.unpaid > 0 ? 'var(--color-noshow)' : undefined} />
        </div>

        {/* History */}
        <section style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', marginBottom: 10 }}>Booking history</div>
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 14, overflow: 'hidden' }}>
            {history.length === 0 ? (
              <EmptyState icon="📅" title="No bookings yet" message="Bookings for this customer will appear here." />
            ) : history.map((b, i) => (
              <button key={b.id} onClick={() => onBookingTap(b)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderTop: i > 0 ? '1px solid var(--color-border)' : 'none', borderLeft: 'none', borderRight: 'none', borderBottom: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{b.date} · {b.time}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>{b.pitch} · KES {b.amount.toLocaleString()}</div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <StatusPill status={b.status} />
                  <PayPill status={b.payment} />
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Notes */}
        <section style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', marginBottom: 10 }}>Notes</div>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="e.g. Prefers Pitch A, pays by M-Pesa"
            style={{ width: '100%', padding: '12px', borderRadius: 12, border: '1px solid var(--color-border)', background: 'var(--color-surface)', fontSize: 14, color: 'var(--color-text)', outline: 'none', resize: 'none', fontFamily: 'inherit', lineHeight: 1.5 }} />
        </section>

        {/* Flag */}
        <button onClick={onToggleFlag}
          style={{ width: '100%', padding: '12px', minHeight: 44, borderRadius: 12, border: `1px solid ${flagged ? 'var(--color-border)' : 'var(--color-noshow-border)'}`, background: 'transparent', color: flagged ? 'var(--color-muted)' : 'var(--color-noshow)', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
          {flagged ? 'Remove flag' : '🚩 Flag customer'}
        </button>
      </div>

      {/* Sticky CTA */}
      <div style={{ position: desktop ? 'static' : 'absolute', bottom: 0, left: 0, right: 0, background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', padding: desktop ? '8px 32px 0' : '12px 16px 20px', zIndex: 100, ...(desktop && { display: 'flex', justifyContent: 'flex-end', background: 'transparent', borderTop: 'none' }) }}>
        <button onClick={onNewBooking}
          style={{ width: desktop ? 'auto' : '100%', padding: desktop ? '13px 28px' : '15px', borderRadius: 14, border: 'none', background: 'var(--color-primary)', color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
          + New booking for this customer
        </button>
      </div>
    </div>
  )
}
