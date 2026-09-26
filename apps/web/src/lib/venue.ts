import type { BlockedPeriod, Booking, DayHours, Pitch, Venue } from '../types'
import { isActive, rangeOf } from './bookings'

/** Open 06:00–23:00 every day */
export const DEFAULT_HOURS: DayHours[] = Array.from({ length: 7 }, () => ({ open: 6, close: 23, closed: false }))

export const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function hourLabel(h: number) {
  return `${String(h).padStart(2, '0')}:00`
}

/** 0 = Sunday … 6 = Saturday */
export function weekdayOf(dateKey: string) {
  return new Date(`${dateKey}T12:00`).getDay()
}

export function hoursFor(venue: Venue, dateKey: string): DayHours {
  return venue.hours[weekdayOf(dateKey)] ?? DEFAULT_HOURS[0]
}

export function activePitches(venue: Venue) {
  return venue.pitches.filter(p => p.active)
}

export function isPeak(venue: Venue, dateKey: string, hour: number) {
  const wd = weekdayOf(dateKey)
  if (venue.peak.weekendsAllDay && (wd === 0 || wd === 6)) return true
  return hour >= venue.peak.start && hour < venue.peak.end
}

/** Price per hour for a pitch, by the start hour */
export function hourlyRate(venue: Venue, pitch: Pitch, dateKey: string, hour: number) {
  return isPeak(venue, dateKey, hour) ? pitch.pricePeak : pitch.priceOffPeak
}

export function priceFor(venue: Venue, pitchId: string, dateKey: string, startHour: number, hours: number) {
  const pitch = venue.pitches.find(p => p.id === pitchId) ?? venue.pitches[0]
  return Math.round(hourlyRate(venue, pitch, dateKey, startHour) * hours)
}

/** "Peak 17:00–22:00 · weekends all day" */
export function peakLabel(venue: Venue) {
  return `Peak ${hourLabel(venue.peak.start)}–${hourLabel(venue.peak.end)}${venue.peak.weekendsAllDay ? ' · weekends all day' : ''}`
}

export function priceFrom(venue: Venue) {
  const prices = activePitches(venue).map(p => p.priceOffPeak)
  return prices.length ? Math.min(...prices) : 0
}

export function blocksFor(venue: Venue, pitchId: string, dateKey: string): BlockedPeriod[] {
  return venue.blocked.filter(b => b.dateKey === dateKey && (b.pitchId === 'all' || b.pitchId === pitchId))
}

export type Conflict =
  | { kind: 'closed'; message: string }
  | { kind: 'blocked'; block: BlockedPeriod; message: string }
  | { kind: 'booking'; booking: Booking; message: string }

/** Why a pitch can't be booked for this time, or null if it's free */
export function conflictFor(
  venue: Venue,
  bookings: Booking[],
  pitchId: string,
  dateKey: string,
  startMin: number,
  endMin: number,
  ignoreRef?: string,
): Conflict | null {
  const hours = hoursFor(venue, dateKey)
  if (hours.closed) return { kind: 'closed', message: `${venue.name} is closed on ${WEEKDAY_NAMES[weekdayOf(dateKey)]}s` }
  if (startMin < hours.open * 60 || endMin > hours.close * 60) {
    return { kind: 'closed', message: `Open ${hourLabel(hours.open)}–${hourLabel(hours.close)} that day` }
  }
  const block = blocksFor(venue, pitchId, dateKey).find(b => startMin < b.endH * 60 && b.startH * 60 < endMin)
  if (block) return { kind: 'blocked', block, message: `Blocked ${hourLabel(block.startH)}–${hourLabel(block.endH)}: ${block.reason}` }
  const booking = bookings.find(b =>
    b.venueId === venue.id && b.pitchId === pitchId && b.dateKey === dateKey && isActive(b) && b.ref !== ignoreRef &&
    startMin < rangeOf(b)[1] && rangeOf(b)[0] < endMin)
  if (booking) return { kind: 'booking', booking, message: `Booked ${booking.time} by ${booking.customer}` }
  return null
}

/** Free one-hour slots on a day, earliest first */
export function freeSlots(
  venue: Venue,
  bookings: Booking[],
  dateKey: string,
  { fromHour = 0, pitchType, maxPrice }: { fromHour?: number; pitchType?: string; maxPrice?: number } = {},
) {
  const hours = hoursFor(venue, dateKey)
  if (hours.closed) return []
  const slots: { pitch: Pitch; hour: number; price: number }[] = []
  for (let h = Math.max(hours.open, fromHour); h < hours.close; h++) {
    for (const pitch of activePitches(venue)) {
      if (pitchType && pitch.type !== pitchType) continue
      const price = hourlyRate(venue, pitch, dateKey, h)
      if (maxPrice && price > maxPrice) continue
      if (!conflictFor(venue, bookings, pitch.id, dateKey, h * 60, (h + 1) * 60)) slots.push({ pitch, hour: h, price })
    }
  }
  return slots
}

/** Straight-line distance in km (good enough for "near me" across a city) */
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

/** Average rating combining the venue's earlier reviews with new ones */
export function ratingOf(venue: Venue, newRatings: number[]) {
  const baseCount = venue.baseReviewCount
  const count = baseCount + newRatings.length
  const total = venue.baseRating * baseCount + newRatings.reduce((s, r) => s + r, 0)
  return { average: count ? Math.round((total / count) * 10) / 10 : 0, count }
}
