import type { ComponentType } from 'react'

export interface IconProps { size?: number; color?: string }

export interface TabItem<T extends string> {
  id: T
  label: string
  icon: ComponentType<IconProps>
}

/** Bottom tab bar pinned to the phone frame */
export default function TabBar<T extends string>({ items, active, onSelect }: { items: TabItem<T>[]; active: T | null; onSelect: (id: T) => void }) {
  return (
    <nav style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', display: 'flex', zIndex: 100 }}>
      {items.map(({ id, label, icon: Icon }) => {
        const isActive = active === id
        return (
          <button key={id} onClick={() => onSelect(id)} aria-current={isActive ? 'page' : undefined}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '10px 4px', border: 'none', background: 'none', cursor: 'pointer', minHeight: 56 }}>
            <Icon size={22} color={isActive ? 'var(--color-primary)' : 'var(--color-muted-light)'} />
            <span style={{ fontSize: 11, fontWeight: isActive ? 600 : 400, color: isActive ? 'var(--color-primary)' : 'var(--color-muted-light)', lineHeight: 1 }}>{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
