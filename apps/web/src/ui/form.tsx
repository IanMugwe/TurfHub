import type { CSSProperties, ReactNode } from 'react'

// Shared form pieces, matching the New booking sheet and settings screens

// eslint-disable-next-line react-refresh/only-export-components
export const inputStyle: CSSProperties = {
  width: '100%', padding: '11px 12px', borderRadius: 10, border: '1px solid var(--color-border)', background: 'var(--color-bg)',
  fontSize: 15, color: 'var(--color-text)', outline: 'none', display: 'block', fontFamily: 'inherit',
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label style={{ display: 'block', marginBottom: 14 }}>
      <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-muted)', marginBottom: 6 }}>{label}</span>
      {children}
      {hint && <span style={{ display: 'block', fontSize: 12, color: 'var(--color-muted-light)', marginTop: 4 }}>{hint}</span>}
    </label>
  )
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '4px 0 8px 4px' }}>{children}</div>
}

/** White rounded panel used for lists and forms */
export function Panel({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 14, overflow: 'hidden', marginBottom: 20, ...style }}>{children}</div>
}

/** A tappable row inside a Panel */
export function Row({ icon, title, sub, right, onClick, danger, last }: {
  icon?: ReactNode; title: ReactNode; sub?: ReactNode; right?: ReactNode; onClick?: () => void; danger?: boolean; last?: boolean
}) {
  const content = (
    <>
      {icon && <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 500, color: danger ? 'var(--color-noshow)' : 'var(--color-text)' }}>{title}</div>
        {sub && <div style={{ fontSize: 13, color: 'var(--color-muted)', marginTop: 1 }}>{sub}</div>}
      </div>
      {right ?? (onClick && <span style={{ color: 'var(--color-muted-light)', fontSize: 18 }}>›</span>)}
    </>
  )
  const style: CSSProperties = { width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'none', border: 'none', borderBottom: last ? 'none' : '1px solid var(--color-border)', textAlign: 'left', cursor: onClick ? 'pointer' : 'default', minHeight: 56 }
  return onClick ? <button onClick={onClick} style={style}>{content}</button> : <div style={style}>{content}</div>
}

export function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={selected}
      style={{ flexShrink: 0, padding: '8px 14px', borderRadius: 20, border: selected ? 'none' : '1px solid var(--color-border)', background: selected ? 'var(--color-primary)' : 'var(--color-surface)', color: selected ? '#fff' : 'var(--color-muted)', fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 36 }}>
      {children}
    </button>
  )
}

export function PrimaryButton({ children, onClick, disabled, type = 'button', style }: { children: ReactNode; onClick?: () => void; disabled?: boolean; type?: 'button' | 'submit'; style?: CSSProperties }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      style={{ width: '100%', padding: '14px', borderRadius: 14, border: 'none', background: disabled ? 'var(--color-border)' : 'var(--color-primary)', color: disabled ? 'var(--color-muted-light)' : '#fff', fontSize: 16, fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer', ...style }}>
      {children}
    </button>
  )
}

export function SecondaryButton({ children, onClick, danger, style }: { children: ReactNode; onClick?: () => void; danger?: boolean; style?: CSSProperties }) {
  return (
    <button type="button" onClick={onClick}
      style={{ width: '100%', padding: '12px', minHeight: 44, borderRadius: 12, border: `1px solid ${danger ? 'var(--color-noshow-border)' : 'var(--color-border)'}`, background: 'transparent', color: danger ? 'var(--color-noshow)' : 'var(--color-text)', fontSize: 15, fontWeight: 600, cursor: 'pointer', ...style }}>
      {children}
    </button>
  )
}

/** Hour picker for whole hours, e.g. 06:00 … 23:00 */
export function HourSelect({ value, onChange, from = 0, to = 24, label }: { value: number; onChange: (h: number) => void; from?: number; to?: number; label: string }) {
  return (
    <select aria-label={label} value={value} onChange={e => onChange(Number(e.target.value))} style={{ ...inputStyle, padding: '9px 10px', width: 'auto' }}>
      {Array.from({ length: to - from + 1 }, (_, i) => from + i).map(h => (
        <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
      ))}
    </select>
  )
}
