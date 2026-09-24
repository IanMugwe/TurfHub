import { useState, useRef } from 'react'
import { TODAY_BOOKINGS, VENUE, NOW_HOUR } from '../../mocks/data'
import type { Booking } from '../../types'

const STATUS_BG: Record<string, string> = {
  confirmed: 'var(--color-confirmed-bg)',
  pending:   'var(--color-pending-bg)',
  completed: 'var(--color-completed-bg)',
  noshow:    'var(--color-noshow-bg)',
  cancelled: 'var(--color-completed-bg)',
}
const STATUS_BORDER: Record<string, string> = {
  confirmed: 'var(--color-confirmed)',
  pending:   'var(--color-pending)',
  completed: 'var(--color-completed)',
  noshow:    'var(--color-noshow)',
  cancelled: 'var(--color-completed)',
}
const SOURCE_ICON: Record<string, string> = { walkin: '🚶', phone: '📞', whatsapp: '💬', app: '📱' }
const PAY_DOT: Record<string, string> = { unpaid: 'var(--color-noshow)', partpaid: 'var(--color-pending)', paid: 'var(--color-confirmed)', waived: 'var(--color-completed)' }

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6) // 06:00–23:00
const ROW_H = 56 // px per hour slot
const PEAK_START = 17
const PEAK_END = 22

const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const DAYS = DAYS_SHORT.map((d, i) => `${d} ${21 + i}`)

// Maintenance blocks: pitch → [{ startH, endH, label }]
const MAINTENANCE: Record<string, { startH: number; endH: number; label: string }[]> = {
  'Pitch C': [{ startH: 10, endH: 12, label: 'Maintenance' }],
}

function getBookingsForPitch(pitchName: string): Booking[] {
  return TODAY_BOOKINGS.filter(b => b.pitch === pitchName)
}
function bookingTop(b: Booking): number {
  return (parseInt(b.time.split(':')[0]) - 6) * ROW_H
}
function bookingHeight(b: Booking): number {
  const [startStr, endStr] = b.time.split('–')
  const start = parseInt(startStr.split(':')[0]) + parseInt(startStr.split(':')[1]) / 60
  const end = parseInt(endStr.split(':')[0]) + parseInt(endStr.split(':')[1]) / 60
  return (end - start) * ROW_H
}

const NOW_TOP = (NOW_HOUR - 6) * ROW_H

