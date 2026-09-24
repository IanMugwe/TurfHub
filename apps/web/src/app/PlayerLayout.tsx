import type { CSSProperties } from 'react'
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router'
import { useAppState } from './AppState'
import TabBar, { type TabItem } from '../ui/TabBar'
import Sidebar from '../ui/Sidebar'
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

  if (desktop && active) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar
          subtitle="Find and book a pitch"
          items={TABS}
          active={active}
          onSelect={id => navigate(`/${id}`)}
          user={{ initials: initials(session.name), name: session.name, role: 'Player' }}
          theme={theme}
          onToggleTheme={toggleTheme}
          onSignOut={() => { signOut(); navigate('/login', { replace: true }) }}
        />
        <main style={{ flex: 1, minWidth: 0, height: '100vh', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    )
  }

  if (desktop) {
    // Booking flow: a wide centred column; its fixed bottom bars use --frame-width
    return (
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', background: 'var(--color-surface-2)' }}>
        <div style={{ '--frame-width': '720px', width: 720, minHeight: '100vh', background: 'var(--color-bg)', boxShadow: '0 0 40px rgba(0,0,0,0.18)', position: 'relative' } as CSSProperties}>
          <Outlet />
        </div>
      </div>
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
