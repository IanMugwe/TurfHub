import { useMemo, useState, type ReactNode } from 'react'
import { useIsDesktop } from '../../lib/useIsDesktop'
import ResponsiveGrid from '../../ui/ResponsiveGrid'
import BottomSheet from '../../ui/BottomSheet'
import EmptyState from '../../ui/EmptyState'
import VenueMap from '../../ui/VenueMap'
import { Chip, PrimaryButton } from '../../ui/form'
import { useDemoStore } from '../../app/DemoStore'
import { addDays, formatDay, todayKey } from '../../lib/dates'
import { distanceKm, freeSlots, hourLabel, priceFrom, ratingOf } from '../../lib/venue'
import { NOW_HOUR, PLAYER_LOCATION } from '../../mocks/data'
import { formatKES } from '@turfhub/validation'

const FILTERS = ['All', '5-a-side', '7-a-side', '11-a-side']

type TimeWindow = 'any' | 'morning' | 'afternoon' | 'evening'
const WINDOWS: Record<TimeWindow, { label: string; from: number; to: number }> = {
  any: { label: 'Any time', from: 0, to: 24 },
  morning: { label: 'Morning · before 12:00', from: 0, to: 12 },
  afternoon: { label: 'Afternoon · 12:00–17:00', from: 12, to: 17 },
  evening: { label: 'Evening · after 17:00', from: 17, to: 24 },
}
const PRICES = [0, 2500, 3500, 5000]

type Sheet = 'date' | 'time' | 'price' | null

