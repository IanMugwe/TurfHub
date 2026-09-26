import { useState } from 'react'
import type { SlotSelection } from './types'
import { useIsDesktop } from '../../lib/useIsDesktop'
import { useDemoStore } from '../../app/DemoStore'
import { useAppState } from '../../app/AppState'
import { addDays, dayOfMonth, formatDay, todayKey, weekdayShort } from '../../lib/dates'
import { activePitches, conflictFor, distanceKm, hourLabel, hourlyRate, hoursFor, isPeak as isPeakHour, peakLabel, ratingOf } from '../../lib/venue'
import { NOW_HOUR, PLAYER_LOCATION } from '../../mocks/data'
import { useToast } from '../../ui/Toast'
import { formatKES } from '@turfhub/validation'
import type { Venue } from '../../types'

function Stars({ rating }: { rating: number }) {
  return <span aria-label={`${rating} out of 5`}>{'★★★★★'.slice(0, Math.round(rating))}<span style={{ opacity: 0.3 }}>{'★★★★★'.slice(Math.round(rating))}</span></span>
}

export default function VenuePage({ venue, onBack, onBook, initialDate }: { venue: Venue; onBack: () => void; onBook: (slot: SlotSelection) => void; initialDate?: string }) {
  const desktop = useIsDesktop()
  const { bookings, reviews, favourites, toggleFavourite } = useDemoStore()
  const { session } = useAppState()
  const toast = useToast()
  const today = todayKey()
  const pitches = activePitches(venue)
  const [selectedPitch, setSelectedPitch] = useState(pitches[0]?.id ?? '')
  // The next 7 days, starting today
  const DAYS = Array.from({ length: 7 }, (_, i) => addDays(today, i))
  const [selectedDay, setSelectedDay] = useState(Math.max(0, DAYS.indexOf(initialDate ?? today)))
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null)
  const [imgIdx, setImgIdx] = useState(0)
  const [showAllReviews, setShowAllReviews] = useState(false)

  const pitch = pitches.find(p => p.id === selectedPitch) ?? pitches[0]
  const dateKey = DAYS[selectedDay]
  const day = formatDay(dateKey)
  const hours = hoursFor(venue, dateKey)
  const slots = hours.closed ? [] : Array.from({ length: hours.close - hours.open }, (_, i) => hours.open + i)
  // A slot is taken if the hour has passed today, or the pitch is booked or blocked
  const taken = (h: number) => (dateKey === today && h <= NOW_HOUR) || !!conflictFor(venue, bookings, pitch.id, dateKey, h * 60, (h + 1) * 60)

  const venueReviews = reviews.filter(r => r.venueId === venue.id).sort((a, b) => b.dateKey.localeCompare(a.dateKey))
  const rating = ratingOf(venue, venueReviews.filter(r => r.id.startsWith('rv-new')).map(r => r.rating))
  const isFavourite = !!session && (favourites[session.phone] ?? []).includes(venue.id)
  const distance = distanceKm(PLAYER_LOCATION, venue)

  function favourite() {
    if (!session) return
    const on = toggleFavourite(session.phone, venue.id)
    toast(on ? `Saved ${venue.name} to favourites` : `Removed ${venue.name} from favourites`)
  }

  function handleBook() {
    if (selectedSlot === null) return
    onBook({
      venueId: venue.id,
      pitchId: pitch.id,
      venueName: venue.name,
      area: venue.area,
      pitch: pitch.name,
      pitchType: pitch.type,
      dateKey,
      date: day,
      time: `${hourLabel(selectedSlot)}–${hourLabel(selectedSlot + 1)}`,
      price: hourlyRate(venue, pitch, dateKey, selectedSlot),
      isPeak: isPeakHour(venue, dateKey, selectedSlot),
    })
  }

  return (
    <div>
      {/* Photo gallery */}
      <div style={{ ...(desktop && { margin: '24px 16px 0', borderRadius: 20, overflow: 'hidden' }), position: 'relative', height: desktop ? 360 : 240, background: 'var(--color-confirmed-bg)', flexShrink: 0 }}>
        <img src={venue.images[imgIdx] ?? venue.images[0]} alt={venue.name} onError={e => { e.currentTarget.style.visibility = 'hidden' }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        {/* Back button */}
        <button onClick={onBack} aria-label="Back" style={{ position: 'absolute', top: 48, left: 16, width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.45)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, backdropFilter: 'blur(4px)' }}>‹</button>
        {/* Dots */}
        {venue.images.length > 1 && (
          <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
            {venue.images.map((_, i) => (
              <button key={i} onClick={() => setImgIdx(i)} aria-label={`Photo ${i + 1}`} style={{ width: 6, height: 6, borderRadius: '50%', border: 'none', background: i === imgIdx ? '#fff' : 'rgba(255,255,255,0.5)', padding: 0, cursor: 'pointer' }} />
            ))}
          </div>
        )}
        {/* Favourite */}
        <button onClick={favourite} aria-label={isFavourite ? 'Remove from favourites' : 'Add to favourites'} aria-pressed={isFavourite}
          style={{ position: 'absolute', top: 48, right: 16, width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.45)', border: 'none', cursor: 'pointer', fontSize: 18, backdropFilter: 'blur(4px)' }}>
          {isFavourite ? '❤️' : '🤍'}
        </button>
      </div>

      <div style={{ padding: '16px 16px 0' }}>
        {/* Venue info */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)' }}>{venue.name}</div>
            <div style={{ fontSize: 14, color: 'var(--color-muted)' }}>📍 {venue.area} · {distance.toFixed(1)} km away</div>
          </div>
          <div style={{ background: 'var(--color-pending-bg)', borderRadius: 8, padding: '6px 10px', textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-pending-strong)' }}>{rating.count ? rating.average.toFixed(1) : 'New'}</div>
            <div style={{ fontSize: 11, color: 'var(--color-pending-strong)' }}><Stars rating={rating.average} /></div>
            <div style={{ fontSize: 11, color: 'var(--color-pending-strong)' }}>{rating.count} review{rating.count === 1 ? '' : 's'}</div>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex gap-3 mb-4">
          <a href={`https://www.google.com/maps/dir/?api=1&destination=${venue.lat},${venue.lng}`} target="_blank" rel="noreferrer" style={{ flex: 1, padding: '10px', borderRadius: 10, background: 'var(--color-primary-light)', color: 'var(--color-primary)', fontSize: 14, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            🗺 Get directions
          </a>
          <a href={`tel:${venue.phone.replace(/\s/g, '')}`} style={{ flex: 1, padding: '10px', borderRadius: 10, background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)', fontSize: 14, fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            📞 Call
          </a>
        </div>

        {/* Amenities */}
        <div className="flex gap-2 flex-wrap mb-4">
          {venue.amenities.map(a => (
            <span key={a} style={{ fontSize: 13, color: 'var(--color-primary)', background: 'var(--color-primary-light)', padding: '5px 10px', borderRadius: 20 }}>{a}</span>
          ))}
        </div>

        {/* Pitch tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          {pitches.map(p => (
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
              <div style={{ fontSize: 11 }}>{weekdayShort(d)}</div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{dayOfMonth(d)}</div>
            </button>
          ))}
        </div>

        {/* Pricing note */}
        <div style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 10 }}>
          Off-peak <strong style={{ color: 'var(--color-text)' }}>{formatKES(pitch.priceOffPeak)}</strong> · {peakLabel(venue)} <strong style={{ color: 'var(--color-primary)' }}>{formatKES(pitch.pricePeak)}</strong>
        </div>

        {/* Slot grid */}
        {hours.closed ? (
          <div style={{ fontSize: 14, color: 'var(--color-muted)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '16px', textAlign: 'center', marginBottom: 24 }}>
            Closed on {day.split(' ')[0]}days. Pick another day.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: desktop ? 'repeat(6, 1fr)' : 'repeat(4, 1fr)', gap: 8, marginBottom: 24 }}>
            {slots.map(h => {
              const isPeak = isPeakHour(venue, dateKey, h)
              const isBooked = taken(h)
              const isSelected = selectedSlot === h
              return (
                <button key={h} disabled={isBooked} onClick={() => setSelectedSlot(isSelected ? null : h)} aria-label={`${hourLabel(h)}${isBooked ? ' (unavailable)' : ''}`}
                  style={{
                    padding: '10px 6px', borderRadius: 10, cursor: isBooked ? 'not-allowed' : 'pointer',
                    border: isSelected ? 'none' : `1px solid ${isBooked ? 'var(--color-border)' : isPeak ? 'var(--color-peak-border)' : 'var(--color-border)'}`,
                    background: isSelected ? 'var(--color-primary)' : isBooked ? 'var(--color-bg)' : isPeak ? 'var(--color-peak)' : 'var(--color-bg)',
                    opacity: isBooked ? 0.4 : 1,
                  }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: isSelected ? '#fff' : isBooked ? 'var(--color-muted-light)' : 'var(--color-text)', textDecoration: isBooked ? 'line-through' : 'none' }}>{hourLabel(h)}</div>
                  {isPeak && <div style={{ fontSize: 10, color: isSelected ? 'rgba(255,255,255,0.8)' : 'var(--color-peak-text)', marginTop: 2 }}>Peak</div>}
                </button>
              )
            })}
          </div>
        )}

        {/* About */}
        {(venue.description || venue.address) && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>About</div>
            {venue.description && <div style={{ fontSize: 14, color: 'var(--color-muted)', lineHeight: 1.55, marginBottom: 6 }}>{venue.description}</div>}
            {venue.address && <div style={{ fontSize: 13, color: 'var(--color-muted)' }}>📍 {venue.address}</div>}
          </div>
        )}

        {/* Reviews */}
        <div style={{ marginBottom: selectedSlot !== null ? 150 : 40 }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>Reviews</span>
            {venueReviews.length > 3 && (
              <button onClick={() => setShowAllReviews(s => !s)} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                {showAllReviews ? 'Show fewer' : `See all ${venueReviews.length}`}
              </button>
            )}
          </div>
          {venueReviews.length === 0 && <div style={{ fontSize: 14, color: 'var(--color-muted)' }}>No written reviews yet.</div>}
          {(showAllReviews ? venueReviews : venueReviews.slice(0, 3)).map(r => (
            <div key={r.id} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '12px 14px', marginBottom: 8 }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{r.author}</span>
                <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>{formatDay(r.dateKey)}</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--color-pending)', marginBottom: 4 }}><Stars rating={r.rating} /></div>
              {r.comment && <div style={{ fontSize: 14, color: 'var(--color-text)', lineHeight: 1.5 }}>{r.comment}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Sticky booking bar */}
      {selectedSlot !== null && (
        <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 'var(--frame-width)', background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', padding: '12px 16px 24px', zIndex: 90 }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{pitch.name} · {day} · {hourLabel(selectedSlot)}</div>
              <div style={{ fontSize: 13, color: 'var(--color-muted)' }}>
                {isPeakHour(venue, dateKey, selectedSlot) ? '🔴 Peak' : '🟢 Off-peak'} · {formatKES(hourlyRate(venue, pitch, dateKey, selectedSlot))}
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
