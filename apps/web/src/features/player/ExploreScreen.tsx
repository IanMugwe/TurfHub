import { useState } from 'react'
import { useIsDesktop } from '../../lib/useIsDesktop'
import { useToast } from '../../ui/Toast'
import ResponsiveGrid from '../../ui/ResponsiveGrid'

const VENUES = [
  {
    id: '1',
    name: 'Greenfield Arena',
    area: 'Kilimani',
    distance: '0.8 km',
    priceFrom: 2500,
    rating: 4.7,
    reviews: 134,
    amenities: ['💡 Floodlights', '🅿 Parking', '🚿 Changing rooms'],
    pitchTypes: ['5-a-side', '7-a-side', '11-a-side'],
    nextSlots: ['17:00', '18:00', '20:00'],
    image: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=600&h=300&fit=crop&auto=format',
  },
  {
    id: '2',
    name: 'Westlands Turf',
    area: 'Westlands',
    distance: '2.1 km',
    priceFrom: 2500,
    rating: 4.4,
    reviews: 89,
    amenities: ['💡 Floodlights', '🅿 Parking'],
    pitchTypes: ['5-a-side', '7-a-side'],
    nextSlots: ['19:00', '21:00'],
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&h=300&fit=crop&auto=format',
  },
  {
    id: '3',
    name: 'Lavington Sports Centre',
    area: 'Lavington',
    distance: '3.4 km',
    priceFrom: 3000,
    rating: 4.8,
    reviews: 201,
    amenities: ['💡 Floodlights', '🅿 Parking', '🚿 Changing rooms', '🏪 Canteen'],
    pitchTypes: ['7-a-side', '11-a-side'],
    nextSlots: ['18:00', '19:00'],
    image: 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=600&h=300&fit=crop&auto=format',
  },
]

const FILTERS = ['All', '5-a-side', '7-a-side', '11-a-side']

