import { Outlet } from 'react-router'
import { useAppState } from './AppState'

/** The 390 px phone frame every screen renders inside, plus the light/dark toggle */
export default function PhoneFrame() {
  const { theme, toggleTheme } = useAppState()

  return (
    <div style={{ display: 'flex', justifyContent: 'center', minHeight: '100vh', background: '#d1d5db' }}>
      <div data-theme={theme} style={{ width: 390, minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text)', position: 'relative', display: 'flex', flexDirection: 'column', boxShadow: '0 0 40px rgba(0,0,0,0.18)', overflow: 'hidden' }}>
        <button onClick={toggleTheme} aria-label="Toggle dark mode"
          style={{ position: 'absolute', top: 10, right: 12, zIndex: 300, width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.18)', backdropFilter: 'blur(8px)', cursor: 'pointer', fontSize: 14, lineHeight: 1 }}>
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        <Outlet />
      </div>
    </div>
  )
}
