import { useState } from 'react'
import SettingsPage from './SettingsPage'
import { useStaff } from '../../app/StaffLayout'
import { useDemoStore } from '../../app/DemoStore'
import { useToast } from '../../ui/Toast'
import BottomSheet from '../../ui/BottomSheet'
import Toggle from '../../ui/Toggle'
import { Chip, Field, Panel, PrimaryButton, Row, inputStyle } from '../../ui/form'
import { formatKES } from '@turfhub/validation'
import type { Pitch, PitchType } from '../../types'

const TYPES: PitchType[] = ['5-a-side', '7-a-side', '11-a-side']

/** Next free id: letters for lettered pitches (A, B, C → D), otherwise numbers */
function nextPitchId(pitches: Pitch[]) {
  const ids = pitches.map(p => p.id)
  if (ids.every(id => /^[A-Z]$/.test(id))) {
    for (let c = 65; c <= 90; c++) if (!ids.includes(String.fromCharCode(c))) return String.fromCharCode(c)
  }
  let n = pitches.length + 1
  while (ids.includes(String(n))) n++
  return String(n)
}

export default function PitchesPage({ onBack }: { onBack: () => void }) {
  const { venue, role } = useStaff()
  const [editing, setEditing] = useState<Pitch | null>(null)
  const canEditPrices = role === 'owner'

  function addPitch() {
    const id = nextPitchId(venue.pitches)
    setEditing({ id, name: `Pitch ${id}`, type: '5-a-side', priceOffPeak: 2500, pricePeak: 3500, active: true })
  }

  return (
    <SettingsPage title="Pitches" subtitle="Inactive pitches are hidden from the calendar and from players" onBack={onBack}>
      <Panel>
        {venue.pitches.map((p, i) => (
          <Row key={p.id} icon="⚽" onClick={() => setEditing(p)} last={i === venue.pitches.length - 1}
            title={<>{p.name} <span style={{ color: 'var(--color-muted)', fontWeight: 400 }}>· {p.type}</span></>}
            sub={p.active ? `${formatKES(p.priceOffPeak)} off-peak · ${formatKES(p.pricePeak)} peak` : 'Inactive'} />
        ))}
      </Panel>
      <PrimaryButton onClick={addPitch}>+ Add pitch</PrimaryButton>
      {editing && <PitchSheet pitch={editing} isNew={!venue.pitches.some(p => p.id === editing.id)} canEditPrices={canEditPrices} onClose={() => setEditing(null)} />}
    </SettingsPage>
  )
}

function PitchSheet({ pitch, isNew, canEditPrices, onClose }: { pitch: Pitch; isNew: boolean; canEditPrices: boolean; onClose: () => void }) {
  const { venue } = useStaff()
  const { savePitch } = useDemoStore()
  const toast = useToast()
  const [form, setForm] = useState(pitch)
  const activeCount = venue.pitches.filter(p => p.active).length
  // Keep at least one pitch bookable
  const lastActive = !isNew && pitch.active && activeCount === 1
  const valid = form.name.trim().length > 0 && form.priceOffPeak > 0 && form.pricePeak > 0

  function save() {
    savePitch(venue.id, { ...form, name: form.name.trim() })
    toast(isNew ? `${form.name.trim()} added` : `${form.name.trim()} saved`)
    onClose()
  }

  return (
    <BottomSheet onClose={onClose} label={isNew ? 'Add pitch' : `Edit ${pitch.name}`}>
      <div style={{ padding: '16px 20px 0' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', marginBottom: 16 }}>{isNew ? 'Add pitch' : `Edit ${pitch.name}`}</div>
        <Field label="Name"><input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></Field>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-muted)', marginBottom: 6 }}>Size</div>
        <div className="flex gap-2" style={{ marginBottom: 14 }}>
          {TYPES.map(t => <Chip key={t} selected={form.type === t} onClick={() => setForm(f => ({ ...f, type: t }))}>{t}</Chip>)}
        </div>
        {canEditPrices && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Off-peak (KES/hr)"><input style={inputStyle} type="number" min={0} step={100} value={form.priceOffPeak} onChange={e => setForm(f => ({ ...f, priceOffPeak: Number(e.target.value) }))} /></Field>
            <Field label="Peak (KES/hr)"><input style={inputStyle} type="number" min={0} step={100} value={form.pricePeak} onChange={e => setForm(f => ({ ...f, pricePeak: Number(e.target.value) }))} /></Field>
          </div>
        )}
        <div className="flex items-center justify-between" style={{ padding: '6px 0 18px' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text)' }}>Available for booking</div>
            {lastActive && <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>Your only active pitch stays on</div>}
          </div>
          <Toggle on={form.active} onChange={on => !lastActive && setForm(f => ({ ...f, active: on }))} label="Available for booking" />
        </div>
        <PrimaryButton onClick={save} disabled={!valid}>{isNew ? 'Add pitch' : 'Save pitch'}</PrimaryButton>
      </div>
    </BottomSheet>
  )
}
