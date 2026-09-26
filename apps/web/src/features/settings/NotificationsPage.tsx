import SettingsPage from './SettingsPage'
import { useStaff } from '../../app/StaffLayout'
import { useDemoStore } from '../../app/DemoStore'
import Toggle from '../../ui/Toggle'
import { Panel, Row } from '../../ui/form'
import type { NotificationKey } from '../../types'

const ITEMS: { key: NotificationKey; icon: string; title: string; sub: string }[] = [
  { key: 'newRequests', icon: '📥', title: 'New booking requests', sub: 'An SMS as soon as a player requests a slot' },
  { key: 'cancellations', icon: '↩️', title: 'Cancellations', sub: 'When a player cancels an upcoming booking' },
  { key: 'dailySummary', icon: '📊', title: 'Daily summary', sub: "Every evening: tomorrow's bookings and today's unpaid balance" },
  { key: 'paymentReminders', icon: '💬', title: 'Payment reminders to customers', sub: 'Text customers with an unpaid balance the morning after their game' },
]

export default function NotificationsPage({ onBack }: { onBack: () => void }) {
  const { venue, session } = useStaff()
  const { updateVenue } = useDemoStore()

  return (
    <SettingsPage title="Notifications" subtitle={`Sent by SMS to ${session.phone}`} onBack={onBack}>
      <Panel>
        {ITEMS.map((item, i) => (
          <Row key={item.key} icon={item.icon} title={item.title} sub={item.sub} last={i === ITEMS.length - 1}
            right={<Toggle on={venue.notifications[item.key]} label={item.title}
              onChange={on => updateVenue(venue.id, { notifications: { ...venue.notifications, [item.key]: on } })} />} />
        ))}
      </Panel>
    </SettingsPage>
  )
}
