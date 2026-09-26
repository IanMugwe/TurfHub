import { useState } from 'react'
import { useDemoStore } from '../../app/DemoStore'
import { useStaff } from '../../app/StaffLayout'
import { useToast } from '../../ui/Toast'
import { Chip, PrimaryButton } from '../../ui/form'
import { addDays, formatDay, todayKey } from '../../lib/dates'
import { activePitches, conflictFor, hoursFor, priceFor } from '../../lib/venue'
import { rangeOf } from '../../lib/bookings'
import { NOW_HOUR } from '../../mocks/data'
import { formatKES } from '@turfhub/validation'
import type { Booking } from '../../types'

function label(m: number) {
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}

function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-3" style={{ marginBottom: 16 }}>
      <button onClick={onBack} aria-label="Back to booking" style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--color-border)', background: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--color-text)' }}>‹</button>
      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)' }}>{title}</div>
    </div>
  )
}

/** Move a booking to another day, pitch or time (optionally the rest of its weekly series) */
export function MoveView({ booking: b, scope, onDone }: { booking: Booking; scope: 'one' | 'following'; onDone: () => void }) {
  const { venue } = useStaff()
  const { bookings, moveBooking } = useDemoStore()
  const toast = useToast()
  const today = todayKey()
  const [s0, e0] = rangeOf(b)
  const minutes = e0 - s0
  const [dateKey, setDateKey] = useState(b.dateKey < today ? today : b.dateKey)
  const [pitchId, setPitchId] = useState(b.pitchId)
  const [start, setStart] = useState(s0)

  const days = Array.from({ length: 14 }, (_, i) => addDays(today, i))
  const hours = hoursFor(venue, dateKey)
  // Half-hour start times that fit before closing
  const starts = hours.closed ? [] : Array.from({ length: (hours.close - hours.open) * 2 }, (_, i) => hours.open * 60 + i * 30).filter(m => m + minutes <= hours.close * 60)
  const past = dateKey === today && start < (NOW_HOUR + 1) * 60
  const conflict = past ? { kind: 'closed' as const, message: 'That time has already passed' } : conflictFor(venue, bookings, pitchId, dateKey, start, start + minutes, b.ref)
  const unchanged = dateKey === b.dateKey && pitchId === b.pitchId && start === s0
  const newPrice = priceFor(venue, pitchId, dateKey, Math.floor(start / 60), minutes / 60)
  const following = scope === 'following' && !!b.seriesId

  function move() {
    const { moved, skipped } = moveBooking(b.ref, { dateKey, pitchId, start: label(start) }, scope)
    const pitchName = venue.pitches.find(p => p.id === pitchId)?.name
    toast(following
      ? `Moved ${moved} booking${moved === 1 ? '' : 's'} to ${pitchName} ${label(start)}${skipped ? ` · ${skipped} skipped (clash)` : ''}`
      : `Moved to ${formatDay(dateKey)} · ${pitchName} ${label(start)}`)
    onDone()
  }

  return (
    <div style={{ padding: '12px 20px 0' }}>
      <Header title="Move booking" onBack={onDone} />
      <div style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 14 }}>{b.customer} · now {b.date}, {b.pitch} {b.time}</div>

      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-muted)', marginBottom: 6 }}>Day</div>
      <div className="flex gap-2" style={{ overflowX: 'auto', marginBottom: 14, paddingBottom: 2 }}>
        {days.map(d => <Chip key={d} selected={dateKey === d} onClick={() => setDateKey(d)}>{d === today ? 'Today' : formatDay(d)}</Chip>)}
      </div>

      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-muted)', marginBottom: 6 }}>Pitch</div>
      <div className="flex gap-2 flex-wrap" style={{ marginBottom: 14 }}>
        {activePitches(venue).map(p => <Chip key={p.id} selected={pitchId === p.id} onClick={() => setPitchId(p.id)}>{p.name} · {p.type}</Chip>)}
      </div>

      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-muted)', marginBottom: 6 }}>Start time</div>
      {hours.closed ? (
        <div style={{ fontSize: 14, color: 'var(--color-muted)', marginBottom: 14 }}>Closed that day.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 14, maxHeight: 180, overflowY: 'auto' }}>
          {starts.map(m => {
            // Times already gone today can't be chosen
            const taken = (dateKey === today && m < (NOW_HOUR + 1) * 60) || !!conflictFor(venue, bookings, pitchId, dateKey, m, m + minutes, b.ref)
            return (
              <button key={m} type="button" disabled={taken} onClick={() => setStart(m)} aria-pressed={start === m}
                style={{ padding: '8px 4px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: taken ? 'not-allowed' : 'pointer', border: start === m ? 'none' : '1px solid var(--color-border)', background: start === m ? 'var(--color-primary)' : 'var(--color-bg)', color: start === m ? '#fff' : taken ? 'var(--color-muted-light)' : 'var(--color-text)', textDecoration: taken ? 'line-through' : 'none', opacity: taken ? 0.5 : 1 }}>
                {label(m)}
              </button>
            )
          })}
        </div>
      )}

      {conflict && !unchanged && (
        <div style={{ fontSize: 13, color: 'var(--color-noshow)', background: 'var(--color-noshow-bg)', padding: '8px 12px', borderRadius: 10, marginBottom: 12 }}>{conflict.message}</div>
      )}
      {!conflict && !unchanged && (
        <div style={{ fontSize: 13, color: 'var(--color-primary)', background: 'var(--color-primary-light)', padding: '8px 12px', borderRadius: 10, marginBottom: 12 }}>
          New slot: {formatDay(dateKey)} · {label(start)}–{label(start + minutes)} · {formatKES(Math.max(b.paid, newPrice))}
          {following && ' · applies to this and later weeks'}
        </div>
      )}
      <PrimaryButton onClick={move} disabled={!!conflict || unchanged}>Move booking</PrimaryButton>
    </div>
  )
}

