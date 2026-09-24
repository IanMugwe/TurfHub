import type { StaffRole } from '../../types'
import Toggle from '../../ui/Toggle'
import { STAFF_ACCOUNTS, VENUE } from '../../mocks/data'
import { useIsDesktop } from '../../lib/useIsDesktop'

interface SettingsItem {
  icon: string
  label: string
  sub: string
  toggle?: boolean
  on?: boolean
  danger?: boolean
  action?: 'theme' | 'signout'
}

function sectionsFor(user: { name: string; staffRole: StaffRole }) {
  const isOwner = user.staffRole === 'owner'
  const sections: { title: string; items: SettingsItem[] }[] = [
    {
      title: 'Venue',
      items: [
        { icon: '🏟', label: 'Venue details', sub: VENUE.name },
        { icon: '⚽', label: 'Pitches', sub: `${VENUE.pitches.length} pitches configured` },
        { icon: '🕐', label: 'Opening hours', sub: 'Mon–Sun 06:00–23:00' },
        ...(isOwner ? [{ icon: '💰', label: 'Pricing rules', sub: '3 rules' }] : []),
        { icon: '🔒', label: 'Blocked periods', sub: '0 active' },
      ],
    },
    {
      title: 'Booking settings',
      items: [
        { icon: '✅', label: 'Auto-confirm app bookings', sub: 'Off — approve each request', toggle: true, on: false },
        { icon: '⏱', label: 'Free cancellation window', sub: '2 hours before start' },
      ],
    },
    {
      title: 'Team',
      items: [
        ...STAFF_ACCOUNTS.map(a => ({ icon: '👤', label: a.name, sub: `${ROLE_LABEL[a.staffRole]}${a.name === user.name ? ' · You' : ''}` })),
        { icon: '➕', label: 'Invite manager', sub: 'Add a team member' },
      ],
    },
    {
      title: 'Account',
      items: [
        { icon: '🌙', label: 'Dark mode', sub: '', toggle: true, on: false, action: 'theme' },
        { icon: '🔔', label: 'Notifications', sub: 'All on' },
        { icon: '🚪', label: 'Sign out', sub: '', danger: true, action: 'signout' },
      ],
    },
  ]
  return sections.filter(section => isOwner || section.title !== 'Team')
}

const ROLE_LABEL: Record<StaffRole, string> = { owner: 'Owner', manager: 'Manager' }

export default function MoreScreen({ user, theme, onToggleTheme, onSignOut }: { user: { name: string; staffRole: StaffRole }; theme: 'light' | 'dark'; onToggleTheme: () => void; onSignOut: () => void }) {
  const desktop = useIsDesktop()
  return (
    <div>
      <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: desktop ? '28px 32px 16px' : '52px 16px 16px' }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text)' }}>More</div>
      </div>

      {/* Pending approval banner */}
      <div style={{ margin: desktop ? '20px 32px 0' : '12px 16px 0', background: 'var(--color-pending-bg)', border: '1px solid var(--color-pending-border)', borderRadius: 12, padding: '12px 14px' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-pending-strong)' }}>Pending approval</div>
        <div style={{ fontSize: 13, color: 'var(--color-pending-strong)', marginTop: 2 }}>Customers can't see your venue yet. Our team will review within 24 hours.</div>
      </div>

      <div style={desktop ? { padding: '20px 32px 40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', columnGap: 24, alignItems: 'start' } : { padding: '12px 16px 40px' }}>
        {sectionsFor(user).map(section => (
          <div key={section.title} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, paddingLeft: 4 }}>{section.title}</div>
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 14, overflow: 'hidden' }}>
              {section.items.map((item, i) => {
                const action = item.action
                const on = action === 'theme' ? theme === 'dark' : !!item.on
                return (
                <button key={item.label} onClick={action === 'theme' ? onToggleTheme : action === 'signout' ? onSignOut : undefined}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderBottom: i < section.items.length - 1 ? '1px solid var(--color-border)' : 'none', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 500, color: item.danger ? 'var(--color-noshow)' : 'var(--color-text)' }}>{item.label}</div>
                    {item.sub && <div style={{ fontSize: 13, color: 'var(--color-muted)', marginTop: 1 }}>{item.sub}</div>}
                  </div>
                  {item.toggle ? (
                    <Toggle on={on} label={item.label} />
                  ) : !item.danger && (
                    <span style={{ color: 'var(--color-muted-light)', fontSize: 18 }}>›</span>
                  )}
                </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
