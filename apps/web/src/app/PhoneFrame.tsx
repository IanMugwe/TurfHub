import { Outlet, useLocation } from 'react-router'
import { useAppState } from './AppState'
import { useIsDesktop } from '../lib/useIsDesktop'

/** Routes that show the desktop sidebar (it carries its own dark-mode switch) */
function hasSidebar(pathname: string) {
  return pathname.startsWith('/v/') || ['/explore', '/bookings', '/profile'].includes(pathname)
}

/**
 * The frame every screen renders inside, plus the light/dark toggle.
 * Phones and tablets: a phone frame (390 px device on wide-enough screens,
 * edge to edge on phones; see .phone-frame in index.css).
 * Desktop: full-screen, and each layout arranges its own sidebar or column.
 */
export default function PhoneFrame() {
  const { theme, toggleTheme } = useAppState()
  const desktop = useIsDesktop()
  const { pathname } = useLocation()

  const toggle = (
    <button onClick={toggleTheme} aria-label="Toggle dark mode"
      style={{ position: desktop ? 'fixed' : 'absolute', top: desktop ? 16 : 10, right: desktop ? 20 : 12, zIndex: 300, width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.18)', backdropFilter: 'blur(8px)', cursor: 'pointer', fontSize: 14, lineHeight: 1 }}>
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  )

  if (desktop) {
    return (
      <div data-theme={theme} style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text)', display: 'flex', flexDirection: 'column' }}>
        {!hasSidebar(pathname) && toggle}
        <Outlet />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', minHeight: '100vh', background: '#d1d5db' }}>
      <div data-theme={theme} className="phone-frame" style={{ background: 'var(--color-bg)', color: 'var(--color-text)', position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {toggle}
        <Outlet />
      </div>
    </div>
  )
}
