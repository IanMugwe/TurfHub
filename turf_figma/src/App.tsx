import { useState } from 'react'
import TodayScreen from './screens/TodayScreen'
import CalendarScreen from './screens/CalendarScreen'
import CustomersScreen from './screens/CustomersScreen'
import ReportsScreen from './screens/ReportsScreen'
import MoreScreen from './screens/MoreScreen'
import CustomerApp from './customer/CustomerApp'
import NewBookingSheet from './components/NewBookingSheet'
import BookingDetailSheet from './components/BookingDetailSheet'
import SignInScreen from './screens/SignInScreen'
import BookingRequestsScreen, { type RequestDecision } from './screens/BookingRequestsScreen'
import CustomerDetailScreen from './screens/CustomerDetailScreen'
import { initials } from './data'
import type { Booking, Customer, Session } from './types'

export type Tab = 'today' | 'calendar' | 'customers' | 'reports' | 'more'

type Overlay = { name: 'requests' } | { name: 'customer'; customer: Customer }

export default function App() {
  const [tab, setTab] = useState<Tab>('today')
  const [showNewBooking, setShowNewBooking] = useState(false)
  const [newBookingFor, setNewBookingFor] = useState<{ name: string; phone: string } | undefined>()
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [overlay, setOverlay] = useState<Overlay | null>(null)
  const [decisions, setDecisions] = useState<Record<string, RequestDecision>>({})
  const [flagged, setFlagged] = useState<string[]>(['Aisha Hassan'])

  const toggleTheme = () => setTheme(t => (t === 'light' ? 'dark' : 'light'))
  const decide = (id: string, d: RequestDecision) => setDecisions(ds => ({ ...ds, [id]: d }))

  function openNewBooking(customer?: { name: string; phone: string }) {
    setNewBookingFor(customer)
    setShowNewBooking(true)
  }

  function signOut() {
    setSession(null)
    setTab('today')
    setOverlay(null)
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', minHeight: '100vh', background: '#d1d5db' }}>
      <div data-theme={theme} style={{ width: 390, minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text)', position: 'relative', display: 'flex', flexDirection: 'column', boxShadow: '0 0 40px rgba(0,0,0,0.18)', overflow: 'hidden' }}>

        {/* Light/dark toggle */}
        <button onClick={toggleTheme} aria-label="Toggle dark mode"
          style={{ position: 'absolute', top: 10, right: 12, zIndex: 300, width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.18)', backdropFilter: 'blur(8px)', cursor: 'pointer', fontSize: 14, lineHeight: 1 }}>
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        {/* Signed-in role decides which app is shown */}
        {!session ? (
          <SignInScreen onSignedIn={setSession} />
        ) : session.role === 'customer' ? (
          <CustomerApp user={session} onSignOut={signOut} />
        ) : (
          <>
            <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 80 }}>
              {overlay?.name === 'requests' ? (
                <BookingRequestsScreen decisions={decisions} onDecide={decide} onBack={() => setOverlay(null)} onBookingTap={b => setDetailBooking(b)} />
              ) : overlay?.name === 'customer' ? (
                <CustomerDetailScreen
                  customer={overlay.customer}
                  flagged={flagged.includes(overlay.customer.name)}
                  onToggleFlag={() => {
                    const name = overlay.customer.name
                    setFlagged(f => (f.includes(name) ? f.filter(n => n !== name) : [...f, name]))
                  }}
                  onBack={() => setOverlay(null)}
                  onBookingTap={b => setDetailBooking(b)}
                  onNewBooking={() => openNewBooking(overlay.customer)}
                />
              ) : <>
                {tab === 'today' && <TodayScreen userInitials={initials(session.name)} onBookingTap={b => setDetailBooking(b)} decisions={decisions} onDecide={decide} onSeeRequests={() => setOverlay({ name: 'requests' })} />}
                {tab === 'calendar' && <CalendarScreen onNewBooking={() => openNewBooking()} onBookingTap={b => setDetailBooking(b)} />}
                {tab === 'customers' && <CustomersScreen flagged={flagged} onCustomerTap={c => setOverlay({ name: 'customer', customer: c })} onNewBooking={() => openNewBooking()} />}
                {tab === 'reports' && session.staffRole === 'owner' && <ReportsScreen />}
                {tab === 'more' && <MoreScreen user={session} theme={theme} onToggleTheme={toggleTheme} onSignOut={signOut} />}
              </>}
            </div>

            {/* Bottom tab bar */}
            {!overlay && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', display: 'flex', zIndex: 100 }}>
              {([
                { id: 'today', label: 'Today', icon: HomeIcon },
                { id: 'calendar', label: 'Calendar', icon: CalIcon },
                { id: 'customers', label: 'Customers', icon: PeopleIcon },
                { id: 'reports', label: 'Reports', icon: ChartIcon },
                { id: 'more', label: 'More', icon: MoreIcon },
              ] as { id: Tab; label: string; icon: any }[])
                // Managers don't see Reports (owners only)
                .filter(t => t.id !== 'reports' || session.staffRole === 'owner')
                .map(({ id, label, icon: Icon }) => {
                const active = tab === id
                return (
                  <button key={id} onClick={() => { setTab(id); setOverlay(null) }}
                    style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '10px 4px', border: 'none', background: 'none', cursor: 'pointer', minHeight: 56 }}>
                    <Icon size={22} color={active ? 'var(--color-primary)' : 'var(--color-muted-light)'} />
                    <span style={{ fontSize: 11, fontWeight: active ? 600 : 400, color: active ? 'var(--color-primary)' : 'var(--color-muted-light)', lineHeight: 1 }}>{label}</span>
                  </button>
                )
              })}
            </div>}

            {/* FAB */}
            {!overlay && <button onClick={() => openNewBooking()}
              style={{ position: 'absolute', bottom: 70, right: 16, width: 52, height: 52, borderRadius: '50%', background: 'var(--color-primary)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(15,122,61,0.4)', zIndex: 99 }}>
              <span style={{ color: '#fff', fontSize: 26, lineHeight: 1, marginTop: -1 }}>+</span>
            </button>}

            {showNewBooking && <NewBookingSheet key={newBookingFor?.name ?? 'new'} initialCustomer={newBookingFor} onClose={() => setShowNewBooking(false)} />}
            {detailBooking && <BookingDetailSheet booking={detailBooking} onClose={() => setDetailBooking(null)} />}
          </>
        )}
      </div>
    </div>
  )
}

