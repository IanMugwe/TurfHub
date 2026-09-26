// Route-level components: read the URL and app state, then render a feature screen
import { useEffect, type ReactNode } from 'react'
import { Navigate, useLocation, useNavigate, useParams, useSearchParams } from 'react-router'
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
import VenueDetailsPage from '../features/settings/VenueDetailsPage'
import PitchesPage from '../features/settings/PitchesPage'
import OpeningHoursPage from '../features/settings/OpeningHoursPage'
import PricingPage from '../features/settings/PricingPage'
import BlockedPeriodsPage from '../features/settings/BlockedPeriodsPage'
import BookingRulesPage from '../features/settings/BookingRulesPage'
import TeamPage from '../features/settings/TeamPage'
import NotificationsPage from '../features/settings/NotificationsPage'
import NewVenuePage from '../features/venues/NewVenuePage'
import ExploreScreen from '../features/player/ExploreScreen'
import VenuePage from '../features/player/VenuePage'
import ReviewBooking from '../features/player/ReviewBooking'
import ConfirmationScreen from '../features/player/ConfirmationScreen'
import MyBookingsScreen from '../features/player/MyBookingsScreen'
import ProfileScreen from '../features/player/ProfileScreen'
import type { SlotSelection } from '../features/player/types'
import { initials } from '../mocks/data'
import { useCustomerByPhoneParam } from './useCustomers'
import { phoneToParam } from '@turfhub/validation'
import { useIsDesktop } from '../lib/useIsDesktop'
import { useDemoStore } from './DemoStore'
import { useToast } from '../ui/Toast'
import { todayKey } from '../lib/dates'
import type { Session, Venue as VenueT } from '../types'

/** Where a signed-in person lands: staff on their first venue, players on Explore */
function homeFor(s: Session, venues: VenueT[]) {
  if (s.role !== 'staff') return '/explore'
  const venue = venues.find(v => v.team.some(m => m.phone === s.phone))
  return venue ? `/v/${venue.id}/today` : '/explore'
}

export function Home() {
  const { session } = useAppState()
  const { venues } = useDemoStore()
  return <Navigate to={session ? homeFor(session, venues) : '/login'} replace />
}

export function Login() {
  const { session, signIn } = useAppState()
  const { venues } = useDemoStore()
  const navigate = useNavigate()
  const desktop = useIsDesktop()
  if (session) return <Navigate to={homeFor(session, venues)} replace />
  const screen = <SignInScreen onSignedIn={s => { signIn(s); navigate(homeFor(s, venues), { replace: true }) }} />
  if (!desktop) return screen
  // Desktop: the sign-in screen as a centred card on the website
  return <DesktopSignIn>{screen}</DesktopSignIn>
}

/** /reset-demo: restore the demo data to its starting point (for presenters) */
export function ResetDemo() {
  const { reset } = useDemoStore()
  const toast = useToast()
  useEffect(() => {
    reset()
    toast('Demo data reset')
  }, [reset, toast])
  return <Navigate to="/" replace />
}

function useSignOut() {
  const { signOut } = useAppState()
  const navigate = useNavigate()
  return () => { signOut(); navigate('/login', { replace: true }) }
}

// ── Staff ──

export function Today() {
  const { session, venue, venueId, openBooking, openVenueSwitcher } = useStaff()
  const navigate = useNavigate()
  return <TodayScreen venue={venue} userInitials={initials(session.name)} onBookingTap={openBooking} onSwitchVenue={openVenueSwitcher} onSeeRequests={() => navigate(`/v/${venueId}/requests`)} />
}

export function Calendar() {
  const { venue, openBooking, openNewBooking } = useStaff()
  return <CalendarScreen venue={venue} onBookingTap={openBooking} onNewBooking={(pitch, hour, date) => openNewBooking({ pitch, hour, date })} />
}

export function Requests() {
  const { venue, venueId, openBooking } = useStaff()
  const navigate = useNavigate()
  return <BookingRequestsScreen venueId={venue.id} onBack={() => navigate(`/v/${venueId}/today`)} onBookingTap={openBooking} />
}

export function Customers() {
  const { venueId, flagged, openNewBooking } = useStaff()
  const navigate = useNavigate()
  return <CustomersScreen venueId={venueId} flagged={flagged} onCustomerTap={c => navigate(`/v/${venueId}/customers/${phoneToParam(c.phone)}`)} onNewBooking={() => openNewBooking()} />
}

export function CustomerDetail() {
  const { venueId, flagged, toggleFlag, openBooking, openNewBooking } = useStaff()
  const { phone = '' } = useParams()
  const navigate = useNavigate()
  const customer = useCustomerByPhoneParam(phone, venueId)
  if (!customer) return <NotFound />
  return (
    <CustomerDetailScreen
      venueId={venueId}
      customer={customer}
      flagged={flagged.includes(customer.name)}
      onToggleFlag={() => toggleFlag(customer.name)}
      onBack={() => navigate(`/v/${venueId}/customers`)}
      onBookingTap={openBooking}
      onNewBooking={() => openNewBooking({ customerPhone: customer.phone })}
    />
  )
}