export default function ExploreScreen({ onVenueTap }: { onVenueTap: (slug: string, dateKey?: string) => void }) {
  const desktop = useIsDesktop()
  const { venues, bookings, reviews } = useDemoStore()
  const today = todayKey()
  const [filter, setFilter] = useState('All')
  const [query, setQuery] = useState('')
  const [dateKey, setDateKey] = useState(today)
  const [time, setTime] = useState<TimeWindow>('any')
  const [maxPrice, setMaxPrice] = useState(0)
  const [nearMe, setNearMe] = useState(true)
  const [view, setView] = useState<'List' | 'Map'>('List')
  const [sheet, setSheet] = useState<Sheet>(null)
  const [selectedPin, setSelectedPin] = useState<string | null>(null)

  const results = useMemo(() => {
    const window = WINDOWS[time]
    return venues
      .filter(v => v.status === 'approved')
      .map(v => {
        // Free one-hour slots that match every filter; past hours today don't count
        const slots = freeSlots(v, bookings, dateKey, {
          fromHour: Math.max(window.from, dateKey === today ? NOW_HOUR + 1 : 0),
          pitchType: filter === 'All' ? undefined : filter,
          maxPrice: maxPrice || undefined,
        }).filter(s => s.hour < window.to)
        const newRatings = reviews.filter(r => r.venueId === v.id && r.id.startsWith('rv-new')).map(r => r.rating)
        return {
          venue: v,
          distance: distanceKm(PLAYER_LOCATION, v),
          rating: ratingOf(v, newRatings),
          from: priceFrom(v),
          nextSlots: [...new Set(slots.map(s => s.hour))].slice(0, 3),
          pitchTypes: [...new Set(v.pitches.filter(p => p.active).map(p => p.type))],
        }
      })
      .filter(r => {
        const q = query.trim().toLowerCase()
        const matchQuery = !q || r.venue.name.toLowerCase().includes(q) || r.venue.area.toLowerCase().includes(q)
        const matchType = filter === 'All' || r.pitchTypes.includes(filter as never)
        // With a date, time or price filter set, only show venues that can actually be booked
        const needsSlot = dateKey !== today || time !== 'any' || maxPrice > 0
        return matchQuery && matchType && (!needsSlot || r.nextSlots.length > 0)
      })
      .sort((a, b) => (nearMe ? a.distance - b.distance : b.rating.average - a.rating.average))
  }, [venues, bookings, reviews, dateKey, time, maxPrice, filter, query, nearMe, today])

  const filtersOn = dateKey !== today || time !== 'any' || maxPrice > 0 || filter !== 'All' || query.trim() !== ''
  const clearFilters = () => { setDateKey(today); setTime('any'); setMaxPrice(0); setFilter('All'); setQuery('') }
  const dayLabel = dateKey === today ? 'today' : `on ${formatDay(dateKey)}`
  const selected = results.find(r => r.venue.id === selectedPin) ?? null

  const chip = (active: boolean) => ({
    flexShrink: 0, padding: '6px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer',
    border: active ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
    background: active ? 'var(--color-primary-light)' : 'var(--color-surface)',
    color: active ? 'var(--color-primary)' : 'var(--color-muted)', fontWeight: active ? 600 : 400,
  } as const)

  const card = (r: (typeof results)[number]) => (
    <button key={r.venue.id} onClick={() => onVenueTap(r.venue.slug, dateKey)}
      style={{ width: '100%', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 16, marginBottom: 14, overflow: 'hidden', cursor: 'pointer', textAlign: 'left', display: 'block' }}>
      {/* Photo */}
      <div style={{ position: 'relative', height: 160, background: 'var(--color-confirmed-bg)' }}>
        <img src={r.venue.images[0]} alt={r.venue.name} onError={e => { e.currentTarget.style.visibility = 'hidden' }} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.55)', borderRadius: 20, padding: '4px 10px', color: '#fff', fontSize: 12, fontWeight: 600, backdropFilter: 'blur(4px)' }}>
          ★ {r.rating.average.toFixed(1)} ({r.rating.count})
        </div>
        <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,0.55)', borderRadius: 20, padding: '4px 10px', color: '#fff', fontSize: 12, backdropFilter: 'blur(4px)' }}>
          {r.distance.toFixed(1)} km
        </div>
      </div>

      <div style={{ padding: '14px' }}>
        <div className="flex items-start justify-between gap-2 mb-1">
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-text)' }}>{r.venue.name}</div>
            <div style={{ fontSize: 13, color: 'var(--color-muted)' }}>{r.venue.area}</div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-primary)' }}>From {formatKES(r.from)}/hr</div>
          </div>
        </div>

        {/* Amenities */}
        <div className="flex gap-2 flex-wrap mt-2 mb-3">
          {r.venue.amenities.map(a => (
            <span key={a} style={{ fontSize: 12, color: 'var(--color-muted)', background: 'var(--color-bg)', padding: '3px 8px', borderRadius: 6 }}>{a}</span>
          ))}
        </div>

        {/* Next free slots */}
        <div>
          <div style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 6 }}>{r.nextSlots.length ? `Next free slots ${dayLabel}` : `Fully booked ${dayLabel}`}</div>
          <div className="flex gap-2">
            {r.nextSlots.map(h => (
              <span key={h} style={{ padding: '5px 12px', borderRadius: 20, background: 'var(--color-primary-light)', color: 'var(--color-primary)', fontSize: 13, fontWeight: 600 }}>{hourLabel(h)}</span>
            ))}
          </div>
        </div>
      </div>
    </button>
  )

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
        <button onClick={() => setSheet('date')} style={chip(dateKey !== today)}>📅 {dateKey === today ? 'Today' : formatDay(dateKey)}</button>
        <button onClick={() => setSheet('time')} style={chip(time !== 'any')}>🕐 {time === 'any' ? 'Time' : WINDOWS[time].label.split(' ·')[0]}</button>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ flexShrink: 0, padding: '6px 14px', borderRadius: 20, border: filter === f ? 'none' : '1px solid var(--color-border)', background: filter === f ? 'var(--color-primary)' : 'var(--color-bg)', color: filter === f ? '#fff' : 'var(--color-muted)', fontSize: 13, fontWeight: filter === f ? 600 : 400, cursor: 'pointer' }}>
            {f}
          </button>
        ))}
        <button onClick={() => setSheet('price')} style={chip(maxPrice > 0)}>💰 {maxPrice ? `Up to ${formatKES(maxPrice)}` : 'Price'}</button>
      </div>

      {/* Near me + List/Map */}
      <div className="flex items-center justify-between" style={{ padding: desktop ? '12px 32px 0' : '10px 16px', background: 'var(--color-bg)' }}>
        <button onClick={() => setNearMe(n => !n)} aria-pressed={nearMe}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 20, border: `1px solid ${nearMe ? 'var(--color-primary)' : 'var(--color-border)'}`, background: nearMe ? 'var(--color-primary-light)' : 'var(--color-surface)', color: nearMe ? 'var(--color-primary)' : 'var(--color-muted)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          {nearMe ? `📍 Near ${PLAYER_LOCATION.label}` : '⭐ Top rated'}
        </button>
        <div style={{ display: 'flex', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden' }}>
          {(['List', 'Map'] as const).map(v => (
            <button key={v} onClick={() => setView(v)} aria-pressed={view === v} style={{ padding: '6px 14px', border: 'none', background: view === v ? 'var(--color-primary)' : 'transparent', color: view === v ? '#fff' : 'var(--color-muted)', fontSize: 13, fontWeight: view === v ? 600 : 400, cursor: 'pointer' }}>{v}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: desktop ? '20px 32px 32px' : '0 16px 24px' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
          <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>{results.length} venue{results.length !== 1 ? 's' : ''} {nearMe ? `near ${PLAYER_LOCATION.label}` : 'by rating'}</span>
          {filtersOn && <button onClick={clearFilters} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Clear filters</button>}
        </div>

        {results.length === 0 ? (
          <EmptyState icon="🔍" title="No pitches match" message={`Nothing is free ${dayLabel} with these filters. Try another day or time.`} action="Clear filters" onAction={clearFilters} />
        ) : view === 'Map' ? (
          <div style={{ display: desktop ? 'grid' : 'block', gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 2fr)', gap: 20, alignItems: 'start' }}>
            <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid var(--color-border)', marginBottom: 14 }}>
              <VenueMap height={desktop ? 480 : 340} zoom={13} user={PLAYER_LOCATION} fitToPins
                center={selected ? { lat: selected.venue.lat, lng: selected.venue.lng } : PLAYER_LOCATION}
                pins={results.map(r => ({ id: r.venue.id, lat: r.venue.lat, lng: r.venue.lng, label: formatKES(r.from), selected: r.venue.id === selectedPin }))}
                onPinClick={id => setSelectedPin(id)} />
            </div>
            {selected ? card(selected) : (
              <div style={{ fontSize: 14, color: 'var(--color-muted)', textAlign: 'center', padding: '12px 0' }}>Tap a pin to see the venue.</div>
            )}
          </div>
        ) : (
          <ResponsiveGrid min={300}>
            {results.map(card)}
          </ResponsiveGrid>
        )}
      </div>

      {sheet === 'date' && (
        <FilterSheet title="Which day?" onClose={() => setSheet(null)}>
          {Array.from({ length: 7 }, (_, i) => addDays(today, i)).map(d => (
            <Chip key={d} selected={dateKey === d} onClick={() => { setDateKey(d); setSheet(null) }}>{d === today ? 'Today' : formatDay(d)}</Chip>
          ))}
        </FilterSheet>
      )}
      {sheet === 'time' && (
        <FilterSheet title="What time?" onClose={() => setSheet(null)}>
          {(Object.keys(WINDOWS) as TimeWindow[]).map(w => (
            <Chip key={w} selected={time === w} onClick={() => { setTime(w); setSheet(null) }}>{WINDOWS[w].label}</Chip>
          ))}
        </FilterSheet>
      )}
      {sheet === 'price' && (
        <FilterSheet title="Price per hour" onClose={() => setSheet(null)}>
          {PRICES.map(p => (
            <Chip key={p} selected={maxPrice === p} onClick={() => { setMaxPrice(p); setSheet(null) }}>{p ? `Up to ${formatKES(p)}` : 'Any price'}</Chip>
          ))}
        </FilterSheet>
      )}
    </div>
  )
}

function FilterSheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <BottomSheet onClose={onClose} label={title}>
      <div style={{ padding: '16px 20px 0' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', marginBottom: 14 }}>{title}</div>
        <div className="flex gap-2 flex-wrap" style={{ marginBottom: 18 }}>{children}</div>
        <PrimaryButton onClick={onClose} style={{ background: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}>Done</PrimaryButton>
      </div>
    </BottomSheet>
  )
}
