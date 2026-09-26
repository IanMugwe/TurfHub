import { useState } from 'react'
import SettingsPage from './SettingsPage'
import { useStaff } from '../../app/StaffLayout'
import { useDemoStore } from '../../app/DemoStore'
import { useToast } from '../../ui/Toast'
import { Chip, Field, HourSelect, Panel, PrimaryButton, Row, SectionTitle, inputStyle } from '../../ui/form'
import { addDays, formatDay, todayKey } from '../../lib/dates'
import { hourLabel, hoursFor } from '../../lib/venue'
import { isActive, rangeOf } from '../../lib/bookings'

const REASONS = ['Maintenance', 'Private event', 'Tournament', 'Training']

export default function BlockedPeriodsPage({ onBack }: { onBack: () => void }) {
  const { venue } = useStaff()
  const { bookings, addBlock, removeBlock } = useDemoStore()
  const toast = useToast()
  const today = todayKey()
  const days = Array.from({ length: 14 }, (_, i) => addDays(today, i))

  const [pitchId, setPitchId] = useState<string>('all')
  const [dateKey, setDateKey] = useState(today)
  const hours = hoursFor(venue, dateKey)
  const [startH, setStartH] = useState(Math.max(hours.open, 10))
  const [endH, setEndH] = useState(Math.max(hours.open, 10) + 2)
  const [reason, setReason] = useState(REASONS[0])

  const upcoming = venue.blocked.filter(b => b.dateKey >= today).sort((a, b) => a.dateKey.localeCompare(b.dateKey) || a.startH - b.startH)
  const pitchName = (id: string) => (id === 'all' ? 'Whole venue' : venue.pitches.find(p => p.id === id)?.name ?? id)

  // Staff can't block time that already has bookings: move or cancel them first (implementation plan §2.2)
  const clashes = bookings.filter(b =>
    b.venueId === venue.id && b.dateKey === dateKey && isActive(b) && b.status !== 'noshow' &&
    (pitchId === 'all' || b.pitchId === pitchId) && rangeOf(b)[0] < endH * 60 && startH * 60 < rangeOf(b)[1])
  const valid = endH > startH && reason.trim().length > 0

  function add() {
    addBlock(venue.id, { pitchId, dateKey, startH, endH, reason: reason.trim() })
    toast(`Blocked ${pitchName(pitchId)} · ${formatDay(dateKey)} ${hourLabel(startH)}–${hourLabel(endH)}`)
  }

  return (
    <SettingsPage title="Blocked periods" subtitle="Maintenance, private events and anything else players can't book" onBack={onBack}>
      <SectionTitle>Upcoming</SectionTitle>
      <Panel>
        {upcoming.length === 0 && <Row icon="✅" title="Nothing blocked" sub="All open hours can be booked" last />}
        {upcoming.map((b, i) => (
          <Row key={b.id} icon="🔒" last={i === upcoming.length - 1}
            title={`${b.reason} · ${pitchName(b.pitchId)}`}
            sub={`${formatDay(b.dateKey)} · ${hourLabel(b.startH)}–${hourLabel(b.endH)}`}
            right={<button onClick={() => { removeBlock(venue.id, b.id); toast('Block removed') }} style={{ background: 'none', border: 'none', color: 'var(--color-noshow)', fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: '8px 4px' }}>Remove</button>} />
        ))}
      </Panel>

      <SectionTitle>Block time</SectionTitle>
      <Panel style={{ padding: '14px 16px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-muted)', marginBottom: 6 }}>Where</div>
        <div className="flex gap-2 flex-wrap" style={{ marginBottom: 14 }}>
          <Chip selected={pitchId === 'all'} onClick={() => setPitchId('all')}>Whole venue</Chip>
          {venue.pitches.filter(p => p.active).map(p => <Chip key={p.id} selected={pitchId === p.id} onClick={() => setPitchId(p.id)}>{p.name}</Chip>)}
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-muted)', marginBottom: 6 }}>Day</div>
        <div className="flex gap-2" style={{ overflowX: 'auto', marginBottom: 14, paddingBottom: 2 }}>
          {days.map(d => <Chip key={d} selected={dateKey === d} onClick={() => setDateKey(d)}>{d === today ? 'Today' : formatDay(d)}</Chip>)}
        </div>
        <div className="flex items-center gap-2" style={{ marginBottom: 14 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-muted)', width: 48 }}>From</span>
          <HourSelect label="Block from" value={startH} from={0} to={23} onChange={setStartH} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-muted)' }}>to</span>
          <HourSelect label="Block until" value={endH} from={1} to={24} onChange={setEndH} />
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-muted)', marginBottom: 6 }}>Reason</div>
        <div className="flex gap-2 flex-wrap" style={{ marginBottom: 10 }}>
          {REASONS.map(r => <Chip key={r} selected={reason === r} onClick={() => setReason(r)}>{r}</Chip>)}
        </div>
        <Field label="Or type a reason"><input style={inputStyle} value={reason} onChange={e => setReason(e.target.value)} /></Field>

        {clashes.length > 0 ? (
          <div style={{ fontSize: 13, color: 'var(--color-noshow)', background: 'var(--color-noshow-bg)', padding: '10px 12px', borderRadius: 10, marginBottom: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{clashes.length} booking{clashes.length > 1 ? 's' : ''} in this time. Move or cancel {clashes.length > 1 ? 'them' : 'it'} first:</div>
            {clashes.map(b => <div key={b.ref}>{b.time} · {b.pitch} · {b.customer}</div>)}
          </div>
        ) : !valid ? (
          <div style={{ fontSize: 13, color: 'var(--color-noshow)', marginBottom: 12 }}>The end time must be after the start time.</div>
        ) : null}
        <PrimaryButton onClick={add} disabled={!valid || clashes.length > 0}>Block {hourLabel(startH)}–{hourLabel(endH)}</PrimaryButton>
      </Panel>
    </SettingsPage>
  )
}
