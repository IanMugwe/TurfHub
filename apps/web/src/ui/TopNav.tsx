import { useState, type ReactNode } from 'react'
import type { TabItem } from './TabBar'

export const PAGE_MAX_WIDTH = 1264

/** Website header for desktop: logo, page links, and the account area */
export default function TopNav<T extends string>({ items = [], active = null, onSelect, action, user, theme, onToggleTheme, onSignOut }: {
  items?: TabItem<T>[]
  active?: T | null
  onSelect?: (id: T) => void
  action?: ReactNode
  user?: { initials: string; name: string; role: string }
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  onSignOut?: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 150, background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
      <div style={{ maxWidth: PAGE_MAX_WIDTH, margin: '0 auto', height: 64, padding: '0 32px', display: 'flex', alignItems: 'center', gap: 32 }}>
        {/* Brand */}
        <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⚽</div>
          <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.02em' }}>Turf</span>
        </div>

        {/* Page links */}
        <nav aria-label="Main" style={{ display: 'flex', alignItems: 'stretch', gap: 4, height: '100%' }}>
          {items.map(({ id, label }) => {
            const isActive = active === id
            return (
              <button key={id} onClick={() => onSelect?.(id)} aria-current={isActive ? 'page' : undefined}
                style={{ padding: '0 14px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 15, fontWeight: isActive ? 600 : 500, color: isActive ? 'var(--color-primary)' : 'var(--color-muted)', borderBottom: `2px solid ${isActive ? 'var(--color-primary)' : 'transparent'}`, marginBottom: -1 }}>
                {label}
              </button>
            )
          })}
        </nav>

        <div style={{ flex: 1 }} />

        {/* Account area */}
        <div className="flex items-center gap-3">
          {action}
          <button onClick={onToggleTheme} aria-label="Toggle dark mode"
            style={{ width: 38, height: 38, borderRadius: '50%', border: '1px solid var(--color-border)', background: 'var(--color-surface)', cursor: 'pointer', fontSize: 16 }}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          {user && (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setMenuOpen(o => !o)} aria-haspopup="menu" aria-expanded={menuOpen}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px 4px 4px', borderRadius: 24, border: '1px solid var(--color-border)', background: 'var(--color-surface)', cursor: 'pointer' }}>
                <span style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, color: 'var(--color-primary-dark)' }}>{user.initials}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{user.name}</span>
                <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>▾</span>
              </button>
              {menuOpen && (
                <>
                  <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 1 }} />
                  <div role="menu" style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', zIndex: 2, minWidth: 220, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, boxShadow: '0 12px 32px rgba(0,0,0,0.12)', padding: 6 }}>
                    <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--color-border)', marginBottom: 6 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{user.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>{user.role}</div>
                    </div>
                    <button role="menuitem" onClick={() => { setMenuOpen(false); onSignOut?.() }}
                      style={{ width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500, color: 'var(--color-noshow)' }}>
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