export default function CalendarScreen({ onNewBooking, onBookingTap }: { onNewBooking: (pitchId?: string, hour?: number) => void; onBookingTap: (b: Booking) => void }) {
  const [selectedDay, setSelectedDay] = useState(1)
  const [view, setView] = useState<'day' | 'week'>('day')
  const [selectedPitch, setSelectedPitch] = useState('A') // for week view
  const gridRef = useRef<HTMLDivElement>(null)

  const totalGridH = HOURS.length * ROW_H

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* ── Header (fixed) ── */}
      <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', flexShrink: 0, paddingTop: 46 }}>
        {/* Date strip */}
        <div style={{ display: 'flex', gap: 4, padding: '10px 14px 8px', overflowX: 'auto' }}>
          {DAYS.map((d, i) => (
            <button key={d} onClick={() => setSelectedDay(i)}
              style={{ flexShrink: 0, minWidth: 44, padding: '5px 8px', borderRadius: 10, border: 'none', cursor: 'pointer', textAlign: 'center', background: selectedDay === i ? 'var(--color-primary)' : 'transparent', color: selectedDay === i ? '#fff' : 'var(--color-muted)' }}>
              <div style={{ fontSize: 10, fontWeight: 500 }}>{DAYS_SHORT[i]}</div>
              <div style={{ fontSize: 17, fontWeight: 700 }}>{21 + i}</div>
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between" style={{ padding: '0 14px 10px' }}>
          <div style={{ display: 'flex', background: 'var(--color-bg)', borderRadius: 8, padding: 3 }}>
            {(['day', 'week'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                style={{ padding: '5px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: view === v ? 'var(--color-surface)' : 'transparent', color: view === v ? 'var(--color-text)' : 'var(--color-muted)', boxShadow: view === v ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}>
                {v === 'day' ? 'Day' : 'Week'}
              </button>
            ))}
          </div>

          {view === 'week' && (
            <div style={{ display: 'flex', gap: 4 }}>
              {VENUE.pitches.map(p => (
                <button key={p.id} onClick={() => setSelectedPitch(p.id)}
                  style={{ padding: '5px 10px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: selectedPitch === p.id ? 'var(--color-primary)' : 'var(--color-bg)', color: selectedPitch === p.id ? '#fff' : 'var(--color-muted)' }}>
                  {p.name}
                </button>
              ))}
            </div>
          )}

          {view === 'day' && (
            <button onClick={() => setSelectedDay(1)} style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer' }}>Today</button>
          )}
        </div>

        {/* Pitch column headers (day view) */}
        {view === 'day' && (
          <div style={{ display: 'grid', gridTemplateColumns: '48px repeat(3, 1fr)', borderTop: '1px solid var(--color-border)' }}>
            <div style={{ borderRight: '1px solid var(--color-border)' }} />
            {VENUE.pitches.map(p => (
              <div key={p.id} style={{ padding: '8px 6px', textAlign: 'center', borderRight: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text)' }}>{p.name}</div>
                <div style={{ fontSize: 10, color: 'var(--color-muted)' }}>{p.type}</div>
              </div>
            ))}
          </div>
        )}

        {/* Week view column headers */}
        {view === 'week' && (
          <div style={{ display: 'grid', gridTemplateColumns: '48px repeat(7, 1fr)', borderTop: '1px solid var(--color-border)' }}>
            <div style={{ borderRight: '1px solid var(--color-border)' }} />
            {DAYS.map((d, i) => (
              <div key={d} style={{ padding: '6px 4px', textAlign: 'center', borderRight: '1px solid var(--color-border)', background: i === selectedDay ? 'var(--color-primary-light)' : 'transparent' }}>
                <div style={{ fontSize: 10, color: i === selectedDay ? 'var(--color-primary)' : 'var(--color-muted)', fontWeight: i === selectedDay ? 700 : 400 }}>{DAYS_SHORT[i]}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: i === selectedDay ? 'var(--color-primary)' : 'var(--color-text)' }}>{21 + i}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Scrollable grid ── */}
      <div ref={gridRef} style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', position: 'relative' }}>

        {/* DAY VIEW */}
        {view === 'day' && (
          <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '48px repeat(3, 1fr)', height: totalGridH }}>
            {/* Hour labels column */}
            <div style={{ borderRight: '1px solid var(--color-border)' }}>
              {HOURS.map(h => (
                <div key={h} style={{ height: ROW_H, display: 'flex', alignItems: 'flex-start', padding: '4px 6px 0', borderBottom: '1px solid var(--color-border)' }}>
                  <span style={{ fontSize: 10, color: 'var(--color-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>{String(h).padStart(2,'0')}:00</span>
                </div>
              ))}
            </div>

            {/* Pitch columns */}
            {VENUE.pitches.map(p => {
              const pitchBookings = getBookingsForPitch(p.name)
              const maintenance = MAINTENANCE[p.name] ?? []
              return (
                <div key={p.id} style={{ borderRight: '1px solid var(--color-border)', position: 'relative' }}>
                  {/* Hour rows (background grid) */}
                  {HOURS.map(h => (
                    <div key={h} onClick={() => onNewBooking(p.id, h)}
                      style={{ height: ROW_H, borderBottom: '1px solid var(--color-border)', background: h >= PEAK_START && h < PEAK_END ? 'var(--color-peak)' : 'var(--color-surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-border)', fontSize: 16 }}>
                      +
                    </div>
                  ))}

                  {/* Maintenance hatching */}
                  {maintenance.map((m, i) => (
                    <div key={i} style={{
                      position: 'absolute', top: (m.startH - 6) * ROW_H, left: 0, right: 0,
                      height: (m.endH - m.startH) * ROW_H,
                      background: 'repeating-linear-gradient(45deg, var(--color-noshow-bg) 0px, var(--color-noshow-bg) 4px, var(--color-surface) 4px, var(--color-surface) 12px)',
                      border: '1px solid var(--color-noshow-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2,
                    }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-noshow)', background: 'var(--color-surface)', padding: '2px 6px', borderRadius: 4 }}>🔧 {m.label}</span>
                    </div>
                  ))}

                  {/* Booking blocks */}
                  {pitchBookings.map(b => (
                    <div key={b.id} onClick={e => { e.stopPropagation(); onBookingTap(b) }}
                      style={{
                        position: 'absolute', left: 2, right: 2,
                        top: bookingTop(b), height: bookingHeight(b),
                        background: STATUS_BG[b.status],
                        borderLeft: `3px solid ${STATUS_BORDER[b.status]}`,
                        borderRadius: 6, padding: '4px 6px', cursor: 'pointer',
                        overflow: 'hidden', zIndex: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                      }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3 }}>{b.customer.split(' ')[0]}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-muted)', lineHeight: 1.2 }}>{b.time.split('–')[0]}</div>
                      {bookingHeight(b) > 48 && (
                        <div className="flex items-center gap-1 mt-1">
                          <span style={{ fontSize: 10 }}>{SOURCE_ICON[b.source]}</span>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: PAY_DOT[b.payment] }} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            })}

            {/* Now line */}
            <div style={{ position: 'absolute', left: 48, right: 0, top: NOW_TOP, height: 2, background: 'var(--color-noshow)', zIndex: 10, pointerEvents: 'none' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-noshow)', position: 'absolute', left: -4, top: -3 }} />
            </div>
          </div>
        )}

        {/* WEEK VIEW */}
        {view === 'week' && (
          <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '48px repeat(7, 1fr)', height: totalGridH }}>
            {/* Hour labels */}
            <div style={{ borderRight: '1px solid var(--color-border)' }}>
              {HOURS.map(h => (
                <div key={h} style={{ height: ROW_H, display: 'flex', alignItems: 'flex-start', padding: '4px 6px 0', borderBottom: '1px solid var(--color-border)' }}>
                  <span style={{ fontSize: 10, color: 'var(--color-muted)', fontWeight: 500 }}>{String(h).padStart(2,'0')}:00</span>
                </div>
              ))}
            </div>

            {/* 7 day columns (all showing same pitch) */}
            {DAYS.map((d, di) => {
              const pitchName = VENUE.pitches.find(p => p.id === selectedPitch)?.name ?? 'Pitch A'
              const pitchBookings = di === selectedDay ? getBookingsForPitch(pitchName) : []
              return (
                <div key={d} style={{ borderRight: '1px solid var(--color-border)', position: 'relative', background: di === selectedDay ? 'rgba(15,122,61,0.02)' : 'transparent' }}>
                  {HOURS.map(h => (
                    <div key={h} onClick={() => onNewBooking(selectedPitch, h)}
                      style={{ height: ROW_H, borderBottom: '1px solid var(--color-border)', background: h >= PEAK_START && h < PEAK_END ? 'var(--color-peak)' : 'transparent', cursor: 'pointer' }} />
                  ))}
                  {pitchBookings.map(b => (
                    <div key={b.id} onClick={e => { e.stopPropagation(); onBookingTap(b) }}
                      style={{
                        position: 'absolute', left: 1, right: 1,
                        top: bookingTop(b), height: bookingHeight(b),
                        background: STATUS_BG[b.status],
                        borderLeft: `3px solid ${STATUS_BORDER[b.status]}`,
                        borderRadius: 5, padding: '3px 4px', cursor: 'pointer', overflow: 'hidden', zIndex: 3,
                      }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.customer.split(' ')[0]}</div>
                      <div style={{ fontSize: 9, color: 'var(--color-muted)' }}>{b.time.split('–')[0]}</div>
                    </div>
                  ))}
                  {/* Today now line in week view */}
                  {di === selectedDay && (
                    <div style={{ position: 'absolute', left: 0, right: 0, top: NOW_TOP, height: 2, background: 'var(--color-noshow)', zIndex: 10, pointerEvents: 'none' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-noshow)', position: 'absolute', left: -3, top: -2 }} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Peak hours legend */}
      <div style={{ flexShrink: 0, background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', padding: '8px 14px', display: 'flex', gap: 16, alignItems: 'center' }}>
        <div className="flex items-center gap-1.5">
          <div style={{ width: 12, height: 12, borderRadius: 2, background: 'var(--color-peak)', border: '1px solid var(--color-peak-border)' }} />
          <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>Peak 17:00–22:00</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div style={{ width: 12, height: 12, borderRadius: 2, background: 'var(--color-confirmed-bg)', border: '1px solid var(--color-confirmed)' }} />
          <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>Confirmed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div style={{ width: 12, height: 12, borderRadius: 2, background: 'var(--color-pending-bg)', border: '1px solid var(--color-pending)' }} />
          <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>Pending</span>
        </div>
      </div>
    </div>
  )
}
