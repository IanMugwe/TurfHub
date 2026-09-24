import { Outlet } from 'react-router'
import { useAppState } from './AppState'
import { useIsDesktop } from '../lib/useIsDesktop'

/**
 * The frame every screen renders inside, plus the light/dark toggle.
 * Phones and tablets: a phone frame (390 px device on wide-enough screens,
 * edge to edge on phones; see .phone-frame in index.css).
 * Desktop: a website; each layout renders the top navigation (with its own dark-mode switch).
 */
export default function PhoneFrame() {
  const { theme, toggleTheme } = useAppState()
  const desktop = useIsDesktop()

  const toggle = (
    <button onClick={toggleTheme} aria-label="Toggle dark mode"
      style={{ position: 'absolute', top: 10, right: 12, zIndex: 300, width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.18)', backdropFilter: 'blur(8px)', cursor: 'pointer', fontSize: 14, lineHeight: 1 }}>
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  )

  if (desktop) {
    return (
      <div data-theme={theme} style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text)', display: 'flex', flexDirection: 'column' }}>
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
