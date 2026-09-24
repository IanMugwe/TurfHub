import { createContext, useCallback, useContext, useState } from 'react'
import { Navigate, Outlet, useLocation, useNavigate, useParams, useSearchParams } from 'react-router'
import { useAppState } from './AppState'
import NewBookingSheet from '../features/bookings/NewBookingSheet'
import BookingDetailSheet from '../features/bookings/BookingDetailSheet'
import type { RequestDecision } from '../features/requests/BookingRequestsScreen'
import TabBar, { type TabItem } from '../ui/TabBar'
import Sidebar from '../ui/Sidebar'
import { useIsDesktop } from '../lib/useIsDesktop'
import { CalIcon, ChartIcon, HomeIcon, MoreIcon, PeopleIcon } from '../ui/icons'
import { VENUE, customerByPhoneParam, findBooking, initials } from '../mocks/data'
import { phoneToParam } from '../lib/format'
import type { Booking, Session } from '../types'
import NotFound from './NotFound'

type StaffSession = Extract<Session, { role: 'staff' }>
type StaffTab = 'today' | 'calendar' | 'customers' | 'reports' | 'settings'

interface NewBookingOptions {
  pitch?: string
  hour?: number
  customerPhone?: string
}

interface StaffState {
  session: StaffSession
  venueId: string
  decisions: Record<string, RequestDecision>
  decide: (id: string, d: RequestDecision) => void
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

  const [decisions, setDecisions] = useState<Record<string, RequestDecision>>({})
  const [flagged, setFlagged] = useState<string[]>(['Aisha Hassan'])

  const decide = useCallback((id: string, d: RequestDecision) => setDecisions(ds => ({ ...ds, [id]: d })), [])
  const toggleFlag = useCallback((name: string) => setFlagged(f => (f.includes(name) ? f.filter(n => n !== name) : [...f, name])), [])

  // Sheets live in the URL so they survive refresh and the back button closes them
  const openBooking = useCallback((b: Booking) => setParams(p => { p.set('booking', b.ref); return p }), [setParams])
  const openNewBooking = useCallback((opts: NewBookingOptions = {}) => setParams(p => {
    p.set('new', '1')
    if (opts.pitch) p.set('turf', opts.pitch)
    if (opts.hour !== undefined) p.set('start', `${String(opts.hour).padStart(2, '0')}:00`)
    if (opts.customerPhone) p.set('customer', phoneToParam(opts.customerPhone))
    return p
  }), [setParams])
  const closeSheet = useCallback(() => setParams(p => {
    for (const k of ['booking', 'new', 'turf', 'start', 'customer']) p.delete(k)
    return p
  }, { replace: true }), [setParams])

  if (!session) return <Navigate to="/login" replace />
  if (session.role !== 'staff') return <Navigate to="/explore" replace />
  if (venueId !== VENUE.id) return <NotFound />

  const section = pathname.split('/')[3]
  // Detail screens (requests, a single customer) hide the tab bar and + button
  const isDetail = section === 'requests' || (section === 'customers' && pathname.split('/').length > 4)
  const tabs = TABS.filter(t => t.id !== 'reports' || session.staffRole === 'owner')
  const activeTab = TABS.find(t => t.id === section)?.id ?? null

  const detailBooking = params.get('booking') ? findBooking(params.get('booking')!) : undefined
  const newFor = params.get('customer') ? customerByPhoneParam(params.get('customer')!) : undefined

  const state: StaffState = { session, venueId, decisions, decide, flagged, toggleFlag, openBooking, openNewBooking }

  const sheets = (
    <>
      {params.get('new') && (
        <NewBookingSheet
          key={params.toString()}
          initialCustomer={newFor}
          initialPitch={params.get('turf') ?? undefined}
          initialTime={params.get('start') ?? undefined}
          onClose={closeSheet}
        />
      )}
      {detailBooking && <BookingDetailSheet booking={detailBooking} onClose={closeSheet} />}
    </>
  )

  if (desktop) {
    return (
      <StaffContext.Provider value={state}>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <Sidebar
            subtitle={`${VENUE.name} · ${VENUE.area.split(',')[0]}`}
            items={tabs}
            // Requests belongs under Today
            active={activeTab ?? (section === 'requests' ? 'today' : null)}
            onSelect={id => navigate(`/v/${venueId}/${id}`)}
            action={
              <button onClick={() => openNewBooking()}
                style={{ width: '100%', padding: '12px', minHeight: 44, borderRadius: 12, border: 'none', background: 'var(--color-primary)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                + New booking
              </button>
            }
            user={{ initials: initials(session.name), name: session.name, role: session.staffRole === 'owner' ? 'Owner' : 'Manager' }}
            theme={theme}
            onToggleTheme={toggleTheme}
            onSignOut={() => { signOut(); navigate('/login', { replace: true }) }}
          />
          <main style={{ flex: 1, minWidth: 0, height: '100vh', position: 'relative', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <Outlet />
            </div>
          </main>
        </div>
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
