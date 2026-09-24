import { useEffect, type ReactNode } from 'react'
import { useIsDesktop } from '../lib/useIsDesktop'

/** Slide-up sheet on phones, centred dialog on desktop. Closes on backdrop tap or Escape. */
export default function BottomSheet({ onClose, maxHeight = '90vh', label, children }: { onClose: () => void; maxHeight?: string; label: string; children: ReactNode }) {
  const desktop = useIsDesktop()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Desktop: a centred dialog instead of a sheet sliding up from the bottom
  if (desktop) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
        <div role="dialog" aria-modal="true" aria-label={label}
          style={{ position: 'relative', width: '100%', maxWidth: 480, background: 'var(--color-surface)', borderRadius: 20, maxHeight: '88vh', overflowY: 'auto', paddingBottom: 28, boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
          <div style={{ height: 8 }} />
          {children}
        </div>
      </div>
    )
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
      <div role="dialog" aria-modal="true" aria-label={label}
        style={{ position: 'relative', width: '100%', background: 'var(--color-surface)', borderRadius: '20px 20px 0 0', maxHeight, overflowY: 'auto', paddingBottom: 40 }}>
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--color-border)' }} />
        </div>
        {children}
      </div>
    </div>
  )
}