function HomeIcon({ size = 22, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" /><path d="M9 21V12h6v9" stroke={color} strokeWidth="1.8" strokeLinejoin="round" /></svg>
}
function CalIcon({ size = 22, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="17" rx="2" stroke={color} strokeWidth="1.8" /><line x1="3" y1="9" x2="21" y2="9" stroke={color} strokeWidth="1.8" /><line x1="8" y1="2" x2="8" y2="6" stroke={color} strokeWidth="1.8" strokeLinecap="round" /><line x1="16" y1="2" x2="16" y2="6" stroke={color} strokeWidth="1.8" strokeLinecap="round" /><rect x="7" y="13" width="3" height="3" rx="0.5" fill={color} /></svg>
}
function PeopleIcon({ size = 22, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="9" cy="7" r="4" stroke={color} strokeWidth="1.8" /><path d="M2 21c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke={color} strokeWidth="1.8" strokeLinecap="round" /><path d="M16 3.5a4 4 0 010 7" stroke={color} strokeWidth="1.8" strokeLinecap="round" /><path d="M22 21c0-3.866-2.686-7-6-7" stroke={color} strokeWidth="1.8" strokeLinecap="round" /></svg>
}
function ChartIcon({ size = 22, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect x="3" y="13" width="4" height="8" rx="1" fill={color} /><rect x="10" y="8" width="4" height="13" rx="1" fill={color} /><rect x="17" y="4" width="4" height="17" rx="1" fill={color} /></svg>
}
function MoreIcon({ size = 22, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.5" fill={color} /><circle cx="12" cy="12" r="1.5" fill={color} /><circle cx="12" cy="19" r="1.5" fill={color} /></svg>
}