const EXTENSIONS = [30, 60, 120]

/** Add time to the end of a booking if the pitch is free */
export function ExtendView({ booking: b, onDone }: { booking: Booking; onDone: () => void }) {
  const { venue } = useStaff()
  const { bookings, extendBooking } = useDemoStore()
  const toast = useToast()
  const [start, end] = rangeOf(b)
  const [choice, setChoice] = useState<number | null>(null)

  const options = EXTENSIONS.map(extra => {
    const conflict = conflictFor(venue, bookings, b.pitchId, b.dateKey, end, end + extra, b.ref)
    const price = priceFor(venue, b.pitchId, b.dateKey, Math.floor(start / 60), (end - start + extra) / 60)
    return { extra, conflict, price, newEnd: end + extra }
  })
  const selected = options.find(o => o.extra === choice)

  function extend() {
    if (!selected) return
    extendBooking(b.ref, selected.extra)
    toast(`Extended to ${label(selected.newEnd)} · now ${formatKES(selected.price)}`)
    onDone()
  }

  return (
    <div style={{ padding: '12px 20px 0' }}>
      <Header title="Extend booking" onBack={onDone} />
      <div style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 14 }}>{b.customer} · {b.pitch} · {b.time} · {formatKES(b.amount)}</div>
      <div style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
        {options.map(o => (
          <button key={o.extra} type="button" disabled={!!o.conflict} onClick={() => setChoice(o.extra)} aria-pressed={choice === o.extra}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: 12, cursor: o.conflict ? 'not-allowed' : 'pointer', textAlign: 'left', border: choice === o.extra ? '2px solid var(--color-primary)' : '1px solid var(--color-border)', background: choice === o.extra ? 'var(--color-primary-light)' : 'var(--color-surface)', opacity: o.conflict ? 0.55 : 1 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)' }}>+{o.extra < 60 ? `${o.extra} min` : `${o.extra / 60} hour${o.extra > 60 ? 's' : ''}`} · until {label(o.newEnd)}</div>
              <div style={{ fontSize: 12, color: o.conflict ? 'var(--color-noshow)' : 'var(--color-muted)' }}>{o.conflict ? o.conflict.message : `+${formatKES(o.price - b.amount)}`}</div>
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-primary)' }}>{formatKES(o.price)}</div>
          </button>
        ))}
      </div>
      <PrimaryButton onClick={extend} disabled={!selected}>Extend booking</PrimaryButton>
    </div>
  )
}