/** Owner-only pages send managers back to Today (the API enforces the same rule, D3) */
function OwnerOnly({ children }: { children: ReactNode }) {
  const { role, venueId } = useStaff()
  if (role !== 'owner') return <Navigate to={`/v/${venueId}/today`} replace />
  return children
}

export function Reports() {
  const { venue } = useStaff()
  return <OwnerOnly><ReportsScreen venue={venue} /></OwnerOnly>
}

export function Settings() {
  const { session } = useStaff()
  const { theme, toggleTheme } = useAppState()
  const signOut = useSignOut()
  return <MoreScreen user={session} theme={theme} onToggleTheme={toggleTheme} onSignOut={signOut} />
}

function useBackToSettings() {
  const { venueId } = useStaff()
  const navigate = useNavigate()
  return () => navigate(`/v/${venueId}/settings`)
}

export function SettingsVenue() { return <VenueDetailsPage onBack={useBackToSettings()} /> }
export function SettingsPitches() { return <PitchesPage onBack={useBackToSettings()} /> }
export function SettingsHours() { return <OpeningHoursPage onBack={useBackToSettings()} /> }
export function SettingsPricing() { const back = useBackToSettings(); return <OwnerOnly><PricingPage onBack={back} /></OwnerOnly> }
export function SettingsBlocked() { return <BlockedPeriodsPage onBack={useBackToSettings()} /> }
export function SettingsBookingRules() { return <BookingRulesPage onBack={useBackToSettings()} /> }
export function SettingsTeam() { const back = useBackToSettings(); return <OwnerOnly><TeamPage onBack={back} /></OwnerOnly> }
export function SettingsNotifications() { return <NotificationsPage onBack={useBackToSettings()} /> }
export function SettingsNewVenue() { const back = useBackToSettings(); return <OwnerOnly><NewVenuePage onBack={back} /></OwnerOnly> }

// ── Player ──

export function Explore() {
  const navigate = useNavigate()
  return <ExploreScreen onVenueTap={(slug, dateKey) => navigate(`/venues/${slug}${dateKey && dateKey !== todayKey() ? `?date=${dateKey}` : ''}`)} />
}

export function Venue() {
  const { slug } = useParams()
  const [params] = useSearchParams()
  const { venues } = useDemoStore()
  const navigate = useNavigate()
  const venue = venues.find(v => v.slug === slug && v.status === 'approved')
  if (!venue) return <NotFound />
  return <VenuePage key={venue.id} venue={venue} initialDate={params.get('date') ?? undefined} onBack={() => navigate('/explore')} onBook={slot => navigate('/book/review', { state: { slot } })} />
}

export function Review() {
  const navigate = useNavigate()
  const { session } = useAppState()
  const { addPlayerBooking, venueById } = useDemoStore()
  const slot = (useLocation().state as { slot?: SlotSelection } | null)?.slot
  // The chosen slot only lives in navigation state; start again if it's gone (e.g. after a refresh)
  if (!slot) return <Navigate to="/explore" replace />
  const venue = venueById(slot.venueId)
  return (
    <ReviewBooking
      slot={slot}
      cancellationHours={venue?.cancellationHours ?? 2}
      initialName={session?.name === 'New player' ? '' : session?.name}
      initialPhone={session?.phone}
      onBack={() => navigate(`/venues/${venue?.slug ?? ''}`)}
      onConfirm={details => {
        // Saved to the demo store: shows in My Bookings and, if the venue approves requests, on the owner's Today
        const booking = addPlayerBooking(slot, details)
        navigate(`/book/${booking.ref}`, { replace: true, state: { slot, status: booking.status } })
      }}
    />
  )
}

export function Confirmation() {
  const { ref = '' } = useParams()
  const navigate = useNavigate()
  const { venueById } = useDemoStore()
  const state = useLocation().state as { slot?: SlotSelection; status?: 'confirmed' | 'pending' } | null
  if (!state?.slot || !state.status) return <Navigate to="/bookings" replace />
  const venue = venueById(state.slot.venueId)
  return <ConfirmationScreen bookingRef={ref} slot={state.slot} status={state.status} venue={venue} onDone={() => navigate('/explore')} onMyBookings={() => navigate('/bookings')} />
}

export function MyBookings() {
  const navigate = useNavigate()
  return <MyBookingsScreen onBack={() => navigate('/explore')} onOpenVenue={slug => navigate(`/venues/${slug}`)} />
}

export function Profile() {
  const { session } = useAppState()
  const navigate = useNavigate()
  const signOut = useSignOut()
  if (!session) return null
  return <ProfileScreen name={session.name} phone={session.phone} onSignOut={signOut} onOpenVenue={slug => navigate(`/venues/${slug}`)} />
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
