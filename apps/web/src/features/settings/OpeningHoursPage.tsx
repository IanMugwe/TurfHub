import { useState } from 'react'
import SettingsPage from './SettingsPage'
import { useStaff } from '../../app/StaffLayout'
import { useDemoStore } from '../../app/DemoStore'
import { useToast } from '../../ui/Toast'
import Toggle from '../../ui/Toggle'
import { HourSelect, Panel, PrimaryButton } from '../../ui/form'
import { WEEKDAY_NAMES } from '../../lib/venue'
import { todayKey } from '../../lib/dates'
import { isActive, rangeOf } from '../../lib/bookings'
import type { DayHours } from '../../types'

// Show Monday first, as people read a week
const ORDER = [1, 2, 3, 4, 5, 6, 0]

export default function OpeningHoursPage({ onBack }: { onBack: () => void }) {
  const { venue } = useStaff()
  const { updateVenue, bookings } = useDemoStore()
  const toast = useToast()
  const [hours, setHours] = useState<DayHours[]>(venue.hours.map(h => ({ ...h })))
  const setDay = (day: number, patch: Partial<DayHours>) => setHours(hs => hs.map((h, i) => (i === day ? { ...h, ...patch } : h)))
  const valid = hours.every(h => h.closed || h.close > h.open)

  // Upcoming bookings that would fall outside the new hours (they stay booked; the owner is told)
  const today = todayKey()
  const outside = bookings.filter(b => {
    if (b.venueId !== venue.id || b.dateKey < today || !isActive(b) || b.status === 'completed') return false
    const h = hours[new Date(`${b.dateKey}T12:00`).getDay()]
    const [s, e] = rangeOf(b)
    return h.closed || s < h.open * 60 || e > h.close * 60
  })

  function save() {
    updateVenue(venue.id, { hours })
    toast('Opening hours saved')
    onBack()
  }

  return (
    <SettingsPage title="Opening hours" subtitle="Players can only book inside these hours" onBack={onBack}>
      <Panel>
        {ORDER.map((day, i) => {
          const h = hours[day]
          return (
            <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: i < 6 ? '1px solid var(--color-border)' : 'none', minHeight: 60, flexWrap: 'wrap' }}>
              <div style={{ width: 96, fontSize: 15, fontWeight: 500, color: 'var(--color-text)' }}>{WEEKDAY_NAMES[day]}</div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                {h.closed ? (
                  <span style={{ fontSize: 14, color: 'var(--color-muted)' }}>Closed</span>
                ) : (
                  <>
                    <HourSelect label={`${WEEKDAY_NAMES[day]} opens`} value={h.open} from={0} to={23} onChange={v => setDay(day, { open: v })} />
                    <span style={{ color: 'var(--color-muted)' }}>–</span>
                    <HourSelect label={`${WEEKDAY_NAMES[day]} closes`} value={h.close} from={1} to={24} onChange={v => setDay(day, { close: v })} />
                  </>
                )}
              </div>
              <Toggle on={!h.closed} onChange={on => setDay(day, { closed: !on })} label={`Open on ${WEEKDAY_NAMES[day]}`} />
            </div>
          )
        })}
      </Panel>
      {!valid && <div style={{ fontSize: 13, color: 'var(--color-noshow)', marginBottom: 12 }}>Closing time must be after opening time.</div>}
      {valid && outside.length > 0 && (
        <div style={{ fontSize: 13, color: 'var(--color-pending)', background: 'var(--color-pending-bg)', padding: '8px 12px', borderRadius: 10, marginBottom: 14 }}>
          ⚠ {outside.length} upcoming booking{outside.length > 1 ? 's fall' : ' falls'} outside these hours. They stay booked; move or cancel them from the calendar.
        </div>
      )}
      <PrimaryButton onClick={save} disabled={!valid}>Save hours</PrimaryButton>
    </SettingsPage>
  )
}
