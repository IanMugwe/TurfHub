import type { ReactNode } from 'react'
import type { TabItem } from './TabBar'
import Toggle from './Toggle'

/** Desktop navigation: replaces the bottom tab bar on wide screens */
export default function Sidebar<T extends string>({ subtitle, items, active, onSelect, action, user, theme, onToggleTheme, onSignOut }: {
  subtitle?: string
  items: TabItem<T>[]
  active: T | null
  onSelect: (id: T) => void
  action?: ReactNode
  user: { initials: string; name: string; role: string }
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  onSignOut: () => void
}) {
  return (
    <aside style={{ width: 248, flexShrink: 0, height: '100vh', position: 'sticky', top: 0, display: 'flex', flexDirection: 'column', background: 'var(--color-surface)', borderRight: '1px solid var(--color-border)', padding: '24px 16px 20px' }}>
      {/* Brand */}
      <div className="flex items-center gap-3" style={{ padding: '0 8px' }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⚽</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.02em' }}>Turf</div>
      </div>
      {subtitle && <div style={{ fontSize: 13, color: 'var(--color-muted)', margin: '10px 8px 0' }}>{subtitle}</div>}

      {action && <div style={{ marginTop: 20 }}>{action}</div>}

      {/* Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 20 }}>
        {items.map(({ id, label, icon: Icon }) => {
          const isActive = active === id
          return (
            <button key={id} onClick={() => onSelect(id)} aria-current={isActive ? 'page' : undefined}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', minHeight: 44, borderRadius: 10, border: 'none', cursor: 'pointer', textAlign: 'left', background: isActive ? 'var(--color-primary-light)' : 'transparent' }}>
              <Icon size={20} color={isActive ? 'var(--color-primary)' : 'var(--color-muted)'} />
              <span style={{ fontSize: 15, fontWeight: isActive ? 600 : 500, color: isActive ? 'var(--color-primary)' : 'var(--color-text)' }}>{label}</span>
            </button>
          )
        })}
      </nav>

      <div style={{ flex: 1 }} />

      {/* Footer: theme, user, sign out */}
      <div className="flex items-center justify-between" style={{ padding: '10px 8px', borderTop: '1px solid var(--color-border)' }}>
        <span style={{ fontSize: 14, color: 'var(--color-text)' }}>🌙 Dark mode</span>
        <Toggle on={theme === 'dark'} onChange={onToggleTheme} label="Dark mode" />
      </div>
      <div className="flex items-center gap-3" style={{ padding: '12px 8px 0', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: 'var(--color-primary-dark)', flexShrink: 0 }}>{user.initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
          <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>{user.role}</div>
        </div>
        <button onClick={onSignOut} style={{ background: 'none', border: 'none', color: 'var(--color-noshow)', fontSize: 13, fontWeight: 500, cursor: 'pointer', padding: '8px 0' }}>Sign out</button>
      </div>
    </aside>
  )
}
