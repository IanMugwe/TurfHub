import { useState } from 'react'
import ExploreScreen from './ExploreScreen'
import MyBookingsScreen from './MyBookingsScreen'
import ProfileScreen from './ProfileScreen'
import VenuePage from './VenuePage'
import ReviewBooking from './ReviewBooking'
import ConfirmationScreen from './ConfirmationScreen'
import type { SlotSelection } from './types'

export type CTab = 'explore' | 'bookings' | 'profile'

export type CustomerScreen =
  | { name: 'explore' }
  | { name: 'venue'; venueId: string }
  | { name: 'review'; slot: SlotSelection }
  | { name: 'confirmation'; slot: SlotSelection; status: 'confirmed' | 'pending' }
  | { name: 'bookings' }
  | { name: 'profile' }

export default function CustomerApp({ user, onSignOut }: { user: { name: string; phone: string }; onSignOut: () => void }) {
  const [screen, setScreen] = useState<CustomerScreen>({ name: 'explore' })
  const [tab, setTab] = useState<CTab>('explore')

  function navigate(s: CustomerScreen) {
    setScreen(s)
    if (s.name === 'explore') setTab('explore')
    if (s.name === 'bookings') setTab('bookings')
    if (s.name === 'profile') setTab('profile')
  }

  const showTabs = screen.name === 'explore' || screen.name === 'bookings' || screen.name === 'profile'

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: showTabs ? 80 : 0 }}>
        {screen.name === 'explore' && (
          <ExploreScreen onVenueTap={() => navigate({ name: 'venue', venueId: '1' })} />
        )}
        {screen.name === 'venue' && (
          <VenuePage
            onBack={() => navigate({ name: 'explore' })}
            onBook={(slot) => navigate({ name: 'review', slot })}
          />
        )}
        {screen.name === 'review' && (
          <ReviewBooking
            slot={(screen as any).slot}
            onBack={() => navigate({ name: 'venue', venueId: '1' })}
            onConfirm={(status) => navigate({ name: 'confirmation', slot: (screen as any).slot, status })}
          />
        )}
        {screen.name === 'confirmation' && (
          <ConfirmationScreen
            slot={(screen as any).slot}
            status={(screen as any).status}
            onDone={() => navigate({ name: 'explore' })}
            onMyBookings={() => navigate({ name: 'bookings' })}
          />
        )}
        {screen.name === 'bookings' && (
          <MyBookingsScreen onBack={() => navigate({ name: 'explore' })} />
        )}
        {screen.name === 'profile' && (
          <ProfileScreen name={user.name} phone={user.phone} onSignOut={onSignOut} />
        )}
      </div>

      {/* Bottom tabs */}
      {showTabs && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', display: 'flex', zIndex: 100 }}>
          {([
            { id: 'explore', label: 'Explore', icon: SearchIcon },
            { id: 'bookings', label: 'My Bookings', icon: BookIcon },
            { id: 'profile', label: 'Profile', icon: PersonIcon },
          ] as { id: CTab; label: string; icon: any }[]).map(({ id, label, icon: Icon }) => {
            const active = tab === id
            return (
              <button key={id} onClick={() => { setTab(id); navigate({ name: id as any }) }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '10px 4px', border: 'none', background: 'none', cursor: 'pointer', minHeight: 56 }}>
                <Icon size={22} color={active ? 'var(--color-primary)' : 'var(--color-muted-light)'} />
                <span style={{ fontSize: 11, fontWeight: active ? 600 : 400, color: active ? 'var(--color-primary)' : 'var(--color-muted-light)', lineHeight: 1 }}>{label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function SearchIcon({ size = 22, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke={color} strokeWidth="1.8" /><path d="M16.5 16.5L21 21" stroke={color} strokeWidth="1.8" strokeLinecap="round" /></svg>
}
function BookIcon({ size = 22, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect x="4" y="2" width="16" height="20" rx="2" stroke={color} strokeWidth="1.8" /><line x1="8" y1="7" x2="16" y2="7" stroke={color} strokeWidth="1.5" strokeLinecap="round" /><line x1="8" y1="11" x2="16" y2="11" stroke={color} strokeWidth="1.5" strokeLinecap="round" /><line x1="8" y1="15" x2="12" y2="15" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></svg>
}
function PersonIcon({ size = 22, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="7" r="4" stroke={color} strokeWidth="1.8" /><path d="M4 21c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke={color} strokeWidth="1.8" strokeLinecap="round" /></svg>
}
