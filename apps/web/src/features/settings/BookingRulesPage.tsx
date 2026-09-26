import SettingsPage from './SettingsPage'
import { useStaff } from '../../app/StaffLayout'
import { useDemoStore } from '../../app/DemoStore'
import { useToast } from '../../ui/Toast'
import Toggle from '../../ui/Toggle'
import { Chip, Panel, SectionTitle } from '../../ui/form'

const WINDOWS = [1, 2, 4, 6, 12, 24]

export default function BookingRulesPage({ onBack }: { onBack: () => void }) {
  const { venue } = useStaff()
  const { updateVenue } = useDemoStore()
  const toast = useToast()

  return (
    <SettingsPage title="Booking rules" subtitle="How players book and cancel through the app" onBack={onBack}>
      <SectionTitle>Free cancellation window</SectionTitle>
      <Panel style={{ padding: '14px 16px' }}>
        <div style={{ fontSize: 14, color: 'var(--color-text)', marginBottom: 12 }}>
          Players can cancel for free up to <strong>{venue.cancellationHours} hour{venue.cancellationHours === 1 ? '' : 's'}</strong> before their game. After that, only you can cancel.
        </div>
        <div className="flex gap-2 flex-wrap">
          {WINDOWS.map(h => (
            <Chip key={h} selected={venue.cancellationHours === h} onClick={() => { updateVenue(venue.id, { cancellationHours: h }); toast(`Free cancellation up to ${h} hour${h === 1 ? '' : 's'} before`) }}>
              {h}h
            </Chip>
          ))}
        </div>
      </Panel>

      <SectionTitle>App bookings</SectionTitle>
      <Panel style={{ padding: '14px 16px' }}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text)' }}>Auto-confirm app bookings</div>
            <div style={{ fontSize: 13, color: 'var(--color-muted)', marginTop: 2 }}>
              {venue.autoConfirm
                ? 'Bookings from the app are confirmed instantly.'
                : "You approve each request. Unanswered requests auto-decline after 2 hours, and players with repeat no-shows always need approval."}
            </div>
          </div>
          <Toggle on={venue.autoConfirm} onChange={on => { updateVenue(venue.id, { autoConfirm: on }); toast(on ? 'App bookings are now confirmed instantly' : 'App bookings now need your approval') }} label="Auto-confirm app bookings" />
        </div>
      </Panel>
    </SettingsPage>
  )
}
