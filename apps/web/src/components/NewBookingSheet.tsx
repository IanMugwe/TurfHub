import { useState } from 'react'
import { TODAY_BOOKINGS, VENUE } from '../data'

const SOURCES = [
  { id: 'walkin', label: '🚶 Walk-in' },
  { id: 'phone', label: '📞 Phone' },
  { id: 'whatsapp', label: '💬 WhatsApp' },
]
const DURATIONS = ['1h', '1.5h', '2h']

function toMinutes(t: string) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

export default function NewBookingSheet({ onClose, initialCustomer }: { onClose: () => void; initialCustomer?: { name: string; phone: string } }) {
  const [pitch, setPitch] = useState(VENUE.pitches[0].id)
  const [time, setTime] = useState('14:00')
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

  // Overlap check against today's bookings on the same pitch
  const start = toMinutes(time)
  const end = start + multiplier * 60
  const clash = TODAY_BOOKINGS.find(b => {
    if (b.pitch !== selectedPitch.name || b.status === 'cancelled') return false
    const [bs, be] = b.time.split('–').map(toMinutes)
    return start < be && bs < end
  })

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
      <div style={{ position: 'relative', width: '100%', background: 'var(--color-surface)', borderRadius: '20px 20px 0 0', maxHeight: '90vh', overflowY: 'auto', padding: '0 0 40px' }}>
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--color-border)' }} />
        </div>

        <div style={{ padding: '16px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)' }}>New booking</div>
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
            <button onClick={() => setRepeat(!repeat)}
              style={{ width: 44, height: 26, borderRadius: 13, background: repeat ? 'var(--color-primary)' : 'var(--color-border)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: repeat ? 20 : 2, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
            </button>
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
              <div style={{ fontSize: 13, color: 'var(--color-pending)', background: 'var(--color-pending-bg)', padding: '6px 10px', borderRadius: 8 }}>
                ⚠ 2 dates clash and will be skipped: 6 Oct, 20 Oct
              </div>
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

          <button onClick={onClose} disabled={!!clash}
            style={{ width: '100%', padding: '15px', borderRadius: 14, border: 'none', background: clash ? 'var(--color-border)' : 'var(--color-primary)', color: clash ? 'var(--color-muted-light)' : '#fff', fontSize: 16, fontWeight: 700, cursor: clash ? 'not-allowed' : 'pointer' }}>
            Save booking
          </button>
        </div>
      </div>
    </div>
  )
}
