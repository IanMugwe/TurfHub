import { useNavigate } from 'react-router'
import BottomSheet from '../../ui/BottomSheet'
import { useStaff } from '../../app/StaffLayout'

/** Switch between the venues you work at, or list a new one */
export default function VenueSwitcherSheet({ onClose }: { onClose: () => void }) {
  const { venue: current, myVenues, role } = useStaff()
  const navigate = useNavigate()

  return (
    <BottomSheet onClose={onClose} label="Your venues">
      <div style={{ padding: '16px 20px 0' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', marginBottom: 14 }}>Your venues</div>
        <div style={{ border: '1px solid var(--color-border)', borderRadius: 14, overflow: 'hidden', marginBottom: 14 }}>
          {myVenues.map((v, i) => {
            const selected = v.id === current.id
            return (
              <button key={v.id} onClick={() => navigate(`/v/${v.id}/today`)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: selected ? 'var(--color-primary-light)' : 'none', border: 'none', borderTop: i > 0 ? '1px solid var(--color-border)' : 'none', textAlign: 'left', cursor: 'pointer' }}>
                <span style={{ fontSize: 22 }}>🏟</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)' }}>{v.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--color-muted)' }}>
                    {v.area.split(',')[0]} · {v.pitches.filter(p => p.active).length} pitches
                  </div>
                </div>
                {v.status === 'pending' && <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-pending)', background: 'var(--color-pending-bg)', padding: '3px 8px', borderRadius: 20 }}>Pending approval</span>}
                {selected && <span style={{ color: 'var(--color-primary)', fontSize: 18, fontWeight: 700 }}>✓</span>}
              </button>
            )
          })}
        </div>
        {role === 'owner' && (
          <button onClick={() => navigate(`/v/${current.id}/settings/new-venue`)}
            style={{ width: '100%', padding: '13px', borderRadius: 12, border: '1px dashed var(--color-primary)', background: 'transparent', color: 'var(--color-primary)', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
            + List a new venue
          </button>
        )}
      </div>
    </BottomSheet>
  )
}
