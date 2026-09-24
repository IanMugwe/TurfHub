import { Navigate, Outlet, useLocation, useNavigate } from 'react-router'
import { useAppState } from './AppState'
import TabBar, { type TabItem } from '../ui/TabBar'
import SiteShell from './SiteShell'
import { BookIcon, PersonIcon, SearchIcon } from '../ui/icons'
import { useIsDesktop } from '../lib/useIsDesktop'
import { initials } from '../mocks/data'

type PlayerTab = 'explore' | 'bookings' | 'profile'

const TABS: TabItem<PlayerTab>[] = [
  { id: 'explore', label: 'Explore', icon: SearchIcon },
  { id: 'bookings', label: 'My Bookings', icon: BookIcon },
  { id: 'profile', label: 'Profile', icon: PersonIcon },
]

export default function PlayerLayout() {
  const { session, signOut, theme, toggleTheme } = useAppState()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const desktop = useIsDesktop()

  if (!session) return <Navigate to="/login" replace />
  if (session.role !== 'customer') return <Navigate to="/" replace />

  const section = pathname.split('/')[1]
  // Tabs only on the three top-level screens; the booking flow is full-screen
  const active = TABS.find(t => t.id === section)?.id ?? null

  if (desktop) {
    return (
      <SiteShell
        // The booking flow (venue, review, confirmation) reads better in a narrower page
        maxWidth={active ? undefined : 944}
        nav={{
          items: TABS,
          active,
          onSelect: id => navigate(`/${id}`),
          user: { initials: initials(session.name), name: session.name, role: 'Player' },
          theme,
          onToggleTheme: toggleTheme,
          onSignOut: () => { signOut(); navigate('/login', { replace: true }) },
        }}>
        <Outlet />
      </SiteShell>
    )
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: active ? 80 : 0 }}>
        <Outlet />
      </div>
      {active && <TabBar items={TABS} active={active} onSelect={id => navigate(`/${id}`)} />}
    </div>
  )
}
