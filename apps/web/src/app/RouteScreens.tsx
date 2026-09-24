// Route-level components: read the URL and app state, then render a feature screen
import type { ReactNode } from 'react'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router'
import SiteShell from './SiteShell'
import { useStaff } from './StaffLayout'
import { useAppState } from './AppState'
import NotFound from './NotFound'
import SignInScreen from '../features/auth/SignInScreen'
import TodayScreen from '../features/today/TodayScreen'
import CalendarScreen from '../features/calendar/CalendarScreen'
import BookingRequestsScreen from '../features/requests/BookingRequestsScreen'
import CustomersScreen from '../features/customers/CustomersScreen'
import CustomerDetailScreen from '../features/customers/CustomerDetailScreen'
import ReportsScreen from '../features/reports/ReportsScreen'
import MoreScreen from '../features/settings/MoreScreen'
import ExploreScreen from '../features/player/ExploreScreen'
import VenuePage from '../features/player/VenuePage'
import ReviewBooking from '../features/player/ReviewBooking'
import ConfirmationScreen from '../features/player/ConfirmationScreen'
import MyBookingsScreen from '../features/player/MyBookingsScreen'
import ProfileScreen from '../features/player/ProfileScreen'
import type { SlotSelection } from '../features/player/types'
import { VENUE, customerByPhoneParam, initials } from '../mocks/data'
import { phoneToParam } from '@turfhub/validation'
import { useIsDesktop } from '../lib/useIsDesktop'
import type { Session } from '../types'

/** Where a signed-in person lands */
function homeFor(s: Session) {
  return s.role === 'staff' ? `/v/${VENUE.id}/today` : '/explore'
}

export function Home() {
  const { session } = useAppState()
  return <Navigate to={session ? homeFor(session) : '/login'} replace />
}

export function Login() {
  const { session, signIn } = useAppState()
  const navigate = useNavigate()
  const desktop = useIsDesktop()
  if (session) return <Navigate to={homeFor(session)} replace />
  const screen = <SignInScreen onSignedIn={s => { signIn(s); navigate(homeFor(s), { replace: true }) }} />
  if (!desktop) return screen
  // Desktop: the sign-in screen as a centred card on the website
  return <DesktopSignIn>{screen}</DesktopSignIn>
}

function useSignOut() {
  const { signOut } = useAppState()
  const navigate = useNavigate()
  return () => { signOut(); navigate('/login', { replace: true }) }
}

// ── Staff ──

export function Today() {
  const { session, venueId, decisions, decide, openBooking } = useStaff()
  const navigate = useNavigate()
  return <TodayScreen userInitials={initials(session.name)} onBookingTap={openBooking} decisions={decisions} onDecide={decide} onSeeRequests={() => navigate(`/v/${venueId}/requests`)} />
}

export function Calendar() {
  const { openBooking, openNewBooking } = useStaff()
  return <CalendarScreen onBookingTap={openBooking} onNewBooking={(pitch, hour) => openNewBooking({ pitch, hour })} />
}

export function Requests() {
  const { venueId, decisions, decide, openBooking } = useStaff()
  const navigate = useNavigate()
  return <BookingRequestsScreen decisions={decisions} onDecide={decide} onBack={() => navigate(`/v/${venueId}/today`)} onBookingTap={openBooking} />
}

export function Customers() {
  const { venueId, flagged, openNewBooking } = useStaff()
  const navigate = useNavigate()
  return <CustomersScreen flagged={flagged} onCustomerTap={c => navigate(`/v/${venueId}/customers/${phoneToParam(c.phone)}`)} onNewBooking={() => openNewBooking()} />
}

export function CustomerDetail() {
  const { venueId, flagged, toggleFlag, openBooking, openNewBooking } = useStaff()
  const { phone = '' } = useParams()
  const navigate = useNavigate()
  const customer = customerByPhoneParam(phone)
  if (!customer) return <NotFound />
  return (
    <CustomerDetailScreen
      customer={customer}
      flagged={flagged.includes(customer.name)}
      onToggleFlag={() => toggleFlag(customer.name)}
      onBack={() => navigate(`/v/${venueId}/customers`)}
      onBookingTap={openBooking}
      onNewBooking={() => openNewBooking({ customerPhone: customer.phone })}
    />
  )
}

export function Reports() {
  const { session, venueId } = useStaff()
  // Owners only (D3); the API enforces the same rule
  if (session.staffRole !== 'owner') return <Navigate to={`/v/${venueId}/today`} replace />
  return <ReportsScreen />
}

export function Settings() {
  const { session } = useStaff()
  const { theme, toggleTheme } = useAppState()
  const signOut = useSignOut()
  return <MoreScreen user={session} theme={theme} onToggleTheme={toggleTheme} onSignOut={signOut} />
}

// ── Player ──

export function Explore() {
  const navigate = useNavigate()
  return <ExploreScreen onVenueTap={() => navigate(`/venues/${VENUE.slug}`)} />
}

export function Venue() {
  const { slug } = useParams()
  const navigate = useNavigate()
  if (slug !== VENUE.slug) return <NotFound />
  return <VenuePage onBack={() => navigate('/explore')} onBook={slot => navigate('/book/review', { state: { slot } })} />
}

export function Review() {
  const navigate = useNavigate()
  const slot = (useLocation().state as { slot?: SlotSelection } | null)?.slot
  // The chosen slot only lives in navigation state; start again if it's gone (e.g. after a refresh)
  if (!slot) return <Navigate to={`/venues/${VENUE.slug}`} replace />
  return (
    <ReviewBooking
      slot={slot}
      onBack={() => navigate(`/venues/${VENUE.slug}`)}
      onConfirm={status => {
        const ref = 'TRF-' + Math.random().toString(36).toUpperCase().slice(2, 6)
        navigate(`/book/${ref}`, { replace: true, state: { slot, status } })
      }}
    />
  )
}

export function Confirmation() {
  const { ref = '' } = useParams()
  const navigate = useNavigate()
  const state = useLocation().state as { slot?: SlotSelection; status?: 'confirmed' | 'pending' } | null
  if (!state?.slot || !state.status) return <Navigate to="/bookings" replace />
  return <ConfirmationScreen bookingRef={ref} slot={state.slot} status={state.status} onDone={() => navigate('/explore')} onMyBookings={() => navigate('/bookings')} />
}

export function MyBookings() {
  const navigate = useNavigate()
  return <MyBookingsScreen onBack={() => navigate('/explore')} />
}

export function Profile() {
  const { session } = useAppState()
  const signOut = useSignOut()
  if (!session) return null
  return <ProfileScreen name={session.name} phone={session.phone} onSignOut={signOut} />
}

function DesktopSignIn({ children }: { children: ReactNode }) {
  const { theme, toggleTheme } = useAppState()
  return (
    <SiteShell nav={{ theme, onToggleTheme: toggleTheme }}>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 24px 0' }}>
        <div style={{ width: 420, height: 'min(720px, calc(100vh - 160px))', display: 'flex', flexDirection: 'column', borderRadius: 24, overflow: 'hidden', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.12)', border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
          {children}
        </div>
      </div>
    </SiteShell>
  )
}
