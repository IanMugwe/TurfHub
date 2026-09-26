import { useState } from 'react'
import SettingsPage from './SettingsPage'
import { useStaff } from '../../app/StaffLayout'
import { useDemoStore } from '../../app/DemoStore'
import { useToast } from '../../ui/Toast'
import Toggle from '../../ui/Toggle'
import { HourSelect, Panel, PrimaryButton, SectionTitle, inputStyle } from '../../ui/form'
import { hourLabel } from '../../lib/venue'
import { formatKES } from '@turfhub/validation'

export default function PricingPage({ onBack }: { onBack: () => void }) {
  const { venue } = useStaff()
  const { updateVenue } = useDemoStore()
  const toast = useToast()
  const [peak, setPeak] = useState(venue.peak)
  const [pitches, setPitches] = useState(venue.pitches.map(p => ({ ...p })))
  const valid = peak.end > peak.start && pitches.every(p => p.priceOffPeak > 0 && p.pricePeak > 0)
  const setPrice = (id: string, key: 'priceOffPeak' | 'pricePeak', value: number) => setPitches(ps => ps.map(p => (p.id === id ? { ...p, [key]: value } : p)))
  const example = pitches.find(p => p.active) ?? pitches[0]

  function save() {
    updateVenue(venue.id, { peak, pitches })
    toast('Pricing saved. New bookings use these prices')
    onBack()
  }

  return (
    <SettingsPage title="Pricing rules" subtitle="Prices apply to new bookings; existing bookings keep their price" onBack={onBack}>
      <SectionTitle>Peak hours</SectionTitle>
      <Panel style={{ padding: '14px 16px' }}>
        <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: 14 }}>
          <span style={{ fontSize: 15, color: 'var(--color-text)', marginRight: 4 }}>Weekdays</span>
          <HourSelect label="Peak starts" value={peak.start} from={0} to={23} onChange={v => setPeak(p => ({ ...p, start: v }))} />
          <span style={{ color: 'var(--color-muted)' }}>–</span>
          <HourSelect label="Peak ends" value={peak.end} from={1} to={24} onChange={v => setPeak(p => ({ ...p, end: v }))} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div style={{ fontSize: 15, color: 'var(--color-text)' }}>Weekends are peak all day</div>
            <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>Saturday and Sunday charge peak prices at every hour</div>
          </div>
          <Toggle on={peak.weekendsAllDay} onChange={on => setPeak(p => ({ ...p, weekendsAllDay: on }))} label="Weekends are peak all day" />
        </div>
      </Panel>

      <SectionTitle>Prices per hour</SectionTitle>
      <Panel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px 110px', gap: 8, padding: '10px 16px', fontSize: 12, fontWeight: 600, color: 'var(--color-muted)', borderBottom: '1px solid var(--color-border)' }}>
          <span>Pitch</span><span>Off-peak</span><span>Peak</span>
        </div>
        {pitches.map((p, i) => (
          <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '1fr 110px 110px', gap: 8, alignItems: 'center', padding: '10px 16px', borderBottom: i < pitches.length - 1 ? '1px solid var(--color-border)' : 'none', opacity: p.active ? 1 : 0.5 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{p.name}</div>
              <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>{p.type}{p.active ? '' : ' · inactive'}</div>
            </div>
            <input aria-label={`${p.name} off-peak price`} style={{ ...inputStyle, padding: '9px 10px' }} type="number" min={0} step={100} value={p.priceOffPeak} onChange={e => setPrice(p.id, 'priceOffPeak', Number(e.target.value))} />
            <input aria-label={`${p.name} peak price`} style={{ ...inputStyle, padding: '9px 10px' }} type="number" min={0} step={100} value={p.pricePeak} onChange={e => setPrice(p.id, 'pricePeak', Number(e.target.value))} />
          </div>
        ))}
      </Panel>

      {example && valid && (
        <div style={{ fontSize: 13, color: 'var(--color-primary)', background: 'var(--color-primary-light)', padding: '10px 14px', borderRadius: 10, marginBottom: 16 }}>
          Example: {example.name} on a Tuesday costs {formatKES(example.priceOffPeak)} at {hourLabel(Math.max(0, peak.start - 2))} and {formatKES(example.pricePeak)} at {hourLabel(peak.start)}
          {peak.weekendsAllDay ? `, and ${formatKES(example.pricePeak)} all day on Saturday.` : '.'}
        </div>
      )}
      {!valid && <div style={{ fontSize: 13, color: 'var(--color-noshow)', marginBottom: 12 }}>Peak must end after it starts, and every price must be above zero.</div>}
      <PrimaryButton onClick={save} disabled={!valid}>Save pricing</PrimaryButton>
    </SettingsPage>
  )
}
