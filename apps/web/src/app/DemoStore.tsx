import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { addDays, formatDay, todayKey } from '../lib/dates'
import { isActive, paymentStatusFor, rangeOf, toMinutes } from '../lib/bookings'
import { DEFAULT_HOURS, conflictFor, priceFor, type Conflict } from '../lib/venue'
import { seedBookings, seedPlayerBookings, seedReviews, seedVenues } from '../mocks/data'
import type { BlockedPeriod, Booking, BookingSource, PaymentMethod, Pitch, PlayerBooking, Review, StaffRole, TeamMember, Venue } from '../types'
import type { SlotSelection } from '../features/player/types'

/**
 * Demo data for the whole app, kept in this browser until the API replaces it.
 *
 * Everything you do (bookings, payments, venue settings, team, reviews, favourites) shows up on
 * every screen straight away, and in other tabs of the same browser, so an owner window and a
 * player window stay in sync. Data reseeds each day so dates stay current; open /reset-demo to
 * start fresh.
 */

interface DemoState {
  seededOn: string
  venues: Venue[]
  bookings: Booking[]
  playerBookings: PlayerBooking[]
  reviews: Review[]
  /** Player phone → favourite venue ids */
  favourites: Record<string, string[]>
  seq: number
}

export interface NewBookingInput {
  venueId: string
  pitchId: string
  dateKey: string
  /** "15:00" */
  start: string
  hours: number
  customer: string
  phone: string
  source: BookingSource
  notes?: string
  /** Repeat weekly for this many weeks in total (1 = no repeat) */
  weeks?: number
}

export interface MoveInput {
  dateKey: string
  pitchId: string
  /** "15:00" */
  start: string
}

interface DemoStore extends DemoState {
  venueById: (id: string) => Venue | undefined
  // Bookings
  addBooking: (input: NewBookingInput) => { created: Booking[]; skipped: string[] }
  clashesFor: (input: NewBookingInput) => { first: Conflict | null; repeatDates: string[] }
  moveBooking: (ref: string, to: MoveInput, scope?: 'one' | 'following') => { moved: number; skipped: number }
  extendBooking: (ref: string, minutes: number) => void
  recordPayment: (ref: string, amount: number, method: PaymentMethod, code?: string) => void
  waiveBalance: (ref: string) => void
  cancelBooking: (ref: string) => void
  markNoShow: (ref: string) => void
  decideRequest: (ref: string, decision: 'accepted' | 'rejected') => void
  addPlayerBooking: (slot: SlotSelection, player: { name: string; phone: string }) => PlayerBooking
  cancelPlayerBooking: (ref: string) => void
  // Venue settings
  updateVenue: (venueId: string, patch: Partial<Venue>) => void
  savePitch: (venueId: string, pitch: Pitch) => void
  addBlock: (venueId: string, block: Omit<BlockedPeriod, 'id'>) => void
  removeBlock: (venueId: string, blockId: string) => void
  inviteMember: (venueId: string, member: { name: string; phone: string; role: StaffRole }) => void
  removeMember: (venueId: string, phone: string) => void
  setMemberRole: (venueId: string, phone: string, role: StaffRole) => void
  createVenue: (owner: { name: string; phone: string }, details: { name: string; area: string; address: string; pitches: Pitch[] }) => Venue
  // Player
  toggleFavourite: (playerPhone: string, venueId: string) => boolean
  addReview: (review: Omit<Review, 'id' | 'dateKey'>) => void
  reset: () => void
}

const STORAGE_KEY = 'turf.demo.v2'

function seed(): DemoState {
  const venues = seedVenues()
  return {
    seededOn: todayKey(),
    venues,
    bookings: seedBookings(venues),
    playerBookings: seedPlayerBookings(),
    reviews: seedReviews(),
    favourites: { '+254 712 345 678': ['greenfield'] },
    seq: 1,
  }
}

function load(): DemoState {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as DemoState | null
    // Start fresh each day so "today" in the demo is always today
    if (saved && saved.seededOn === todayKey() && Array.isArray(saved.venues)) return saved
  } catch {
    // Corrupt or unavailable storage: fall back to fresh data
  }
  return seed()
}

function save(state: DemoState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage unavailable (private mode): changes last until the page is closed
  }
}

function nowLabel() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function minutesLabel(m: number) {
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}

function hoursLabel(minutes: number) {
  const h = minutes / 60
  return `${Number.isInteger(h) ? h : h.toFixed(1)}h`
}

function newRef(seq: number) {
  // Short, readable and unique within the demo
  return `TRF-${(46656 + seq * 7919).toString(36).toUpperCase().slice(-4)}`
}

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

const DemoStoreContext = createContext<DemoStore | null>(null)

