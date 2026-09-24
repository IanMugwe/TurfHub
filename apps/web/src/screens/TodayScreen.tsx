import { useEffect, useState } from 'react'
import { TODAY_BOOKINGS, PENDING_REQUESTS, PAST_UNPAID, VENUE } from '../data'
import { StatusPill, PayPill } from '../components/Pill'
import StatCard from '../components/StatCard'
import Skeleton from '../components/Skeleton'
import { NoShowBadge, Countdown, type RequestDecision } from './BookingRequestsScreen'
import type { Booking } from '../types'

const SOURCE_ICON: Record<string, string> = { walkin: '🚶', phone: '📞', whatsapp: '💬', app: '📱' }

export default function TodayScreen({ userInitials, onBookingTap, decisions, onDecide, onSeeRequests }: {
  userInitials: string
  onBookingTap: (b: Booking) => void
  decisions: Record<string, RequestDecision>
  onDecide: (id: string, d: RequestDecision) => void
  onSeeRequests: () => void
}) {
  // Simulated first load so the skeleton state is visible
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700)
    return () => clearTimeout(t)
  }, [])

  const visibleRequests = PENDING_REQUESTS.filter(r => !decisions[r.id])

  // Reflect accepted/rejected requests in the list
  const upNext = TODAY_BOOKINGS
    .filter(b => decisions[b.id] !== 'rejected')
    .map(b => (decisions[b.id] === 'accepted' ? { ...b, status: 'confirmed' as const } : b))
    .filter(b => b.status === 'confirmed' || b.status === 'pending')
    .slice(0, 6)
  const confirmed = TODAY_BOOKINGS.filter(b => b.status === 'confirmed')

  return (
    <div>
      {/* Header */}
      <div style={{ background: 'var(--color-primary)', padding: '52px 20px 20px' }}>
        <div className="flex items-center justify-between mb-1">
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 500, marginBottom: 2 }}>Tue 22 Sep 2026</div>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>{VENUE.name}</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.15)', padding: '2px 8px', borderRadius: 20 }}>▾</span>
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 1 }}>{VENUE.area}</div>
          </div>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, color: 'var(--color-primary-dark)', flexShrink: 0 }}>{userInitials}</div>
        </div>
      </div>

      <div style={{ padding: '16px 16px 0' }}>
        {loading ? <TodaySkeleton /> : <>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          <StatCard label="Bookings today" value={`${confirmed.length}`} sub={`of ${TODAY_BOOKINGS.length} total`} />
          <StatCard label="Occupancy" value="72%" sub="21 of 29 hours" />
          <StatCard label="Collected" value="KES 31,000" sub="today" valueColor="var(--color-primary)" />
          <StatCard label="Unpaid" value="KES 7,500" sub="3 bookings" valueColor="var(--color-noshow)" />
        </div>

        {/* Needs attention */}
        {(visibleRequests.length > 0 || PAST_UNPAID.length > 0) && (
          <section style={{ marginBottom: 20 }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)' }}>Needs attention</span>
              {PENDING_REQUESTS.length > 0 && (
                <button onClick={onSeeRequests} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: '4px 0' }}>
                  All requests ›
                </button>
              )}
            </div>

            {visibleRequests.map(r => (
              <div key={r.id} style={{ background: 'var(--color-pending-bg)', border: '1px solid var(--color-pending-border)', borderRadius: 12, padding: '12px 14px', marginBottom: 8 }}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div style={{ flex: 1 }}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{r.customer}</span>
                      <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>{SOURCE_ICON[r.source]} via app</span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--color-muted)', marginTop: 2 }}>{r.pitch} · {r.time} · KES {r.amount.toLocaleString()}</div>
                    <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: 6 }}>
                      <NoShowBadge name={r.customer} />
                      <Countdown expiresIn={r.expiresIn} />
                    </div>
                  </div>
                  <StatusPill status="pending" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => onDecide(r.id, 'accepted')}
                    style={{ flex: 1, padding: '9px', borderRadius: 8, border: 'none', background: 'var(--color-primary)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                    Accept
                  </button>
                  <button onClick={() => onDecide(r.id, 'rejected')}
                    style={{ flex: 1, padding: '9px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-noshow)', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                    Reject
                  </button>
                </div>
              </div>
            ))}

            {PAST_UNPAID.map(b => (
              <button key={b.id} onClick={() => onBookingTap(b)} className="w-full text-left"
                style={{ width: '100%', background: 'var(--color-noshow-bg)', border: '1px solid var(--color-noshow-border)', borderRadius: 12, padding: '12px 14px', marginBottom: 8, cursor: 'pointer', display: 'block' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{b.customer}</div>
                    <div style={{ fontSize: 13, color: 'var(--color-muted)' }}>{b.pitch} · {b.time} · KES {b.amount.toLocaleString()} unpaid</div>
                  </div>
                  <PayPill status="unpaid" />
                </div>
              </button>
            ))}
          </section>
        )}

        {/* Up next */}
        <section style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', marginBottom: 10 }}>Up next</div>
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 14, overflow: 'hidden' }}>
            {upNext.map((b, i) => (
              <button key={b.id} onClick={() => onBookingTap(b)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderBottom: i < upNext.length - 1 ? '1px solid var(--color-border)' : 'none', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                {/* Time */}
                <div style={{ width: 56, flexShrink: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-primary)' }}>{b.time.split('–')[0]}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-muted)' }}>{b.pitch.replace('Pitch ', 'P')}</div>
                </div>
                {/* Customer */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.customer}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>{b.duration} · {SOURCE_ICON[b.source]}</div>
                </div>
                {/* Badges */}
                <div className="flex gap-1 flex-shrink-0">
                  <StatusPill status={b.status} />
                  <PayPill status={b.payment} />
                </div>
              </button>
            ))}
          </div>
        </section>
        </>}
      </div>
    </div>
  )
}

function TodaySkeleton() {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 14, padding: 14 }}>
            <Skeleton width={80} height={12} />
            <Skeleton width={96} height={24} style={{ marginTop: 8 }} />
            <Skeleton width={60} height={10} style={{ marginTop: 8 }} />
          </div>
        ))}
      </div>
      <Skeleton width={110} height={14} style={{ marginBottom: 12 }} />
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 14, overflow: 'hidden' }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-3" style={{ padding: '14px', borderTop: i > 0 ? '1px solid var(--color-border)' : 'none' }}>
            <Skeleton width={44} height={28} />
            <div style={{ flex: 1 }}>
              <Skeleton width="60%" height={13} />
              <Skeleton width="35%" height={10} style={{ marginTop: 6 }} />
            </div>
            <Skeleton width={70} height={20} radius={10} />
          </div>
        ))}
      </div>
    </div>
  )
}

