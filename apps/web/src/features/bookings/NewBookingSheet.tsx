import { useState } from 'react'
import BottomSheet from '../../ui/BottomSheet'
import Toggle from '../../ui/Toggle'
import { VENUE } from '../../mocks/data'
import { useDemoStore } from '../../app/DemoStore'
import { formatDay, todayKey } from '../../lib/dates'
import { useToast } from '../../ui/Toast'
import type { BookingSource } from '../../types'

const SOURCES = [
  { id: 'walkin', label: '🚶 Walk-in' },
  { id: 'phone', label: '📞 Phone' },
  { id: 'whatsapp', label: '💬 WhatsApp' },
]
const DURATIONS = ['1h', '1.5h', '2h']

export default function NewBookingSheet({ onClose, initialCustomer, initialPitch, initialTime, initialDate }: {
  onClose: () => void
  initialCustomer?: { name: string; phone: string }
  initialPitch?: string
  initialTime?: string
  /** "YYYY-MM-DD"; defaults to today */
  initialDate?: string
}) {
  const { addBooking, clashesFor } = useDemoStore()
  const toast = useToast()
  const today = todayKey()
  const dateKey = initialDate && /^\d{4}-\d{2}-\d{2}$/.test(initialDate) ? initialDate : today
  const [pitch, setPitch] = useState(VENUE.pitches.some(p => p.id === initialPitch) ? initialPitch! : VENUE.pitches[0].id)
  const [time, setTime] = useState(initialTime ?? '14:00')
  const [duration, setDuration] = useState('1h')
  const [customer, setCustomer] = useState(initialCustomer?.name ?? '')
  const [phone, setPhone] = useState(initialCustomer?.phone ?? '+254 ')
  const [source, setSource] = useState('walkin')
  const [repeat, setRepeat] = useState(false)
  const [weeks, setWeeks] = useState(8)

  const selectedPitch = VENUE.pitches.find(p => p.id === pitch)!
  const startH = parseInt(time.split(':')[0])
  const isPeak = startH >= 17 && startH < 22
  const price = isPeak ? selectedPitch.pricePeak : selectedPitch.priceOffPeak
  const multiplier = duration === '1h' ? 1 : duration === '1.5h' ? 1.5 : 2
  const total = Math.round(price * multiplier)

  // Overlap check against real bookings on the same pitch, including repeat weeks
  const input = { pitchId: pitch, dateKey, start: time, hours: multiplier, customer, phone, source: source as BookingSource, weeks: repeat ? weeks : 1 }
  const validTime = /^\d{2}:\d{2}$/.test(time)
  const { first: clash, repeatDates } = validTime ? clashesFor(input) : { first: undefined, repeatDates: [] }
  const canSave = validTime && !clash && customer.trim().length > 0

  function save() {
    const { created } = addBooking(input)
    toast(`Booked ${customer.trim()} · ${selectedPitch.name} ${time}${created.length > 1 ? ` · ${created.length} weeks` : ''}`)
    onClose()
  }

  return (
    <BottomSheet onClose={onClose} label="New booking">
        <div style={{ padding: '16px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)' }}>
            New booking{dateKey !== today && <span style={{ fontWeight: 500, color: 'var(--color-muted)' }}> · {formatDay(dateKey)}</span>}
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'var(--color-bg)', cursor: 'pointer', fontSize: 18, color: 'var(--color-muted)' }}>×</button>
        </div>

        <div style={{ padding: '0 20px' }}>
          {/* Pitch */}
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-muted)', marginBottom: 6 }}>Pitch</label>
          <div className="flex gap-2 mb-4">
            {VENUE.pitches.map(p => (
              <button key={p.id} onClick={() => setPitch(p.id)}
                style={{ flex: 1, padding: '9px 6px', borderRadius: 10, border: pitch === p.id ? 'none' : '1px solid var(--color-border)', background: pitch === p.id ? 'var(--color-primary)' : 'var(--color-bg)', color: pitch === p.id ? '#fff' : 'var(--color-muted)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                <div>{p.name}</div>
                <div style={{ fontSize: 11, opacity: 0.8 }}>{p.type}</div>
              </button>
            ))}
          </div>

          {/* Time + Duration */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-muted)', marginBottom: 6 }}>Start time</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)}
                style={{ width: '100%', padding: '11px 12px', borderRadius: 10, border: '1px solid var(--color-border)', background: 'var(--color-bg)', fontSize: 15, color: 'var(--color-text)', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-muted)', marginBottom: 6 }}>Duration</label>
              <div className="flex gap-1">
                {DURATIONS.map(d => (
                  <button key={d} onClick={() => setDuration(d)}
                    style={{ flex: 1, padding: '11px 4px', borderRadius: 10, border: duration === d ? 'none' : '1px solid var(--color-border)', background: duration === d ? 'var(--color-primary)' : 'var(--color-bg)', color: duration === d ? '#fff' : 'var(--color-muted)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Customer */}
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-muted)', marginBottom: 6 }}>Customer name</label>
          <input value={customer} onChange={e => setCustomer(e.target.value)} placeholder="Brian Otieno"
            style={{ width: '100%', padding: '11px 12px', borderRadius: 10, border: '1px solid var(--color-border)', background: 'var(--color-bg)', fontSize: 15, color: 'var(--color-text)', marginBottom: 12, outline: 'none', display: 'block' }} />

          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-muted)', marginBottom: 6 }}>Phone</label>
          <input value={phone} onChange={e => setPhone(e.target.value)} type="tel"
            style={{ width: '100%', padding: '11px 12px', borderRadius: 10, border: '1px solid var(--color-border)', background: 'var(--color-bg)', fontSize: 15, color: 'var(--color-text)', marginBottom: 12, outline: 'none', display: 'block' }} />

          {/* Source */}
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-muted)', marginBottom: 6 }}>Source</label>
          <div className="flex gap-2 mb-4">
            {SOURCES.map(s => (
              <button key={s.id} onClick={() => setSource(s.id)}
                style={{ flex: 1, padding: '9px 8px', borderRadius: 10, border: source === s.id ? 'none' : '1px solid var(--color-border)', background: source === s.id ? 'var(--color-primary-light)' : 'var(--color-bg)', color: source === s.id ? 'var(--color-primary)' : 'var(--color-muted)', fontSize: 13, fontWeight: source === s.id ? 600 : 400, cursor: 'pointer' }}>
                {s.label}
              </button>
            ))}
          </div>

          {/* Repeat */}
          <div className="flex items-center justify-between mb-2">
            <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text)' }}>Repeat weekly</div>
            <Toggle on={repeat} onChange={setRepeat} label="Repeat weekly" />
          </div>
          {repeat && (
            <div style={{ background: 'var(--color-bg)', borderRadius: 10, padding: '10px 12px', marginBottom: 12 }}>
              <div className="flex items-center justify-between mb-2">
                <span style={{ fontSize: 14, color: 'var(--color-text)' }}>Repeat for</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => setWeeks(w => Math.max(1, w - 1))} style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--color-border)', background: 'var(--color-surface)', cursor: 'pointer', fontSize: 16 }}>-</button>
                  <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)', minWidth: 24, textAlign: 'center' }}>{weeks}</span>
                  <button onClick={() => setWeeks(w => w + 1)} style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--color-border)', background: 'var(--color-surface)', cursor: 'pointer', fontSize: 16 }}>+</button>
                  <span style={{ fontSize: 14, color: 'var(--color-muted)' }}>weeks</span>
                </div>
              </div>
              {repeatDates.length > 0 ? (
                <div style={{ fontSize: 13, color: 'var(--color-pending)', background: 'var(--color-pending-bg)', padding: '6px 10px', borderRadius: 8 }}>
                  ⚠ {repeatDates.length} date{repeatDates.length > 1 ? 's' : ''} clash and will be skipped: {repeatDates.map(formatDay).join(', ')}
                </div>
              ) : (
                <div style={{ fontSize: 13, color: 'var(--color-confirmed)', background: 'var(--color-confirmed-bg)', padding: '6px 10px', borderRadius: 8 }}>
                  ✓ No clashes in the next {weeks} weeks
                </div>
              )}
            </div>
          )}

          {/* Price */}
          <div style={{ background: 'var(--color-primary-light)', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-primary)' }}>KES {total.toLocaleString()}</div>
              <div style={{ fontSize: 12, color: 'var(--color-primary)', opacity: 0.8 }}>{isPeak ? '🔴 peak rate' : '🟢 off-peak rate'} · KES {price.toLocaleString()}/hr</div>
            </div>
          </div>

          {clash && (
            <div style={{ background: 'var(--color-noshow-bg)', border: '1px solid var(--color-noshow-border)', borderRadius: 12, padding: '10px 14px', marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-noshow)' }}>That slot was just taken — pick another time</div>
              <div style={{ fontSize: 13, color: 'var(--color-muted)', marginTop: 2 }}>{selectedPitch.name} is booked {clash.time} by {clash.customer}.</div>
            </div>
          )}

          <button onClick={save} disabled={!canSave}
            style={{ width: '100%', padding: '15px', borderRadius: 14, border: 'none', background: !canSave ? 'var(--color-border)' : 'var(--color-primary)', color: !canSave ? 'var(--color-muted-light)' : '#fff', fontSize: 16, fontWeight: 700, cursor: !canSave ? 'not-allowed' : 'pointer' }}>
            Save booking
          </button>
        </div>
    </BottomSheet>
  )
}
