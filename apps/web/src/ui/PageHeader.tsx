import type { ReactNode } from 'react'
import { useIsDesktop } from '../lib/useIsDesktop'

/** Header for detail pages: back link, title, optional subtitle and a right-hand action */
export default function PageHeader({ back, onBack, title, subtitle, action }: {
  back: string
  onBack: () => void
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  const desktop = useIsDesktop()
  return (
    <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: desktop ? '28px 32px 14px' : '52px 16px 14px', ...(desktop && { background: 'transparent', borderBottom: 'none' }) }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: 15, fontWeight: 600, cursor: 'pointer', padding: '6px 0', marginBottom: 4 }}>‹ {back}</button>
      <div className="flex items-center justify-between gap-3">
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text)' }}>{title}</div>
        {action}
      </div>
      {subtitle && <div style={{ fontSize: 13, color: 'var(--color-muted)', marginTop: 2 }}>{subtitle}</div>}
    </div>
  )
}