export function DemoStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(load)

  // Save every change, and pick up changes made in other tabs
  useEffect(() => save(state), [state])
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setState(load())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const venueById = useCallback((id: string) => state.venues.find(v => v.id === id), [state.venues])

  const updateBooking = useCallback((ref: string, change: (b: Booking) => Booking) => {
    setState(s => ({ ...s, bookings: s.bookings.map(b => (b.ref === ref ? change(b) : b)) }))
  }, [])

  const updateVenueWith = useCallback((venueId: string, change: (v: Venue) => Venue) => {
    setState(s => ({ ...s, venues: s.venues.map(v => (v.id === venueId ? change(v) : v)) }))
  }, [])

  // ── Bookings ──

  const clashesFor = useCallback((input: NewBookingInput) => {
    const venue = state.venues.find(v => v.id === input.venueId)
    if (!venue) return { first: null, repeatDates: [] }
    const start = toMinutes(input.start)
    const end = start + Math.round(input.hours * 60)
    const repeatDates: string[] = []
    for (let w = 1; w < (input.weeks ?? 1); w++) {
      const key = addDays(input.dateKey, w * 7)
      if (conflictFor(venue, state.bookings, input.pitchId, key, start, end)) repeatDates.push(key)
    }
    return { first: conflictFor(venue, state.bookings, input.pitchId, input.dateKey, start, end), repeatDates }
  }, [state.venues, state.bookings])

  const addBooking = useCallback((input: NewBookingInput) => {
    const venue = state.venues.find(v => v.id === input.venueId)!
    const pitch = venue.pitches.find(p => p.id === input.pitchId)!
    const start = toMinutes(input.start)
    const minutes = Math.round(input.hours * 60)
    const weeks = Math.max(1, input.weeks ?? 1)
    const { repeatDates } = clashesFor(input)

    const created: Booking[] = []
    let seq = state.seq
    const seriesId = weeks > 1 ? `series-${seq + 1}` : undefined
    for (let w = 0; w < weeks; w++) {
      const dateKey = addDays(input.dateKey, w * 7)
      if (w > 0 && repeatDates.includes(dateKey)) continue
      seq += 1
      created.push({
        id: `new-${seq}`,
        ref: newRef(seq),
        venueId: venue.id,
        pitchId: pitch.id,
        seriesId,
        customer: input.customer.trim(),
        phone: input.phone.trim(),
        pitch: pitch.name,
        pitchType: pitch.type,
        dateKey,
        date: formatDay(dateKey),
        time: `${input.start}–${minutesLabel(start + minutes)}`,
        duration: hoursLabel(minutes),
        // Staff-created bookings are always confirmed (implementation plan §2.2)
        status: 'confirmed',
        payment: 'unpaid',
        amount: priceFor(venue, pitch.id, dateKey, Math.floor(start / 60), input.hours),
        paid: 0,
        source: input.source,
        notes: input.notes?.trim() || undefined,
        series: weeks > 1 ? { index: w + 1, total: weeks } : undefined,
      })
    }
    setState(s => ({ ...s, seq, bookings: [...s.bookings, ...created] }))
    return { created, skipped: repeatDates }
  }, [clashesFor, state.seq, state.venues])

  const moveBooking = useCallback((ref: string, to: MoveInput, scope: 'one' | 'following' = 'one') => {
    const target = state.bookings.find(b => b.ref === ref)
    const venue = target && state.venues.find(v => v.id === target.venueId)
    if (!target || !venue) return { moved: 0, skipped: 0 }
    const pitch = venue.pitches.find(p => p.id === to.pitchId)!
    const [s0, e0] = rangeOf(target)
    const minutes = e0 - s0
    const start = toMinutes(to.start)
    const dayShift = Math.round((new Date(`${to.dateKey}T12:00`).getTime() - new Date(`${target.dateKey}T12:00`).getTime()) / 86400000)

    // The booking itself, plus later ones in the same weekly series when asked
    const group = scope === 'following' && target.seriesId
      ? state.bookings.filter(b => b.seriesId === target.seriesId && b.dateKey >= target.dateKey && isActive(b))
      : [target]
    const others = state.bookings.filter(b => !group.includes(b))
    let moved = 0
    let skipped = 0
    const updates = new Map<string, Booking>()
    for (const b of group) {
      const dateKey = addDays(b.dateKey, dayShift)
      if (conflictFor(venue, others, pitch.id, dateKey, start, start + minutes, b.ref)) { skipped += 1; continue }
      moved += 1
      updates.set(b.ref, {
        ...b, pitchId: pitch.id, pitch: pitch.name, pitchType: pitch.type, dateKey, date: formatDay(dateKey),
        time: `${to.start}–${minutesLabel(start + minutes)}`,
        amount: Math.max(b.paid, priceFor(venue, pitch.id, dateKey, Math.floor(start / 60), minutes / 60)),
      })
    }
    setState(s => ({ ...s, bookings: s.bookings.map(b => updates.get(b.ref) ?? b) }))
    return { moved, skipped }
  }, [state.bookings, state.venues])

  const extendBooking = useCallback((ref: string, minutes: number) => {
    updateBooking(ref, b => {
      const venue = state.venues.find(v => v.id === b.venueId)!
      const [start, end] = rangeOf(b)
      const total = end - start + minutes
      const amount = priceFor(venue, b.pitchId, b.dateKey, Math.floor(start / 60), total / 60)
      return { ...b, time: `${minutesLabel(start)}–${minutesLabel(start + total)}`, duration: hoursLabel(total), amount, payment: b.payment === 'waived' ? 'waived' : paymentStatusFor(amount, b.paid) }
    })
  }, [state.venues, updateBooking])

  const recordPayment = useCallback((ref: string, amount: number, method: PaymentMethod, code?: string) => {
    updateBooking(ref, b => {
      const paid = Math.min(b.amount, b.paid + Math.max(0, Math.round(amount)))
      return { ...b, paid, payment: paymentStatusFor(b.amount, paid), payments: [...(b.payments ?? []), { amount: paid - b.paid, method, code: code || undefined, at: nowLabel() }] }
    })
  }, [updateBooking])

  const waiveBalance = useCallback((ref: string) => updateBooking(ref, b => ({ ...b, payment: 'waived' })), [updateBooking])
  const markNoShow = useCallback((ref: string) => updateBooking(ref, b => ({ ...b, status: 'noshow' })), [updateBooking])

  const cancelBooking = useCallback((ref: string) => {
    setState(s => ({
      ...s,
      bookings: s.bookings.map(b => (b.ref === ref ? { ...b, status: 'cancelled' } : b)),
      playerBookings: s.playerBookings.map(p => (p.ref === ref ? { ...p, status: 'cancelled' } : p)),
    }))
  }, [])

  const decideRequest = useCallback((ref: string, decision: 'accepted' | 'rejected') => {
    const status = decision === 'accepted' ? 'confirmed' : 'cancelled'
    setState(s => ({
      ...s,
      bookings: s.bookings.map(b => (b.ref === ref ? { ...b, status, expiresIn: undefined } : b)),
      playerBookings: s.playerBookings.map(p => (p.ref === ref ? { ...p, status } : p)),
    }))
  }, [])

  const addPlayerBooking = useCallback((slot: SlotSelection, player: { name: string; phone: string }) => {
    const venue = state.venues.find(v => v.id === slot.venueId)!
    const pitch = venue.pitches.find(p => p.id === slot.pitchId) ?? venue.pitches[0]
    const seq = state.seq + 1
    const ref = newRef(seq)
    // The venue's "Auto-confirm app bookings" setting decides whether the owner must approve it
    const status = venue.autoConfirm ? 'confirmed' : 'pending'
    const playerBooking: PlayerBooking = {
      ref, venueId: venue.id, venue: venue.name, area: venue.area.split(',')[0], pitch: `${pitch.name} · ${pitch.type}`,
      dateKey: slot.dateKey, date: slot.date, time: slot.time, price: slot.price, status,
    }
    const venueBooking: Booking = {
      id: `new-${seq}`, ref, venueId: venue.id, pitchId: pitch.id, customer: player.name, phone: player.phone,
      pitch: pitch.name, pitchType: pitch.type, dateKey: slot.dateKey, date: slot.date, time: slot.time, duration: '1h',
      status, payment: 'unpaid', amount: slot.price, paid: 0, source: 'app', expiresIn: status === 'pending' ? '2h 00m' : undefined,
    }
    setState(s => ({ ...s, seq, playerBookings: [playerBooking, ...s.playerBookings], bookings: [...s.bookings, venueBooking] }))
    return playerBooking
  }, [state.seq, state.venues])

  // ── Venue settings ──

  const updateVenue = useCallback((venueId: string, patch: Partial<Venue>) => updateVenueWith(venueId, v => ({ ...v, ...patch })), [updateVenueWith])

  const savePitch = useCallback((venueId: string, pitch: Pitch) => {
    setState(s => ({
      ...s,
      venues: s.venues.map(v => v.id !== venueId ? v : {
        ...v,
        pitches: v.pitches.some(p => p.id === pitch.id) ? v.pitches.map(p => (p.id === pitch.id ? pitch : p)) : [...v.pitches, pitch],
      }),
      // A renamed pitch keeps its bookings
      bookings: s.bookings.map(b => (b.venueId === venueId && b.pitchId === pitch.id ? { ...b, pitch: pitch.name, pitchType: pitch.type } : b)),
    }))
  }, [])

  const addBlock = useCallback((venueId: string, block: Omit<BlockedPeriod, 'id'>) => {
    setState(s => ({ ...s, seq: s.seq + 1, venues: s.venues.map(v => (v.id === venueId ? { ...v, blocked: [...v.blocked, { ...block, id: `blk-${s.seq + 1}` }] } : v)) }))
  }, [])

  const removeBlock = useCallback((venueId: string, blockId: string) => {
    updateVenueWith(venueId, v => ({ ...v, blocked: v.blocked.filter(b => b.id !== blockId) }))
  }, [updateVenueWith])

  const inviteMember = useCallback((venueId: string, member: { name: string; phone: string; role: StaffRole }) => {
    updateVenueWith(venueId, v => ({ ...v, team: [...v.team.filter(m => m.phone !== member.phone), { ...member, status: 'invited' } as TeamMember] }))
  }, [updateVenueWith])

  const removeMember = useCallback((venueId: string, phone: string) => {
    updateVenueWith(venueId, v => ({ ...v, team: v.team.filter(m => m.phone !== phone) }))
  }, [updateVenueWith])

  const setMemberRole = useCallback((venueId: string, phone: string, role: StaffRole) => {
    updateVenueWith(venueId, v => ({ ...v, team: v.team.map(m => (m.phone === phone ? { ...m, role } : m)) }))
  }, [updateVenueWith])

  const createVenue = useCallback((owner: { name: string; phone: string }, details: { name: string; area: string; address: string; pitches: Pitch[] }) => {
    const base = slugify(details.name) || 'venue'
    const taken = new Set(state.venues.map(v => v.id))
    let id = base
    for (let n = 2; taken.has(id); n++) id = `${base}-${n}`
    const venue: Venue = {
      id, slug: id, name: details.name.trim(), area: details.area.trim(), address: details.address.trim(),
      description: '', phone: owner.phone, lat: -1.2921, lng: 36.8219,
      images: ['https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&h=450&fit=crop&auto=format'],
      amenities: [], status: 'pending', pitches: details.pitches,
      hours: DEFAULT_HOURS.map(h => ({ ...h })), peak: { start: 17, end: 22, weekendsAllDay: false }, blocked: [],
      cancellationHours: 2, autoConfirm: false,
      team: [{ name: owner.name, phone: owner.phone, role: 'owner', status: 'active' }],
      notifications: { newRequests: true, cancellations: true, dailySummary: true, paymentReminders: false },
      baseRating: 0, baseReviewCount: 0,
    }
    setState(s => ({ ...s, venues: [...s.venues, venue] }))
    return venue
  }, [state.venues])

  // ── Player ──

  const toggleFavourite = useCallback((playerPhone: string, venueId: string) => {
    const current = state.favourites[playerPhone] ?? []
    const on = !current.includes(venueId)
    setState(s => ({ ...s, favourites: { ...s.favourites, [playerPhone]: on ? [...current, venueId] : current.filter(id => id !== venueId) } }))
    return on
  }, [state.favourites])

  const addReview = useCallback((review: Omit<Review, 'id' | 'dateKey'>) => {
    setState(s => ({ ...s, seq: s.seq + 1, reviews: [{ ...review, id: `rv-new-${s.seq + 1}`, dateKey: todayKey() }, ...s.reviews] }))
  }, [])

  const reset = useCallback(() => setState(seed()), [])

  const value = useMemo<DemoStore>(() => ({
    ...state, venueById, addBooking, clashesFor, moveBooking, extendBooking, recordPayment, waiveBalance, cancelBooking,
    markNoShow, decideRequest, addPlayerBooking, cancelPlayerBooking: cancelBooking, updateVenue, savePitch, addBlock,
    removeBlock, inviteMember, removeMember, setMemberRole, createVenue, toggleFavourite, addReview, reset,
  }), [state, venueById, addBooking, clashesFor, moveBooking, extendBooking, recordPayment, waiveBalance, cancelBooking,
    markNoShow, decideRequest, addPlayerBooking, updateVenue, savePitch, addBlock, removeBlock, inviteMember, removeMember,
    setMemberRole, createVenue, toggleFavourite, addReview, reset])

  return <DemoStoreContext.Provider value={value}>{children}</DemoStoreContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDemoStore() {
  const ctx = useContext(DemoStoreContext)
  if (!ctx) throw new Error('useDemoStore must be used inside DemoStoreProvider')
  return ctx
}
