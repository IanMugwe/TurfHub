import { PAGE_MAX_WIDTH } from './TopNav'
import { useApiHealth, type ApiStatus } from '../api/health'

const STATUS: Record<ApiStatus, { label: string; color: string }> = {
  checking: { label: 'Checking server…', color: 'var(--color-muted-light)' },
  online: { label: 'All systems normal', color: 'var(--color-confirmed)' },
  degraded: { label: 'Service degraded', color: 'var(--color-pending)' },
  offline: { label: 'Server offline', color: 'var(--color-noshow)' },
}

export default function SiteFooter() {
  const status = STATUS[useApiHealth()]
  return (
    <footer style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-surface)', marginTop: 48 }}>
      <div style={{ maxWidth: PAGE_MAX_WIDTH, margin: '0 auto', padding: '24px 32px', display: 'flex', alignItems: 'center', gap: 24, fontSize: 13, color: 'var(--color-muted)' }}>
        <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>⚽ Turf</span>
        <span>Pitch bookings for Nairobi</span>
        <span role="status" className="flex items-center gap-2">
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: status.color }} />
          {status.label}
        </span>
        <div style={{ flex: 1 }} />
        <span>Help</span>
        <span>Terms</span>
        <span>Privacy</span>
        <span>© 2026 Turf</span>
      </div>
    </footer>
  )
}
