import { Outlet } from 'react-router'
import { useAppState } from './AppState'

/**
 * The phone frame every screen renders inside, plus the light/dark toggle.
 * Wide screens show a 390 px device; phones fill the screen (see .phone-frame in index.css).
 */
export default function PhoneFrame() {
  const { theme, toggleTheme } = useAppState()

  return (
    <div style={{ display: 'flex', justifyContent: 'center', minHeight: '100vh', background: '#d1d5db' }}>
      <div data-theme={theme} className="phone-frame" style={{ background: 'var(--color-bg)', color: 'var(--color-text)', position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <button onClick={toggleTheme} aria-label="Toggle dark mode"
          style={{ position: 'absolute', top: 10, right: 12, zIndex: 300, width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.18)', backdropFilter: 'blur(8px)', cursor: 'pointer', fontSize: 14, lineHeight: 1 }}>
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        <Outlet />
      </div>
    </div>
  )
}
