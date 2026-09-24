import { useState } from 'react'
import { PENDING_REQUESTS, customerByName } from '../data'
import EmptyState from '../components/EmptyState'
import type { Booking } from '../types'

export type RequestDecision = 'accepted' | 'rejected'

export function NoShowBadge({ name }: { name: string }) {
  const noShows = customerByName(name)?.noShows ?? 0
  if (noShows === 0) return <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>No no-shows</span>
  return (
    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-noshow)', background: 'var(--color-noshow-bg)', padding: '2px 8px', borderRadius: 10 }}>
      ⚠ {noShows} no-show{noShows > 1 ? 's' : ''}
    </span>
  )
}

export function Countdown({ expiresIn }: { expiresIn?: string }) {
  if (!expiresIn) return null
  return <span style={{ fontSize: 12, color: 'var(--color-pending)', fontWeight: 500 }}>⏱ auto-declines in {expiresIn}</span>
}

export default function BookingRequestsScreen({ decisions, onDecide, onBack, onBookingTap }: {
  decisions: Record<string, RequestDecision>
  onDecide: (id: string, d: RequestDecision) => void
  onBack: () => void
  onBookingTap: (b: Booking) => void
}) {
  const [toast, setToast] = useState<string | null>(null)
  const open = PENDING_REQUESTS.filter(r => !decisions[r.id])

  function decide(r: Booking, d: RequestDecision) {
    onDecide(r.id, d)
    setToast(d === 'accepted' ? `Accepted ${r.customer} · ${r.time}. They'll get an SMS.` : `Rejected ${r.customer}'s request.`)
    setTimeout(() => setToast(null), 2500)
  }

  return (
    <div>
      <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: '52px 16px 14px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: 15, fontWeight: 600, cursor: 'pointer', padding: '6px 0', marginBottom: 4 }}>‹ Today</button>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text)' }}>
          Booking requests {open.length > 0 && <span style={{ color: 'var(--color-muted)', fontWeight: 500 }}>({open.length})</span>}
        </div>
        <div style={{ fontSize: 13, color: 'var(--color-muted)', marginTop: 2 }}>Customers who booked in the app and are waiting for you.</div>
      </div>

      {toast && (
        <div style={{ margin: '12px 16px 0', background: 'var(--color-text)', color: 'var(--color-surface)', borderRadius: 10, padding: '10px 14px', fontSize: 13, fontWeight: 500 }}>
          {toast}
        </div>
      )}

      {open.length === 0 ? (
        <EmptyState icon="🎉" title="All caught up" message="No booking requests are waiting. New ones from the app will show up here." action="Back to Today" onAction={onBack} />
      ) : (
        <div style={{ padding: '12px 16px' }}>
          {open.map(r => (
            <div key={r.id} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '14px', marginBottom: 10 }}>
              <button onClick={() => onBookingTap(r)} style={{ width: '100%', background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer' }}>
                <div className="flex items-center justify-between gap-2">
                  <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)' }}>{r.customer}</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)', fontVariantNumeric: 'tabular-nums' }}>KES {r.amount.toLocaleString()}</span>
                </div>
                <div style={{ fontSize: 14, color: 'var(--color-muted)', marginTop: 3 }}>{r.pitch} · {r.pitchType} · {r.date} · {r.time}</div>
                <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>📱 via app</span>
                  <NoShowBadge name={r.customer} />
                </div>
              </button>

              <div style={{ margin: '10px 0', paddingTop: 10, borderTop: '1px solid var(--color-border)' }}>
                <Countdown expiresIn={r.expiresIn} />
              </div>

              <div className="flex gap-2">
                <button onClick={() => decide(r, 'rejected')}
                  style={{ flex: 1, padding: '11px', minHeight: 44, borderRadius: 10, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-noshow)', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
                  Reject
                </button>
                <button onClick={() => decide(r, 'accepted')}
                  style={{ flex: 2, padding: '11px', minHeight: 44, borderRadius: 10, border: 'none', background: 'var(--color-primary)', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
                  Accept
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
