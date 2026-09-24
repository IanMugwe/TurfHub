import { PAGE_MAX_WIDTH } from './TopNav'

export default function SiteFooter() {
  return (
    <footer style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-surface)', marginTop: 48 }}>
      <div style={{ maxWidth: PAGE_MAX_WIDTH, margin: '0 auto', padding: '24px 32px', display: 'flex', alignItems: 'center', gap: 24, fontSize: 13, color: 'var(--color-muted)' }}>
        <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>⚽ Turf</span>
        <span>Pitch bookings for Nairobi</span>
        <div style={{ flex: 1 }} />
        <span>Help</span>
        <span>Terms</span>
        <span>Privacy</span>
        <span>© 2026 Turf</span>
      </div>
    </footer>
  )
}
