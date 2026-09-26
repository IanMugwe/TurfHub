import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation, useNavigate, useParams, useSearchParams } from 'react-router'
import { useAppState } from './AppState'
import NewBookingSheet from '../features/bookings/NewBookingSheet'
import BookingDetailSheet from '../features/bookings/BookingDetailSheet'
import TabBar, { type TabItem } from '../ui/TabBar'
import SiteShell from './SiteShell'
import { useIsDesktop } from '../lib/useIsDesktop'
import { CalIcon, ChartIcon, HomeIcon, MoreIcon, PeopleIcon } from '../ui/icons'
import { initials } from '../mocks/data'
import VenueSwitcherSheet from '../features/venues/VenueSwitcherSheet'
import { useCustomers } from './useCustomers'
import { useDemoStore } from './DemoStore'
import { phoneToParam } from '@turfhub/validation'
import type { Booking, Session, StaffRole, Venue } from '../types'
import NotFound from './NotFound'

type StaffSession = Extract<Session, { role: 'staff' }>
type StaffTab = 'today' | 'calendar' | 'customers' | 'reports' | 'settings'

interface NewBookingOptions {
  pitch?: string
  hour?: number
  /** "YYYY-MM-DD" */
  date?: string
  customerPhone?: string
}

interface StaffState {
  session: StaffSession
  venueId: string
  venue: Venue
  /** Role at this venue (a person can own one venue and manage another) */
  role: StaffRole
  /** Venues this person works at */
  myVenues: Venue[]
  openVenueSwitcher: () => void
  flagged: string[]
  toggleFlag: (name: string) => void
  openBooking: (b: Booking) => void
  openNewBooking: (opts?: NewBookingOptions) => void
}

const StaffContext = createContext<StaffState | null>(null)

// eslint-disable-next-line react-refresh/only-export-components
export function useStaff() {
  const ctx = useContext(StaffContext)
  if (!ctx) throw new Error('useStaff must be used inside StaffLayout')
  return ctx
}

const TABS: TabItem<StaffTab>[] = [
  { id: 'today', label: 'Today', icon: HomeIcon },
  { id: 'calendar', label: 'Calendar', icon: CalIcon },
  { id: 'customers', label: 'Customers', icon: PeopleIcon },
  { id: 'reports', label: 'Reports', icon: ChartIcon },
  { id: 'settings', label: 'More', icon: MoreIcon },
]

export default function StaffLayout() {
  const { session, signOut, theme, toggleTheme } = useAppState()
  const desktop = useIsDesktop()
  const { venueId = '' } = useParams()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()

  const { bookings, venues, updateVenue } = useDemoStore()
  const customers = useCustomers(venueId)
  const myVenues = session ? venues.filter(v => v.team.some(m => m.phone === session.phone)) : []
  const venue = myVenues.find(v => v.id === venueId)
  const member = venue?.team.find(m => m.phone === session?.phone)

  // An invited manager becomes active the first time they sign in
  useEffect(() => {
    if (venue && member?.status === 'invited') {
      updateVenue(venue.id, { team: venue.team.map(m => (m.phone === member.phone ? { ...m, status: 'active' } : m)) })
    }
  }, [venue, member, updateVenue])
  const [flagged, setFlagged] = useState<string[]>(['Aisha Hassan'])

  const toggleFlag = useCallback((name: string) => setFlagged(f => (f.includes(name) ? f.filter(n => n !== name) : [...f, name])), [])

  // Sheets live in the URL so they survive refresh and the back button closes them
  const openBooking = useCallback((b: Booking) => setParams(p => { p.set('booking', b.ref); return p }), [setParams])
  const openNewBooking = useCallback((opts: NewBookingOptions = {}) => setParams(p => {
    p.set('new', '1')
    if (opts.pitch) p.set('turf', opts.pitch)
    if (opts.hour !== undefined) p.set('start', `${String(opts.hour).padStart(2, '0')}:00`)
    if (opts.date) p.set('date', opts.date)
    if (opts.customerPhone) p.set('customer', phoneToParam(opts.customerPhone))
    return p
  }), [setParams])
  const openVenueSwitcher = useCallback(() => setParams(p => { p.set('venues', '1'); return p }), [setParams])
  const closeSheet = useCallback(() => setParams(p => {
    for (const k of ['booking', 'new', 'turf', 'start', 'date', 'customer', 'venues']) p.delete(k)
    return p
  }, { replace: true }), [setParams])

  if (!session) return <Navigate to="/login" replace />
  if (session.role !== 'staff') return <Navigate to="/explore" replace />
  if (!venue || !member) return <NotFound />
  const role = member.role

  const section = pathname.split('/')[3]
  // Detail screens (requests, a single customer) hide the tab bar and + button
  const deep = pathname.split('/').length > 4
  const isDetail = section === 'requests' || ((section === 'customers' || section === 'settings') && deep)
  const tabs = TABS.filter(t => t.id !== 'reports' || role === 'owner')
  const activeTab = TABS.find(t => t.id === section)?.id ?? null

  const detailBooking = params.get('booking') ? bookings.find(b => b.ref === params.get('booking')) : undefined
  const newFor = params.get('customer') ? customers.find(c => phoneToParam(c.phone) === params.get('customer')) : undefined

  const state: StaffState = { session, venueId, venue, role, myVenues, openVenueSwitcher, flagged, toggleFlag, openBooking, openNewBooking }

  const sheets = (
    <>
      {params.get('new') && (
        <NewBookingSheet
          key={params.toString()}
          initialCustomer={newFor}
          initialPitch={params.get('turf') ?? undefined}
          initialTime={params.get('start') ?? undefined}
          initialDate={params.get('date') ?? undefined}
          onClose={closeSheet}
        />
      )}
      {detailBooking && <BookingDetailSheet booking={detailBooking} onClose={closeSheet} />}
      {params.get('venues') && <VenueSwitcherSheet onClose={closeSheet} />}
    </>
  )

  if (desktop) {
    return (
      <StaffContext.Provider value={state}>
        <SiteShell nav={{
          items: tabs,
          // Requests belongs under Today
          active: activeTab ?? (section === 'requests' ? 'today' : null),
          onSelect: id => navigate(`/v/${venueId}/${id}`),
          action: (
            <button onClick={() => openNewBooking()}
              style={{ padding: '9px 16px', borderRadius: 10, border: 'none', background: 'var(--color-primary)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              + New booking
            </button>
          ),
          user: { initials: initials(session.name), name: session.name, role: `${role === 'owner' ? 'Owner' : 'Manager'} · ${venue.name}` },
          theme,
          onToggleTheme: toggleTheme,
          onSignOut: () => { signOut(); navigate('/login', { replace: true }) },
        }}>
          <Outlet />
        </SiteShell>
        {sheets}
      </StaffContext.Provider>
    )
  }

  return (
    <StaffContext.Provider value={state}>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 80 }}>
        <Outlet />
      </div>

      {!isDetail && (
        <TabBar items={tabs} active={activeTab} onSelect={id => navigate(`/v/${venueId}/${id}`)} />
      )}

      {!isDetail && (
        <button onClick={() => openNewBooking()} aria-label="New booking"
          style={{ position: 'absolute', bottom: 70, right: 16, width: 52, height: 52, borderRadius: '50%', background: 'var(--color-primary)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(15,122,61,0.4)', zIndex: 99 }}>
          <span style={{ color: '#fff', fontSize: 26, lineHeight: 1, marginTop: -1 }}>+</span>
        </button>
      )}

      {sheets}
    </StaffContext.Provider>
  )
}
