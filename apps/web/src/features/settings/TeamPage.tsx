import { useState } from 'react'
import { useSearchParams } from 'react-router'
import SettingsPage from './SettingsPage'
import { useStaff } from '../../app/StaffLayout'
import { useDemoStore } from '../../app/DemoStore'
import { useToast } from '../../ui/Toast'
import BottomSheet from '../../ui/BottomSheet'
import { Chip, Field, Panel, PrimaryButton, Row, SecondaryButton, inputStyle } from '../../ui/form'
import { formatPhoneKE, normalizePhoneKE } from '@turfhub/validation'
import type { StaffRole, TeamMember } from '../../types'

const ROLE_LABEL: Record<StaffRole, string> = { owner: 'Owner', manager: 'Manager' }
const ROLE_HELP: Record<StaffRole, string> = {
  owner: 'Everything, including revenue reports, pricing and the team',
  manager: 'Bookings, payments and customers. No reports, pricing or team settings',
}

export default function TeamPage({ onBack }: { onBack: () => void }) {
  const { venue, session } = useStaff()
  const [params, setParams] = useSearchParams()
  const selected = venue.team.find(m => m.phone === params.get('member'))
  const inviting = params.get('invite') === '1'
  const close = () => setParams({}, { replace: true })

  return (
    <SettingsPage title="Team" subtitle={`People who can manage ${venue.name}`} onBack={onBack}>
      <Panel>
        {venue.team.map((m, i) => (
          <Row key={m.phone} icon="👤" last={i === venue.team.length - 1} onClick={() => setParams({ member: m.phone })}
            title={<>{m.name}{m.phone === session.phone && <span style={{ color: 'var(--color-muted)', fontWeight: 400 }}> · You</span>}</>}
            sub={`${ROLE_LABEL[m.role]} · ${m.phone}`}
            right={m.status === 'invited'
              ? <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-pending)', background: 'var(--color-pending-bg)', padding: '3px 8px', borderRadius: 20 }}>Invited</span>
              : undefined} />
        ))}
      </Panel>
      <PrimaryButton onClick={() => setParams({ invite: '1' })}>+ Invite manager</PrimaryButton>

      {selected && <MemberSheet member={selected} isYou={selected.phone === session.phone} onClose={close} />}
      {inviting && <InviteSheet onClose={close} />}
    </SettingsPage>
  )
}

function MemberSheet({ member, isYou, onClose }: { member: TeamMember; isYou: boolean; onClose: () => void }) {
  const { venue } = useStaff()
  const { setMemberRole, removeMember } = useDemoStore()
  const toast = useToast()
  const owners = venue.team.filter(m => m.role === 'owner').length
  // A venue always keeps at least one owner, and you can't demote or remove yourself
  const locked = isYou || (member.role === 'owner' && owners === 1)

  return (
    <BottomSheet onClose={onClose} label={member.name}>
      <div style={{ padding: '16px 20px 0' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)' }}>{member.name}</div>
        <div style={{ fontSize: 14, color: 'var(--color-muted)', marginBottom: 14 }}>{member.phone}{member.status === 'invited' ? ' · Invite sent, not signed in yet' : ''}</div>
        <a href={`tel:${member.phone}`} style={{ display: 'block', textAlign: 'center', padding: '10px', borderRadius: 10, background: 'var(--color-primary-light)', color: 'var(--color-primary)', fontSize: 14, fontWeight: 600, textDecoration: 'none', marginBottom: 16 }}>📞 Call</a>

        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-muted)', marginBottom: 6 }}>Role</div>
        <div className="flex gap-2" style={{ marginBottom: 6 }}>
          {(['manager', 'owner'] as StaffRole[]).map(r => (
            <Chip key={r} selected={member.role === r} onClick={() => {
              if (locked || member.role === r) return
              setMemberRole(venue.id, member.phone, r)
              toast(`${member.name} is now ${r === 'owner' ? 'an owner' : 'a manager'}`)
            }}>{ROLE_LABEL[r]}</Chip>
          ))}
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 18 }}>{ROLE_HELP[member.role]}</div>

        {!locked && (
          <SecondaryButton danger onClick={() => { removeMember(venue.id, member.phone); toast(`${member.name} removed from ${venue.name}`); onClose() }}>
            Remove from team
          </SecondaryButton>
        )}
        {locked && <div style={{ fontSize: 12, color: 'var(--color-muted-light)', textAlign: 'center' }}>{isYou ? "You can't change your own role." : 'Every venue needs at least one owner.'}</div>}
      </div>
    </BottomSheet>
  )
}

function InviteSheet({ onClose }: { onClose: () => void }) {
  const { venue } = useStaff()
  const { inviteMember } = useDemoStore()
  const toast = useToast()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('+254 ')
  const [role, setRole] = useState<StaffRole>('manager')
  const normalized = normalizePhoneKE(phone)
  const exists = !!normalized && venue.team.some(m => normalizePhoneKE(m.phone) === normalized)
  const valid = name.trim().length > 1 && !!normalized && !exists

  function invite() {
    const display = formatPhoneKE(normalized!)
    inviteMember(venue.id, { name: name.trim(), phone: display, role })
    toast(`Invite sent by SMS to ${display}`)
    onClose()
  }

  return (
    <BottomSheet onClose={onClose} label="Invite a team member">
      <div style={{ padding: '16px 20px 0' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 }}>Invite a team member</div>
        <div style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 16 }}>They'll get an SMS and can sign in with their phone number.</div>
        <Field label="Name"><input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="Achieng Odhiambo" /></Field>
        <Field label="Phone number" hint={exists ? 'Already on your team' : undefined}>
          <input style={inputStyle} type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
        </Field>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-muted)', marginBottom: 6 }}>Role</div>
        <div className="flex gap-2" style={{ marginBottom: 6 }}>
          {(['manager', 'owner'] as StaffRole[]).map(r => <Chip key={r} selected={role === r} onClick={() => setRole(r)}>{ROLE_LABEL[r]}</Chip>)}
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 18 }}>{ROLE_HELP[role]}</div>
        <PrimaryButton onClick={invite} disabled={!valid}>Send invite</PrimaryButton>
      </div>
    </BottomSheet>
  )
}
