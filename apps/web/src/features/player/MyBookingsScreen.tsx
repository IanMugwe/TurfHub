import { useState } from 'react'
import EmptyState from '../../ui/EmptyState'
import { useIsDesktop } from '../../lib/useIsDesktop'
import ResponsiveGrid from '../../ui/ResponsiveGrid'
import { useDemoStore } from '../../app/DemoStore'
import { NOW_HOUR, startHour } from '../../mocks/data'
import { todayKey } from '../../lib/dates'
import { COMING_SOON, useToast } from '../../ui/Toast'
import type { PlayerBooking } from '../../types'

const byDate = (a: PlayerBooking, b: PlayerBooking) => a.dateKey.localeCompare(b.dateKey) || a.time.localeCompare(b.time)

const STATUS_COLOR: Record<string, { color: string; bg: string }> = {
  confirmed: { color: 'var(--color-confirmed)', bg: 'var(--color-confirmed-bg)' },
  pending:   { color: 'var(--color-pending)', bg: 'var(--color-pending-bg)' },
  completed: { color: 'var(--color-completed)', bg: 'var(--color-completed-bg)' },
  noshow:    { color: 'var(--color-noshow)', bg: 'var(--color-noshow-bg)' },
  cancelled: { color: 'var(--color-completed)', bg: 'var(--color-completed-bg)' },
}
const STATUS_LABEL: Record<PlayerBooking['status'], string> = { confirmed: 'Completed', pending: 'Pending', completed: 'Completed', noshow: 'No-show', cancelled: 'Cancelled' }

export default function MyBookingsScreen({ onBack }: { onBack: () => void }) {
  const desktop = useIsDesktop()
  const [tab, setTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming')
  const { playerBookings, cancelPlayerBooking } = useDemoStore()
  const toast = useToast()
  const today = todayKey()

  const live = (b: PlayerBooking) => b.status === 'confirmed' || b.status === 'pending'
  const UPCOMING = playerBookings.filter(b => live(b) && b.dateKey >= today).sort(byDate)
    // Free cancellation closes 2 hours before the start (implementation plan D6)
    .map(b => ({ ...b, canCancel: !(b.dateKey === today && startHour(b) - NOW_HOUR < 2) }))
  const PAST = playerBookings.filter(b => b.status === 'completed' || b.status === 'noshow' || (live(b) && b.dateKey < today)).sort(byDate).reverse()
  const CANCELLED = playerBookings.filter(b => b.status === 'cancelled').sort(byDate).reverse()

  function cancel(b: PlayerBooking) {
    cancelPlayerBooking(b.ref)
    toast(`Cancelled ${b.venue} · ${b.date} ${b.time.split('–')[0]}`)
  }

  return (
    <div>
      <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: desktop ? '28px 32px 0' : '52px 16px 0', ...(desktop && { background: 'transparent', borderBottom: 'none' }) }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text)', marginBottom: 14 }}>My Bookings</div>
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--color-border)' }}>
          {(['upcoming', 'past', 'cancelled'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ flex: 1, padding: '10px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 15, fontWeight: tab === t ? 700 : 400, color: tab === t ? 'var(--color-primary)' : 'var(--color-muted)', borderBottom: tab === t ? '2px solid var(--color-primary)' : '2px solid transparent', textTransform: 'capitalize' }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: desktop ? '24px 32px' : '16px' }}>
        {tab === 'upcoming' && UPCOMING.length === 0 && (
          <EmptyState icon="⚽" title="No upcoming bookings" message="Find a pitch near you and book a slot in seconds." action="Find a pitch" onAction={onBack} />
        )}
        {tab === 'cancelled' && CANCELLED.length === 0 && (
          <EmptyState icon="📭" title="No cancelled bookings" message="Bookings you cancel, or that a venue declines, will show up here." action="Find a pitch" onAction={onBack} />
        )}
        <ResponsiveGrid>
        {tab === 'upcoming' && UPCOMING.map(b => (
          <div key={b.ref} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 16, marginBottom: 12, overflow: 'hidden' }}>
            {/* Green header stripe */}
            <div style={{ background: 'var(--color-primary)', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{b.venue}</div>
              <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 8px', borderRadius: 20, background: STATUS_COLOR[b.status].bg, color: STATUS_COLOR[b.status].color }}>
                {b.status === 'confirmed' ? 'Confirmed' : 'Pending'}
              </span>
            </div>
            <div style={{ padding: '12px 14px' }}>
              <div style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 6 }}>{b.area} · {b.pitch}</div>
              <div className="flex justify-between items-center mb-3">
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)' }}>{b.date}</div>
                  <div style={{ fontSize: 13, color: 'var(--color-muted)' }}>{b.time}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-primary)' }}>KES {b.price.toLocaleString()}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>Pay at venue</div>
                </div>
              </div>
              <div className="flex gap-2">
                <a href="https://maps.google.com" style={{ flex: 1, padding: '9px', borderRadius: 8, background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)', fontSize: 13, fontWeight: 500, textDecoration: 'none', textAlign: 'center', display: 'block' }}>🗺 Directions</a>
                {b.canCancel ? (
                  <button onClick={() => cancel(b)} style={{ flex: 1, padding: '9px', borderRadius: 8, background: 'transparent', border: '1px solid var(--color-noshow-border)', color: 'var(--color-noshow)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
                ) : (
                  <button disabled title="Within cancellation window" style={{ flex: 1, padding: '9px', borderRadius: 8, background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-muted-light)', fontSize: 13, cursor: 'not-allowed' }}>Cancel</button>
                )}
              </div>
              {!b.canCancel && (
                <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 6 }}>⏱ Cancellation window has closed (less than 2 hours away)</div>
              )}
            </div>
          </div>
        ))}

        {(tab === 'past' ? PAST : tab === 'cancelled' ? CANCELLED : []).map(b => (
          <div key={b.ref} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 16, marginBottom: 12, padding: '14px' }}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)' }}>{b.venue}</div>
                <div style={{ fontSize: 13, color: 'var(--color-muted)' }}>{b.pitch}</div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 8px', borderRadius: 20, background: STATUS_COLOR[b.status === 'confirmed' ? 'completed' : b.status].bg, color: STATUS_COLOR[b.status === 'confirmed' ? 'completed' : b.status].color, flexShrink: 0 }}>
                {STATUS_LABEL[b.status]}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div style={{ fontSize: 13, color: 'var(--color-muted)' }}>{b.date} · {b.time}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>KES {b.price.toLocaleString()}</div>
            </div>
            {b.status === 'completed' && (
              <button onClick={() => toast(`Reviews: ${COMING_SOON.toLowerCase()}`)} style={{ marginTop: 8, padding: '7px 14px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: 13, cursor: 'pointer' }}>
                ★ Leave a review
              </button>
            )}
          </div>
        ))}
        </ResponsiveGrid>
      </div>
    </div>
  )
}
