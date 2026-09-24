import { useState } from 'react'
import type { SlotSelection } from './types'

const PITCHES = [
  { id: 'A', name: 'Pitch A', type: '5-a-side', priceOffPeak: 2500, pricePeak: 3500 },
  { id: 'B', name: 'Pitch B', type: '7-a-side', priceOffPeak: 2500, pricePeak: 3500 },
  { id: 'C', name: 'Pitch C', type: '11-a-side', priceOffPeak: 3000, pricePeak: 4500 },
]

const DAYS = ['Mon 21', 'Tue 22', 'Wed 23', 'Thu 24', 'Fri 25', 'Sat 26', 'Sun 27']

// slots from 06:00–22:00 in 1h steps
const ALL_SLOTS = Array.from({ length: 17 }, (_, i) => {
  const h = i + 6
  return `${String(h).padStart(2, '0')}:00`
})

// Simulate some booked slots
const BOOKED: Record<string, Record<string, string[]>> = {
  A: { 'Tue 22': ['08:00', '09:00', '12:00', '17:00', '18:00'] },
  B: { 'Tue 22': ['10:00', '11:00', '19:00', '20:00'] },
  C: { 'Tue 22': ['14:00', '15:00', '16:00'] },
}

export default function VenuePage({ onBack, onBook }: { onBack: () => void; onBook: (slot: SlotSelection) => void }) {
  const [selectedPitch, setSelectedPitch] = useState('A')
  const [selectedDay, setSelectedDay] = useState(1)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [imgIdx, setImgIdx] = useState(0)

  const pitch = PITCHES.find(p => p.id === selectedPitch)!
  const day = DAYS[selectedDay]
  const booked = BOOKED[selectedPitch]?.[day] ?? []

  const IMAGES = [
    'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=600&h=340&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1551958219-acbc595f6c0a?w=600&h=340&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=600&h=340&fit=crop&auto=format',
  ]

  function handleBook() {
    if (!selectedSlot) return
    const h = parseInt(selectedSlot.split(':')[0])
    const isPeak = h >= 17 && h < 22
    const price = isPeak ? pitch.pricePeak : pitch.priceOffPeak
    const endH = h + 1
    onBook({
      venueName: 'Greenfield Arena',
      area: 'Kilimani, Nairobi',
      pitch: pitch.name,
      pitchType: pitch.type,
      date: `${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][selectedDay]} 2${selectedDay + 0} Sep`,
      time: `${selectedSlot}–${String(endH).padStart(2,'0')}:00`,
      price,
      isPeak,
    })
  }

  return (
    <div>
      {/* Photo gallery */}
      <div style={{ position: 'relative', height: 240, background: 'var(--color-confirmed-bg)', flexShrink: 0 }}>
        <img src={IMAGES[imgIdx]} alt="Venue" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        {/* Back button */}
        <button onClick={onBack} style={{ position: 'absolute', top: 48, left: 16, width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.45)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, backdropFilter: 'blur(4px)' }}>‹</button>
        {/* Dots */}
        <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
          {IMAGES.map((_, i) => (
            <button key={i} onClick={() => setImgIdx(i)} style={{ width: 6, height: 6, borderRadius: '50%', border: 'none', background: i === imgIdx ? '#fff' : 'rgba(255,255,255,0.5)', padding: 0, cursor: 'pointer' }} />
          ))}
        </div>
        {/* Favourite */}
        <button style={{ position: 'absolute', top: 48, right: 16, width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.45)', border: 'none', cursor: 'pointer', fontSize: 18, backdropFilter: 'blur(4px)' }}>🤍</button>
      </div>

      <div style={{ padding: '16px 16px 0' }}>
        {/* Venue info */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)' }}>Greenfield Arena</div>
            <div style={{ fontSize: 14, color: 'var(--color-muted)' }}>📍 Kilimani, Nairobi · 0.8 km away</div>
          </div>
          <div style={{ background: 'var(--color-pending-bg)', borderRadius: 8, padding: '6px 10px', textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-pending-strong)' }}>4.7</div>
            <div style={{ fontSize: 11, color: 'var(--color-pending-strong)' }}>★★★★★</div>
            <div style={{ fontSize: 11, color: 'var(--color-pending-strong)' }}>134 reviews</div>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex gap-3 mb-4">
          <a href="https://maps.google.com" style={{ flex: 1, padding: '10px', borderRadius: 10, background: 'var(--color-primary-light)', color: 'var(--color-primary)', fontSize: 14, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            🗺 Get directions
          </a>
          <a href="tel:+254712000000" style={{ flex: 1, padding: '10px', borderRadius: 10, background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)', fontSize: 14, fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            📞 Call
          </a>
        </div>

        {/* Amenities */}
        <div className="flex gap-2 flex-wrap mb-4">
          {['💡 Floodlights', '🅿 Parking', '🚿 Changing rooms'].map(a => (
            <span key={a} style={{ fontSize: 13, color: 'var(--color-primary)', background: 'var(--color-primary-light)', padding: '5px 10px', borderRadius: 20 }}>{a}</span>
          ))}
        </div>

        {/* Pitch tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          {PITCHES.map(p => (
            <button key={p.id} onClick={() => { setSelectedPitch(p.id); setSelectedSlot(null) }}
              style={{ flex: 1, padding: '8px 6px', borderRadius: 10, border: selectedPitch === p.id ? 'none' : '1px solid var(--color-border)', cursor: 'pointer', background: selectedPitch === p.id ? 'var(--color-primary)' : 'var(--color-bg)', color: selectedPitch === p.id ? '#fff' : 'var(--color-muted)', fontWeight: selectedPitch === p.id ? 700 : 400 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{p.name}</div>
              <div style={{ fontSize: 11 }}>{p.type}</div>
            </button>
          ))}
        </div>

        {/* Date strip */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 14 }}>
          {DAYS.map((d, i) => (
            <button key={d} onClick={() => { setSelectedDay(i); setSelectedSlot(null) }}
              style={{ flexShrink: 0, minWidth: 46, padding: '6px 10px', borderRadius: 10, border: selectedDay === i ? 'none' : '1px solid var(--color-border)', cursor: 'pointer', background: selectedDay === i ? 'var(--color-primary)' : 'var(--color-bg)', color: selectedDay === i ? '#fff' : 'var(--color-muted)' }}>
              <div style={{ fontSize: 11 }}>{d.split(' ')[0]}</div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{d.split(' ')[1]}</div>
            </button>
          ))}
        </div>

        {/* Pricing note */}
        <div style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 10 }}>
          Off-peak <strong style={{ color: 'var(--color-text)' }}>KES {pitch.priceOffPeak.toLocaleString()}</strong> · Peak 17:00–22:00 <strong style={{ color: 'var(--color-primary)' }}>KES {pitch.pricePeak.toLocaleString()}</strong>
        </div>

        {/* Slot grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 90 }}>
          {ALL_SLOTS.map(slot => {
            const h = parseInt(slot)
            const isPeak = h >= 17 && h < 22
            const isBooked = booked.includes(slot)
            const isSelected = selectedSlot === slot
            return (
              <button key={slot} disabled={isBooked} onClick={() => setSelectedSlot(isSelected ? null : slot)}
                style={{
                  padding: '10px 6px', borderRadius: 10, cursor: isBooked ? 'not-allowed' : 'pointer',
                  border: isSelected ? 'none' : `1px solid ${isBooked ? 'var(--color-border)' : isPeak ? 'var(--color-peak-border)' : 'var(--color-border)'}`,
                  background: isSelected ? 'var(--color-primary)' : isBooked ? 'var(--color-bg)' : isPeak ? 'var(--color-peak)' : 'var(--color-bg)',
                  opacity: isBooked ? 0.4 : 1,
                }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: isSelected ? '#fff' : isBooked ? 'var(--color-muted-light)' : 'var(--color-text)', textDecoration: isBooked ? 'line-through' : 'none' }}>{slot}</div>
                {isPeak && <div style={{ fontSize: 10, color: isSelected ? 'rgba(255,255,255,0.8)' : 'var(--color-peak-text)', marginTop: 2 }}>Peak</div>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Sticky booking bar */}
      {selectedSlot && (
        <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 'var(--frame-width)', background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', padding: '12px 16px 24px', zIndex: 90 }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{pitch.name} · {day} · {selectedSlot}</div>
              <div style={{ fontSize: 13, color: 'var(--color-muted)' }}>
                {(() => { const h = parseInt(selectedSlot); const isPeak = h >= 17 && h < 22; return isPeak ? `🔴 Peak · KES ${pitch.pricePeak.toLocaleString()}` : `🟢 Off-peak · KES ${pitch.priceOffPeak.toLocaleString()}` })()}
              </div>
            </div>
          </div>
          <button onClick={handleBook}
            style={{ width: '100%', padding: '14px', borderRadius: 14, border: 'none', background: 'var(--color-primary)', color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
            Book this slot
          </button>
        </div>
      )}
    </div>
  )
}
