import { useState } from 'react'
import EmptyState from '../../ui/EmptyState'
import { useIsDesktop } from '../../lib/useIsDesktop'
import ResponsiveGrid from '../../ui/ResponsiveGrid'

const UPCOMING = [
  { ref: 'TRF-4K7Q', venue: 'Greenfield Arena', area: 'Kilimani', pitch: 'Pitch A · 5-a-side', date: 'Tue 22 Sep', time: '14:00–15:00', price: 2500, status: 'confirmed' as const, canCancel: true },
  { ref: 'TRF-9M2X', venue: 'Westlands Turf', area: 'Westlands', pitch: 'Pitch B · 7-a-side', date: 'Thu 24 Sep', time: '19:00–20:00', price: 3500, status: 'pending' as const, canCancel: true },
  { ref: 'TRF-5L3N', venue: 'Lavington Sports', area: 'Lavington', pitch: 'Pitch C · 11-a-side', date: 'Sat 26 Sep', time: '10:00–12:00', price: 6000, status: 'confirmed' as const, canCancel: false },
]
const PAST = [
  { ref: 'TRF-8W1P', venue: 'Greenfield Arena', area: 'Kilimani', pitch: 'Pitch A · 5-a-side', date: 'Mon 21 Sep', time: '08:00–09:00', price: 2500, status: 'completed' as const },
  { ref: 'TRF-2R5T', venue: 'Westlands Turf', area: 'Westlands', pitch: 'Pitch B · 7-a-side', date: 'Sat 19 Sep', time: '17:00–18:00', price: 3500, status: 'completed' as const },
  { ref: 'TRF-6D4K', venue: 'Greenfield Arena', area: 'Kilimani', pitch: 'Pitch A · 5-a-side', date: 'Fri 18 Sep', time: '19:00–20:00', price: 3500, status: 'noshow' as const },
]

const STATUS_COLOR: Record<string, { color: string; bg: string }> = {
  confirmed: { color: 'var(--color-confirmed)', bg: 'var(--color-confirmed-bg)' },
  pending:   { color: 'var(--color-pending)', bg: 'var(--color-pending-bg)' },
  completed: { color: 'var(--color-completed)', bg: 'var(--color-completed-bg)' },
  noshow:    { color: 'var(--color-noshow)', bg: 'var(--color-noshow-bg)' },
}

export default function MyBookingsScreen({ onBack }: { onBack: () => void }) {
  const desktop = useIsDesktop()
  const [tab, setTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming')

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
        {tab === 'cancelled' && (
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
                  <button style={{ flex: 1, padding: '9px', borderRadius: 8, background: 'transparent', border: '1px solid var(--color-noshow-border)', color: 'var(--color-noshow)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
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

        {tab === 'past' && PAST.map(b => (
          <div key={b.ref} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 16, marginBottom: 12, padding: '14px' }}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)' }}>{b.venue}</div>
                <div style={{ fontSize: 13, color: 'var(--color-muted)' }}>{b.pitch}</div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 8px', borderRadius: 20, background: STATUS_COLOR[b.status].bg, color: STATUS_COLOR[b.status].color, flexShrink: 0 }}>
                {b.status === 'completed' ? 'Completed' : 'No-show'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div style={{ fontSize: 13, color: 'var(--color-muted)' }}>{b.date} · {b.time}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>KES {b.price.toLocaleString()}</div>
            </div>
            {b.status === 'completed' && (
              <button style={{ marginTop: 8, padding: '7px 14px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: 13, cursor: 'pointer' }}>
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
