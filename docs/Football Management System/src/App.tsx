import { useState } from 'react'
import Dashboard from './pages/Dashboard'
import Bookings from './pages/Bookings'
import Teams from './pages/Teams'
import Matches from './pages/Matches'
import Fields from './pages/Fields'

type Page = 'dashboard' | 'bookings' | 'teams' | 'matches' | 'fields'

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: GridIcon },
  { id: 'fields', label: 'Fields', icon: FieldIcon },
  { id: 'bookings', label: 'Bookings', icon: CalIcon },
  { id: 'matches', label: 'Matches', icon: BallIcon },
  { id: 'teams', label: 'Teams', icon: TeamIcon },
] as const

export default function App() {
  const [page, setPage] = useState<Page>('dashboard')

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--color-pitch)', fontFamily: 'var(--font-body)' }}>
      {/* Sidebar */}
      <aside style={{ width: 220, background: 'var(--color-navy)', borderRight: '1px solid var(--color-border)', flexShrink: 0 }}
        className="flex flex-col">
        {/* Logo */}
        <div className="flex items-center gap-2 px-5 py-6">
          <div style={{ width: 32, height: 32, background: 'var(--color-lime)', borderRadius: 6 }}
            className="flex items-center justify-center">
            <BallIcon size={18} color="var(--color-navy)" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, letterSpacing: '0.04em', color: 'var(--color-text)' }}>
            TURFPRO
          </span>
        </div>

        {/* Season badge */}
        <div className="px-4 mb-5">
          <div style={{ background: 'var(--color-turf)', border: '1px solid var(--color-grass)', borderRadius: 6, padding: '6px 10px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-lime)', letterSpacing: '0.1em' }}>SEASON 2025/26</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-dim)', marginTop: 2 }}>Matchweek 8 / 34</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 px-3 flex-1">
          {NAV.map(({ id, label, icon: Icon }) => {
            const active = page === id
            return (
              <button key={id} onClick={() => setPage(id as Page)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-left w-full"
                style={{
                  background: active ? 'var(--color-turf)' : 'transparent',
                  border: active ? '1px solid var(--color-grass)' : '1px solid transparent',
                  color: active ? 'var(--color-lime)' : 'var(--color-text-dim)',
                  fontFamily: 'var(--font-display)',
                  fontSize: 15,
                  fontWeight: active ? 700 : 500,
                  letterSpacing: '0.05em',
                  cursor: 'pointer',
                }}>
                <Icon size={16} color={active ? 'var(--color-lime)' : 'var(--color-muted)'} />
                {label.toUpperCase()}
              </button>
            )
          })}
        </nav>

        {/* User */}
        <div style={{ borderTop: '1px solid var(--color-border)', padding: '16px' }} className="flex items-center gap-3">
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--color-grass)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--color-text)', flexShrink: 0 }}>MK</div>
          <div className="min-w-0">
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Marco Kalani</div>
            <div style={{ fontSize: 11, color: 'var(--color-muted)' }}>Field Manager</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto" style={{ scrollbarWidth: 'thin' }}>
        {page === 'dashboard' && <Dashboard />}
        {page === 'fields' && <Fields />}
        {page === 'bookings' && <Bookings />}
        {page === 'matches' && <Matches />}
        {page === 'teams' && <Teams />}
      </main>
    </div>
  )
}

// Icons
function GridIcon({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <rect x="2" y="2" width="7" height="7" rx="1.5" fill={color} />
    <rect x="11" y="2" width="7" height="7" rx="1.5" fill={color} />
    <rect x="2" y="11" width="7" height="7" rx="1.5" fill={color} />
    <rect x="11" y="11" width="7" height="7" rx="1.5" fill={color} />
  </svg>
}

function FieldIcon({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <rect x="2" y="4" width="16" height="12" rx="2" stroke={color} strokeWidth="1.5" />
    <line x1="10" y1="4" x2="10" y2="16" stroke={color} strokeWidth="1" strokeDasharray="2 1" />
    <circle cx="10" cy="10" r="2.5" stroke={color} strokeWidth="1" />
  </svg>
}

function CalIcon({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <rect x="3" y="4" width="14" height="13" rx="2" stroke={color} strokeWidth="1.5" />
    <line x1="3" y1="8" x2="17" y2="8" stroke={color} strokeWidth="1.5" />
    <line x1="7" y1="2" x2="7" y2="5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <line x1="13" y1="2" x2="13" y2="5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <rect x="6" y="11" width="3" height="3" rx="0.5" fill={color} />
  </svg>
}

function BallIcon({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="7.5" stroke={color} strokeWidth="1.5" />
    <path d="M10 2.5 L10 6 M10 14 L10 17.5 M2.5 10 L6 10 M14 10 L17.5 10" stroke={color} strokeWidth="1.2" />
    <polygon points="10,6 13,8.5 12,12 8,12 7,8.5" stroke={color} strokeWidth="1" fill="none" />
  </svg>
}

function TeamIcon({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="6" r="3" stroke={color} strokeWidth="1.5" />
    <path d="M4 17c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="16" cy="5" r="2" stroke={color} strokeWidth="1.2" />
    <path d="M17 13c1.657 0 3 1.343 3 3" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    <circle cx="4" cy="5" r="2" stroke={color} strokeWidth="1.2" />
    <path d="M3 13c-1.657 0-3 1.343-3 3" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
  </svg>
}
