import { useState } from 'react'
import { useNavigate } from 'react-router'
import SettingsPage from '../settings/SettingsPage'
import { useStaff } from '../../app/StaffLayout'
import { useDemoStore } from '../../app/DemoStore'
import { useToast } from '../../ui/Toast'
import { Chip, Field, Panel, PrimaryButton, SectionTitle, inputStyle } from '../../ui/form'
import type { Pitch, PitchType } from '../../types'

const TYPES: PitchType[] = ['5-a-side', '7-a-side', '11-a-side']
const DEFAULT_PRICES: Record<PitchType, [number, number]> = { '5-a-side': [2500, 3500], '7-a-side': [3000, 4000], '11-a-side': [4500, 6000] }

/** List another venue: the essentials now, everything else later in More */
export default function NewVenuePage({ onBack }: { onBack: () => void }) {
  const { session } = useStaff()
  const { createVenue } = useDemoStore()
  const toast = useToast()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [area, setArea] = useState('')
  const [address, setAddress] = useState('')
  const [pitches, setPitches] = useState<Pitch[]>([{ id: 'A', name: 'Pitch A', type: '5-a-side', priceOffPeak: 2500, pricePeak: 3500, active: true }])

  const setPitch = (id: string, patch: Partial<Pitch>) => setPitches(ps => ps.map(p => (p.id === id ? { ...p, ...patch } : p)))
  const addPitch = () => {
    const id = String.fromCharCode(65 + pitches.length)
    setPitches(ps => [...ps, { id, name: `Pitch ${id}`, type: '7-a-side', priceOffPeak: 3000, pricePeak: 4000, active: true }])
  }
  const valid = name.trim().length > 2 && area.trim().length > 1 && pitches.every(p => p.name.trim() && p.priceOffPeak > 0 && p.pricePeak > 0)

  function submit() {
    const venue = createVenue({ name: session.name, phone: session.phone }, { name, area, address, pitches })
    toast(`${venue.name} listed. We'll review it within 24 hours`)
    navigate(`/v/${venue.id}/today`, { replace: true })
  }

  return (
    <SettingsPage title="List a new venue" subtitle="Start taking bookings in a few minutes. You can add photos, hours and pricing after." onBack={onBack}>
      <Field label="Venue name"><input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Karen Turf Club" /></Field>
      <Field label="Area" hint="How players search, e.g. Karen, Nairobi"><input style={inputStyle} value={area} onChange={e => setArea(e.target.value)} placeholder="Karen, Nairobi" /></Field>
      <Field label="Address (optional)"><input style={inputStyle} value={address} onChange={e => setAddress(e.target.value)} placeholder="Road and nearest landmark" /></Field>

      <SectionTitle>Pitches</SectionTitle>
      {pitches.map(p => (
        <Panel key={p.id} style={{ padding: '14px 16px', marginBottom: 10 }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
            <input aria-label="Pitch name" style={{ ...inputStyle, width: 160, padding: '8px 10px' }} value={p.name} onChange={e => setPitch(p.id, { name: e.target.value })} />
            {pitches.length > 1 && (
              <button type="button" onClick={() => setPitches(ps => ps.filter(x => x.id !== p.id))} style={{ background: 'none', border: 'none', color: 'var(--color-noshow)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Remove</button>
            )}
          </div>
          <div className="flex gap-2 flex-wrap" style={{ marginBottom: 10 }}>
            {TYPES.map(t => (
              <Chip key={t} selected={p.type === t} onClick={() => setPitch(p.id, { type: t, priceOffPeak: DEFAULT_PRICES[t][0], pricePeak: DEFAULT_PRICES[t][1] })}>{t}</Chip>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Off-peak (KES/hr)"><input style={inputStyle} type="number" min={0} step={100} value={p.priceOffPeak} onChange={e => setPitch(p.id, { priceOffPeak: Number(e.target.value) })} /></Field>
            <Field label="Peak (KES/hr)"><input style={inputStyle} type="number" min={0} step={100} value={p.pricePeak} onChange={e => setPitch(p.id, { pricePeak: Number(e.target.value) })} /></Field>
          </div>
        </Panel>
      ))}
      {pitches.length < 6 && (
        <button type="button" onClick={addPitch}
          style={{ width: '100%', padding: '12px', borderRadius: 12, border: '1px dashed var(--color-primary)', background: 'transparent', color: 'var(--color-primary)', fontSize: 15, fontWeight: 600, cursor: 'pointer', marginBottom: 20 }}>
          + Add another pitch
        </button>
      )}

      <PrimaryButton onClick={submit} disabled={!valid}>List venue</PrimaryButton>
      <div style={{ fontSize: 12, color: 'var(--color-muted)', textAlign: 'center', marginTop: 10 }}>New venues are reviewed before players can find them. You can take walk-in and phone bookings straight away.</div>
    </SettingsPage>
  )
}
