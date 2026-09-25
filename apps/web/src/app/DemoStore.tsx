import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { formatDay, todayKey } from '../lib/dates'
import { isActive, paymentStatusFor, rangeOf, toMinutes } from '../lib/bookings'
import { VENUE, hourlyPrice, seedBookings, seedPlayerBookings } from '../mocks/data'
import type { Booking, BookingSource, PaymentMethod, PlayerBooking } from '../types'
import type { SlotSelection } from '../features/player/types'

/**
 * Demo data for the whole app, kept in this browser until the API replaces it.
 *
 * Everything you do (new bookings, payments, cancellations, requests from the player app)
 * shows up on every screen straight away, and in other tabs of the same browser, so an
 * owner window and a player window stay in sync. Data reseeds each day so dates stay current;
 * open /reset-demo to start fresh.
 */

interface DemoState {
  seededOn: string
  bookings: Booking[]
  playerBookings: PlayerBooking[]
  autoConfirm: boolean
  seq: number
}

export interface NewBookingInput {
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

interface DemoStore extends DemoState {
  addBooking: (input: NewBookingInput) => { created: Booking[]; skipped: string[] }
  clashesFor: (input: NewBookingInput) => { first?: Booking; repeatDates: string[] }
  recordPayment: (ref: string, amount: number, method: PaymentMethod, code?: string) => void
  waiveBalance: (ref: string) => void
  cancelBooking: (ref: string) => void
  markNoShow: (ref: string) => void
  decideRequest: (ref: string, decision: 'accepted' | 'rejected') => void
  addPlayerBooking: (slot: SlotSelection, player: { name: string; phone: string }) => PlayerBooking
  cancelPlayerBooking: (ref: string) => void
  setAutoConfirm: (on: boolean) => void
  reset: () => void
}

const STORAGE_KEY = 'turf.demo.v1'

function seed(): DemoState {
  return { seededOn: todayKey(), bookings: seedBookings(), playerBookings: seedPlayerBookings(), autoConfirm: false, seq: 1 }
}

function load(): DemoState {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as DemoState | null
    // Start fresh each day so "today" in the demo is always today
    if (saved && saved.seededOn === todayKey()) return saved
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

function addWeeks(dateKey: string, weeks: number) {
  const [y, m, d] = dateKey.split('-').map(Number)
  const date = new Date(y, m - 1, d + weeks * 7, 12)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function newRef(seq: number) {
  // Short, readable and unique within the demo
  return `TRF-${(46656 + seq * 7919).toString(36).toUpperCase().slice(-4)}`
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

  const update = useCallback((ref: string, change: (b: Booking) => Booking) => {
    setState(s => ({ ...s, bookings: s.bookings.map(b => (b.ref === ref ? change(b) : b)) }))
  }, [])

  const clashesFor = useCallback((input: NewBookingInput) => {
    const pitch = VENUE.pitches.find(p => p.id === input.pitchId)!
    const start = toMinutes(input.start)
    const end = start + input.hours * 60
    const clashOn = (dateKey: string) => state.bookings.find(b => {
      if (b.dateKey !== dateKey || b.pitch !== pitch.name || !isActive(b)) return false
      const [bs, be] = rangeOf(b)
      return start < be && bs < end
    })
    const repeatDates: string[] = []
    for (let w = 1; w < (input.weeks ?? 1); w++) {
      const key = addWeeks(input.dateKey, w)
      if (clashOn(key)) repeatDates.push(key)
    }
    return { first: clashOn(input.dateKey), repeatDates }
  }, [state.bookings])

  const addBooking = useCallback((input: NewBookingInput) => {
    const pitch = VENUE.pitches.find(p => p.id === input.pitchId)!
    const startH = Math.floor(toMinutes(input.start) / 60)
    const end = toMinutes(input.start) + input.hours * 60
    const endLabel = `${String(Math.floor(end / 60)).padStart(2, '0')}:${String(end % 60).padStart(2, '0')}`
    const amount = Math.round(hourlyPrice(input.pitchId, startH) * input.hours)
    const weeks = Math.max(1, input.weeks ?? 1)
    const { repeatDates } = clashesFor(input)

    const created: Booking[] = []
    let seq = state.seq
    for (let w = 0; w < weeks; w++) {
      const dateKey = addWeeks(input.dateKey, w)
      if (w > 0 && repeatDates.includes(dateKey)) continue
      seq += 1
      created.push({
        id: `new-${seq}`,
        ref: newRef(seq),
        customer: input.customer.trim(),
        phone: input.phone.trim(),
        pitch: pitch.name,
        pitchType: pitch.type,
        dateKey,
        date: formatDay(dateKey),
        time: `${input.start}–${endLabel}`,
        duration: `${input.hours}h`,
        // Staff-created bookings are always confirmed (implementation plan §2.2)
        status: 'confirmed',
        payment: 'unpaid',
        amount,
        paid: 0,
        source: input.source,
        notes: input.notes?.trim() || undefined,
        series: weeks > 1 ? { index: w + 1, total: weeks } : undefined,
      })
    }
    setState(s => ({ ...s, seq, bookings: [...s.bookings, ...created] }))
    return { created, skipped: repeatDates }
  }, [clashesFor, state.seq])

  const recordPayment = useCallback((ref: string, amount: number, method: PaymentMethod, code?: string) => {
    update(ref, b => {
      const paid = Math.min(b.amount, b.paid + Math.max(0, Math.round(amount)))
      return { ...b, paid, payment: paymentStatusFor(b.amount, paid), payments: [...(b.payments ?? []), { amount: paid - b.paid, method, code: code || undefined, at: nowLabel() }] }
    })
  }, [update])

  const waiveBalance = useCallback((ref: string) => update(ref, b => ({ ...b, payment: 'waived' })), [update])
  const cancelBooking = useCallback((ref: string) => {
    setState(s => ({
      ...s,
      bookings: s.bookings.map(b => (b.ref === ref ? { ...b, status: 'cancelled' } : b)),
      playerBookings: s.playerBookings.map(p => (p.ref === ref ? { ...p, status: 'cancelled' } : p)),
    }))
  }, [])
  const markNoShow = useCallback((ref: string) => update(ref, b => ({ ...b, status: 'noshow' })), [update])

  const decideRequest = useCallback((ref: string, decision: 'accepted' | 'rejected') => {
    const status = decision === 'accepted' ? 'confirmed' : 'cancelled'
    setState(s => ({
      ...s,
      bookings: s.bookings.map(b => (b.ref === ref ? { ...b, status, expiresIn: undefined } : b)),
      playerBookings: s.playerBookings.map(p => (p.ref === ref ? { ...p, status } : p)),
    }))
  }, [])

  const addPlayerBooking = useCallback((slot: SlotSelection, player: { name: string; phone: string }) => {
    const seq = state.seq + 1
    const ref = newRef(seq)
    // The venue's "Auto-confirm app bookings" setting decides whether the owner must approve it
    const status = state.autoConfirm ? 'confirmed' : 'pending'
    const pitch = VENUE.pitches.find(p => p.name === slot.pitch) ?? VENUE.pitches[0]
    const playerBooking: PlayerBooking = {
      ref, venue: slot.venueName, area: slot.area.split(',')[0], pitch: `${slot.pitch} · ${slot.pitchType}`,
      dateKey: slot.dateKey, date: slot.date, time: slot.time, price: slot.price, status,
    }
    const venueBooking: Booking = {
      id: `new-${seq}`, ref, customer: player.name, phone: player.phone, pitch: pitch.name, pitchType: pitch.type,
      dateKey: slot.dateKey, date: slot.date, time: slot.time, duration: '1h', status, payment: 'unpaid',
      amount: slot.price, paid: 0, source: 'app', expiresIn: status === 'pending' ? '2h 00m' : undefined,
    }
    setState(s => ({ ...s, seq, playerBookings: [playerBooking, ...s.playerBookings], bookings: [...s.bookings, venueBooking] }))
    return playerBooking
  }, [state.seq, state.autoConfirm])

  const setAutoConfirm = useCallback((on: boolean) => setState(s => ({ ...s, autoConfirm: on })), [])
  const reset = useCallback(() => setState(seed()), [])

  const value = useMemo<DemoStore>(() => ({
    ...state, addBooking, clashesFor, recordPayment, waiveBalance, cancelBooking, markNoShow, decideRequest,
    addPlayerBooking, cancelPlayerBooking: cancelBooking, setAutoConfirm, reset,
  }), [state, addBooking, clashesFor, recordPayment, waiveBalance, cancelBooking, markNoShow, decideRequest, addPlayerBooking, setAutoConfirm, reset])

  return <DemoStoreContext.Provider value={value}>{children}</DemoStoreContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDemoStore() {
  const ctx = useContext(DemoStoreContext)
  if (!ctx) throw new Error('useDemoStore must be used inside DemoStoreProvider')
  return ctx
}
