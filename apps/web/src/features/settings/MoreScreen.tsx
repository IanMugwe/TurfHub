import { useNavigate } from 'react-router'
import type { StaffRole, Venue } from '../../types'
import Toggle from '../../ui/Toggle'
import { useDemoStore } from '../../app/DemoStore'
import { useStaff } from '../../app/StaffLayout'
import { useToast } from '../../ui/Toast'
import { useIsDesktop } from '../../lib/useIsDesktop'
import { activePitches, hourLabel, peakLabel, priceFrom } from '../../lib/venue'
import { todayKey } from '../../lib/dates'
import { formatKES } from '@turfhub/validation'

interface SettingsItem {
  icon: string
  label: string
  sub: string
  toggle?: boolean
  on?: boolean
  danger?: boolean
  action?: 'theme' | 'signout' | 'autoconfirm'
  /** Settings page to open, relative to /v/:venueId/settings */
  to?: string
}

const ROLE_LABEL: Record<StaffRole, string> = { owner: 'Owner', manager: 'Manager' }
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/** "Mon–Sun 06:00–23:00", or a note when days differ */
function hoursSummary(venue: Venue) {
  const open = venue.hours.filter(h => !h.closed)
  const closed = venue.hours.map((h, i) => (h.closed ? DAY_SHORT[i] : null)).filter(Boolean)
  const same = open.every(h => h.open === open[0]?.open && h.close === open[0]?.close)
  const range = open.length && same ? `${hourLabel(open[0].open)}–${hourLabel(open[0].close)}` : 'Varies by day'
  return closed.length ? `${range} · closed ${closed.join(', ')}` : `Every day ${range}`
}

function sectionsFor(venue: Venue, role: StaffRole, myPhone: string) {
  const isOwner = role === 'owner'
  const today = todayKey()
  const upcomingBlocks = venue.blocked.filter(b => b.dateKey >= today).length
  const notificationsOn = Object.values(venue.notifications).filter(Boolean).length
  const sections: { title: string; items: SettingsItem[] }[] = [
    {
      title: 'Venue',
      items: [
        { icon: '🏟', label: 'Venue details', sub: `${venue.name} · ${venue.area.split(',')[0]}`, to: 'venue' },
        { icon: '⚽', label: 'Pitches', sub: `${activePitches(venue).length} active pitch${activePitches(venue).length === 1 ? '' : 'es'}`, to: 'pitches' },
        { icon: '🕐', label: 'Opening hours', sub: hoursSummary(venue), to: 'hours' },
        ...(isOwner ? [{ icon: '💰', label: 'Pricing rules', sub: `${peakLabel(venue)} · from ${formatKES(priceFrom(venue))}`, to: 'pricing' }] : []),
        { icon: '🔒', label: 'Blocked periods', sub: upcomingBlocks ? `${upcomingBlocks} upcoming` : 'None upcoming', to: 'blocked' },
      ],
    },
    {
      title: 'Booking settings',
      items: [
        { icon: '✅', label: 'Auto-confirm app bookings', sub: venue.autoConfirm ? 'On: app bookings are confirmed instantly' : 'Off: approve each request', toggle: true, action: 'autoconfirm' },
        { icon: '⏱', label: 'Free cancellation window', sub: `Up to ${venue.cancellationHours} hour${venue.cancellationHours === 1 ? '' : 's'} before start`, to: 'booking-rules' },
      ],
    },
    {
      title: 'Team',
      items: [
        ...venue.team.map(m => ({
          icon: '👤', label: m.name, to: `team?member=${encodeURIComponent(m.phone)}`,
          sub: `${ROLE_LABEL[m.role]}${m.status === 'invited' ? ' · Invited' : ''}${m.phone === myPhone ? ' · You' : ''}`,
        })),
        { icon: '➕', label: 'Invite manager', sub: 'Add a team member by phone', to: 'team?invite=1' },
      ],
    },
    {
      title: 'Account',
      items: [
        { icon: '🌙', label: 'Dark mode', sub: '', toggle: true, on: false, action: 'theme' },
        { icon: '🔔', label: 'Notifications', sub: `${notificationsOn} of 4 alerts on`, to: 'notifications' },
        { icon: '🚪', label: 'Sign out', sub: '', danger: true, action: 'signout' },
      ],
    },
  ]
  return sections.filter(section => isOwner || section.title !== 'Team')
}

export default function MoreScreen({ user, theme, onToggleTheme, onSignOut }: { user: { name: string; phone: string }; theme: 'light' | 'dark'; onToggleTheme: () => void; onSignOut: () => void }) {
  const { venue, role, venueId } = useStaff()
  const { updateVenue } = useDemoStore()
  const toast = useToast()
  const navigate = useNavigate()

  function handle(item: SettingsItem) {
    if (item.action === 'theme') return onToggleTheme()
    if (item.action === 'signout') return onSignOut()
    if (item.action === 'autoconfirm') {
      updateVenue(venue.id, { autoConfirm: !venue.autoConfirm })
      return toast(venue.autoConfirm ? 'App bookings now need your approval' : 'App bookings are now confirmed instantly')
    }
    if (item.to) navigate(`/v/${venueId}/settings/${item.to}`)
  }
  const desktop = useIsDesktop()
  return (
    <div>
      <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: desktop ? '28px 32px 16px' : '52px 16px 16px', ...(desktop && { background: 'transparent', borderBottom: 'none' }) }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text)' }}>More</div>
      </div>

      {venue.status === 'pending' && (
        <div style={{ margin: desktop ? '20px 32px 0' : '12px 16px 0', background: 'var(--color-pending-bg)', border: '1px solid var(--color-pending-border)', borderRadius: 12, padding: '12px 14px' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-pending-strong)' }}>Pending approval</div>
          <div style={{ fontSize: 13, color: 'var(--color-pending-strong)', marginTop: 2 }}>Players can't see {venue.name} yet. Our team reviews new venues within 24 hours.</div>
        </div>
      )}

      <div style={desktop ? { padding: '20px 32px 40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', columnGap: 24, alignItems: 'start' } : { padding: '12px 16px 40px' }}>
        {sectionsFor(venue, role, user.phone).map(section => (
          <div key={section.title} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, paddingLeft: 4 }}>{section.title}</div>
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 14, overflow: 'hidden' }}>
              {section.items.map(item => {
                const action = item.action
                const on = action === 'theme' ? theme === 'dark' : action === 'autoconfirm' ? venue.autoConfirm : !!item.on
                return (
                <button key={item.label} onClick={() => handle(item)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
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
