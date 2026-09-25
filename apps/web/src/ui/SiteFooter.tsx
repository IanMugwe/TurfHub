import { PAGE_MAX_WIDTH } from './TopNav'
import { useApiHealth } from '../api/health'

const ONLINE: { label: string; color: string } = { label: 'All systems normal', color: 'var(--color-confirmed)' }

export default function SiteFooter() {
  // Only reassure when the API is up; never show a red "offline" to visitors (the
  // app keeps working on local demo data without it)
  const online = useApiHealth() === 'online'
  return (
    <footer style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-surface)', marginTop: 48 }}>
      <div style={{ maxWidth: PAGE_MAX_WIDTH, margin: '0 auto', padding: '24px 32px', display: 'flex', alignItems: 'center', gap: 24, fontSize: 13, color: 'var(--color-muted)' }}>
        <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>⚽ Turf</span>
        <span>Pitch bookings for Nairobi</span>
        {online && (
          <span role="status" className="flex items-center gap-2">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: ONLINE.color }} />
            {ONLINE.label}
          </span>
        )}
        <div style={{ flex: 1 }} />
        <span>Help</span>
        <span>Terms</span>
        <span>Privacy</span>
        <span>© 2026 Turf</span>
      </div>
    </footer>
  )
}