export default function ExploreScreen({ onVenueTap }: { onVenueTap: (id: string) => void }) {
  const toast = useToast()
  const desktop = useIsDesktop()
  const [filter, setFilter] = useState('All')
  const [query, setQuery] = useState('')

  const filtered = VENUES.filter(v => {
    const matchQuery = v.name.toLowerCase().includes(query.toLowerCase()) || v.area.toLowerCase().includes(query.toLowerCase())
    const matchFilter = filter === 'All' || v.pitchTypes.includes(filter)
    return matchQuery && matchFilter
  })

  return (
    <div>
      {/* Header */}
      <div style={{ background: 'var(--color-primary)', padding: desktop ? '28px 32px 16px' : '52px 16px 16px', ...(desktop && { margin: '24px 32px 0', borderRadius: 20 }) }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 12 }}>Find a pitch</div>
        <div style={{ position: 'relative' }}>
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search area or venue…"
            style={{ width: '100%', padding: '11px 14px 11px 40px', borderRadius: 12, border: 'none', background: 'rgba(255,255,255,0.15)', fontSize: 15, color: '#fff', outline: 'none', backdropFilter: 'blur(4px)' }} />
          <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔍</span>
        </div>
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 8, padding: '12px 16px', overflowX: 'auto', background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', ...(desktop && { padding: '20px 32px 0', background: 'transparent', borderBottom: 'none' }) }}>
        <button onClick={() => toast('Filter by date: coming soon')} style={{ flexShrink: 0, padding: '6px 14px', borderRadius: 20, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-muted)', fontSize: 13, cursor: 'pointer' }}>
          📅 Date
        </button>
        <button onClick={() => toast('Filter by time: coming soon')} style={{ flexShrink: 0, padding: '6px 14px', borderRadius: 20, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-muted)', fontSize: 13, cursor: 'pointer' }}>
          🕐 Time
        </button>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ flexShrink: 0, padding: '6px 14px', borderRadius: 20, border: filter === f ? 'none' : '1px solid var(--color-border)', background: filter === f ? 'var(--color-primary)' : 'var(--color-bg)', color: filter === f ? '#fff' : 'var(--color-muted)', fontSize: 13, fontWeight: filter === f ? 600 : 400, cursor: 'pointer' }}>
            {f}
          </button>
        ))}
        <button onClick={() => toast('Filter by price: coming soon')} style={{ flexShrink: 0, padding: '6px 14px', borderRadius: 20, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-muted)', fontSize: 13, cursor: 'pointer' }}>
          💰 Price
        </button>
      </div>

      {/* Near me + List/Map */}
      <div className="flex items-center justify-between" style={{ padding: desktop ? '12px 32px 0' : '10px 16px', background: 'var(--color-bg)' }}>
        <button onClick={() => toast('Near me: coming soon')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 20, border: '1px solid var(--color-primary)', background: 'var(--color-primary-light)', color: 'var(--color-primary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          📍 Near me
        </button>
        <div style={{ display: 'flex', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden' }}>
          {['List', 'Map'].map((v, i) => (
            <button key={v} onClick={() => { if (v === 'Map') toast('Map view: coming soon') }} style={{ padding: '6px 14px', border: 'none', background: i === 0 ? 'var(--color-primary)' : 'transparent', color: i === 0 ? '#fff' : 'var(--color-muted)', fontSize: 13, fontWeight: i === 0 ? 600 : 400, cursor: 'pointer' }}>{v}</button>
          ))}
        </div>
      </div>

      {/* Venue cards */}
      <div style={{ padding: desktop ? '20px 32px 32px' : '0 16px 24px' }}>
        <div style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 10 }}>{filtered.length} venue{filtered.length !== 1 ? 's' : ''} near you</div>
        <ResponsiveGrid min={300}>
        {filtered.map(v => (
          <button key={v.id} onClick={() => onVenueTap(v.id)}
            style={{ width: '100%', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 16, marginBottom: 14, overflow: 'hidden', cursor: 'pointer', textAlign: 'left', display: 'block' }}>
            {/* Photo */}
            <div style={{ position: 'relative', height: 160, background: 'var(--color-confirmed-bg)' }}>
              <img src={v.image} alt={v.name} onError={e => { e.currentTarget.style.visibility = 'hidden' }} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.55)', borderRadius: 20, padding: '4px 10px', color: '#fff', fontSize: 12, fontWeight: 600, backdropFilter: 'blur(4px)' }}>
                ★ {v.rating} ({v.reviews})
              </div>
              <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,0.55)', borderRadius: 20, padding: '4px 10px', color: '#fff', fontSize: 12, backdropFilter: 'blur(4px)' }}>
                {v.distance}
              </div>
            </div>

            <div style={{ padding: '14px' }}>
              <div className="flex items-start justify-between gap-2 mb-1">
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-text)' }}>{v.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--color-muted)' }}>{v.area}, Nairobi</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-primary)' }}>From KES {v.priceFrom.toLocaleString()}/hr</div>
                </div>
              </div>

              {/* Amenities */}
              <div className="flex gap-2 flex-wrap mt-2 mb-3">
                {v.amenities.map(a => (
                  <span key={a} style={{ fontSize: 12, color: 'var(--color-muted)', background: 'var(--color-bg)', padding: '3px 8px', borderRadius: 6 }}>{a}</span>
                ))}
              </div>

              {/* Next free slots */}
              <div>
                <div style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 6 }}>Next free slots</div>
                <div className="flex gap-2">
                  {v.nextSlots.map(slot => (
                    <span key={slot} style={{ padding: '5px 12px', borderRadius: 20, background: 'var(--color-primary-light)', color: 'var(--color-primary)', fontSize: 13, fontWeight: 600 }}>{slot}</span>
                  ))}
                </div>
              </div>
            </div>
          </button>
        ))}
        </ResponsiveGrid>
      </div>
    </div>
  )
}
