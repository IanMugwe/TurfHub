import { customerByName } from '../../mocks/data'
import { useDemoStore } from '../../app/DemoStore'
import { rangeOf } from '../../lib/bookings'
import { todayKey } from '../../lib/dates'
import { useToast } from '../../ui/Toast'
import EmptyState from '../../ui/EmptyState'
import type { Booking } from '../../types'
import { useIsDesktop } from '../../lib/useIsDesktop'
import ResponsiveGrid from '../../ui/ResponsiveGrid'

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

export default function BookingRequestsScreen({ onBack, onBookingTap }: {
  onBack: () => void
  onBookingTap: (b: Booking) => void
}) {
  const desktop = useIsDesktop()
  const { bookings, decideRequest } = useDemoStore()
  const toast = useToast()
  const today = todayKey()
  const open = bookings
    .filter(b => b.status === 'pending' && b.dateKey >= today)
    .sort((a, b) => a.dateKey.localeCompare(b.dateKey) || rangeOf(a)[0] - rangeOf(b)[0])

  function decide(r: Booking, d: RequestDecision) {
    decideRequest(r.ref, d)
    toast(d === 'accepted' ? `Accepted ${r.customer} · ${r.time}. They'll get an SMS.` : `Rejected ${r.customer}'s request.`)
  }

  return (
    <div>
      <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: desktop ? '28px 32px 14px' : '52px 16px 14px', ...(desktop && { background: 'transparent', borderBottom: 'none' }) }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: 15, fontWeight: 600, cursor: 'pointer', padding: '6px 0', marginBottom: 4 }}>‹ Today</button>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text)' }}>
          Booking requests {open.length > 0 && <span style={{ color: 'var(--color-muted)', fontWeight: 500 }}>({open.length})</span>}
        </div>
        <div style={{ fontSize: 13, color: 'var(--color-muted)', marginTop: 2 }}>Customers who booked in the app and are waiting for you.</div>
      </div>

      {open.length === 0 ? (
        <EmptyState icon="🎉" title="All caught up" message="No booking requests are waiting. New ones from the app will show up here." action="Back to Today" onAction={onBack} />
      ) : (
        <div style={{ padding: desktop ? '20px 32px' : '12px 16px' }}>
          <ResponsiveGrid min={340}>
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
          </ResponsiveGrid>
        </div>
      )}
    </div>
  )
}
