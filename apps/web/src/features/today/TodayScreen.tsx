import { useEffect, useState } from 'react'
import { NOW_HOUR, startHour } from '../../mocks/data'
import { activePitches, hoursFor } from '../../lib/venue'
import { useDemoStore } from '../../app/DemoStore'
import { balanceOf, isActive, rangeOf } from '../../lib/bookings'
import { formatDayWithYear, todayKey } from '../../lib/dates'
import { useToast } from '../../ui/Toast'
import { formatKES } from '@turfhub/validation'
import { StatusPill, PayPill } from '../../ui/Pill'
import StatCard from '../../ui/StatCard'
import Skeleton from '../../ui/Skeleton'
import { useIsDesktop } from '../../lib/useIsDesktop'
import { NoShowBadge, Countdown } from '../requests/BookingRequestsScreen'
import type { Booking, Venue } from '../../types'

const SOURCE_ICON: Record<string, string> = { walkin: '🚶', phone: '📞', whatsapp: '💬', app: '📱' }

const byTime = (a: Booking, b: Booking) => a.dateKey.localeCompare(b.dateKey) || rangeOf(a)[0] - rangeOf(b)[0]

export default function TodayScreen({ venue, userInitials, onBookingTap, onSeeRequests, onSwitchVenue }: {
  venue: Venue
  userInitials: string
  onSwitchVenue: () => void
  onBookingTap: (b: Booking) => void
  onSeeRequests: () => void
}) {
  // Simulated first load so the skeleton state is visible
  const desktop = useIsDesktop()
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700)
    return () => clearTimeout(t)
  }, [])

  const { bookings: allBookings, decideRequest } = useDemoStore()
  const bookings = allBookings.filter(b => b.venueId === venue.id)
  const toast = useToast()
  const today = todayKey()

  // Everything below is calculated from the bookings, so it changes as you work
  const todays = bookings.filter(b => b.dateKey === today)
  const visibleRequests = bookings.filter(b => b.status === 'pending' && b.dateKey >= today).sort(byTime)
  const pastUnpaid = todays.filter(b => b.status === 'completed' && balanceOf(b) > 0).sort(byTime)
  const upNext = todays.filter(b => b.status === 'confirmed' || b.status === 'pending').sort(byTime).slice(0, 6)
  const booked = todays.filter(b => b.status === 'confirmed' || b.status === 'completed')
  const bookedHours = todays.filter(isActive).filter(b => b.status !== 'noshow').reduce((h, b) => h + (rangeOf(b)[1] - rangeOf(b)[0]) / 60, 0)
  const todayHours = hoursFor(venue, today)
  const openHours = todayHours.closed ? 0 : activePitches(venue).length * (todayHours.close - todayHours.open)
  const collected = todays.reduce((sum, b) => sum + b.paid, 0)
  // Owed for games that have already started
  const owing = booked.filter(b => startHour(b) <= NOW_HOUR && balanceOf(b) > 0)
  const owed = owing.reduce((sum, b) => sum + balanceOf(b), 0)

  function decide(r: Booking, d: 'accepted' | 'rejected') {
    decideRequest(r.ref, d)
    toast(d === 'accepted' ? `Accepted ${r.customer} · ${r.time}` : `Rejected ${r.customer}'s request`)
  }

  return (
    <div>
      {/* Header */}
      <div style={{ background: 'var(--color-primary)', padding: desktop ? '28px 32px 24px' : '52px 20px 20px', ...(desktop && { margin: '24px 32px 0', borderRadius: 20 }) }}>
        <div className="flex items-center justify-between mb-1">
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 500, marginBottom: 2 }}>{formatDayWithYear(today)}</div>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>{venue.name}</span>
              <button onClick={onSwitchVenue} aria-label="Switch venue" style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.15)', padding: '2px 8px', borderRadius: 20, border: 'none', cursor: 'pointer' }}>▾</button>
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 1 }}>{venue.area}</div>
          </div>
          {/* On desktop the account avatar lives in the top navigation */}
          {!desktop && <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, color: 'var(--color-primary-dark)', flexShrink: 0 }}>{userInitials}</div>}
        </div>
      </div>

      <div style={{ padding: desktop ? '24px 32px 8px' : '16px 16px 0' }}>
        {loading ? <TodaySkeleton desktop={desktop} /> : <>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: desktop ? 'repeat(4, minmax(0, 1fr))' : '1fr 1fr', gap: desktop ? 16 : 10, marginBottom: desktop ? 28 : 20 }}>
          <StatCard label="Bookings today" value={`${booked.length}`} sub={`+ ${visibleRequests.filter(r => r.dateKey === today).length} awaiting approval`} />
          <StatCard label="Occupancy" value={openHours ? `${Math.round((bookedHours / openHours) * 100)}%` : '—'} sub={`${bookedHours} of ${openHours} pitch-hours`} />
          <StatCard label="Collected" value={formatKES(collected)} sub="today" valueColor="var(--color-primary)" />
          <StatCard label="Unpaid" value={formatKES(owed)} sub={`${owing.length} booking${owing.length === 1 ? '' : 's'} played`} valueColor={owed > 0 ? 'var(--color-noshow)' : undefined} />
        </div>

        {/* Desktop: Needs attention and Up next side by side */}
        <div style={desktop ? { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 24, alignItems: 'start' } : undefined}>
        {/* Needs attention */}
        {(visibleRequests.length > 0 || pastUnpaid.length > 0) && (
          <section style={{ marginBottom: 20 }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)' }}>Needs attention</span>
              {visibleRequests.length > 0 && (
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
                    <div style={{ fontSize: 13, color: 'var(--color-muted)', marginTop: 2 }}>{r.dateKey !== today && `${r.date} · `}{r.pitch} · {r.time} · {formatKES(r.amount)}</div>
                    <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: 6 }}>
                      <NoShowBadge name={r.customer} />
                      <Countdown expiresIn={r.expiresIn} />
                    </div>
                  </div>
                  <StatusPill status="pending" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => decide(r, 'accepted')}
                    style={{ flex: 1, padding: '9px', borderRadius: 8, border: 'none', background: 'var(--color-primary)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                    Accept
                  </button>
                  <button onClick={() => decide(r, 'rejected')}
                    style={{ flex: 1, padding: '9px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-noshow)', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                    Reject
                  </button>
                </div>
              </div>
            ))}

            {pastUnpaid.map(b => (
              <button key={b.id} onClick={() => onBookingTap(b)} className="w-full text-left"
                style={{ width: '100%', background: 'var(--color-noshow-bg)', border: '1px solid var(--color-noshow-border)', borderRadius: 12, padding: '12px 14px', marginBottom: 8, cursor: 'pointer', display: 'block' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{b.customer}</div>
                    <div style={{ fontSize: 13, color: 'var(--color-muted)' }}>{b.pitch} · {b.time} · {formatKES(balanceOf(b))} unpaid</div>
                  </div>
                  <PayPill status={b.payment} />
                </div>
              </button>
            ))}
          </section>
        )}

        {/* Up next */}
        <section style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', marginBottom: 10 }}>Up next</div>
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 14, overflow: 'hidden' }}>
            {upNext.map(b => (
              <button key={b.id} onClick={() => onBookingTap(b)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
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
        </div>
        </>}
      </div>
    </div>
  )
}

function TodaySkeleton({ desktop }: { desktop: boolean }) {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: desktop ? 'repeat(4, minmax(0, 1fr))' : '1fr 1fr', gap: desktop ? 16 : 10, marginBottom: 20 }}>
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

