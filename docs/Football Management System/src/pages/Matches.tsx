import { useState } from 'react'

type Tab = 'results' | 'upcoming'

const results = [
  { home: 'FC Northgate', homeScore: 3, away: 'Westside FC', awayScore: 1, date: '21 Sep', field: 'A', league: 'Prem Div', motm: 'Luca Ferrari' },
  { home: 'Redwood United', homeScore: 2, away: 'Ajax Juniors', awayScore: 2, date: '21 Sep', field: 'B', league: 'U-19 Cup', motm: 'Piet van Dijk' },
  { home: 'Eagle SC', homeScore: 0, away: 'Harbor City', awayScore: 4, date: '20 Sep', field: 'C', league: 'Div 2', motm: 'Tom Reeves' },
  { home: 'Sunday XI', homeScore: 1, away: 'Rover Athletic', awayScore: 3, date: '20 Sep', field: 'D', league: 'Prem Div', motm: 'Emma Schulz' },
  { home: 'Westside FC', homeScore: 5, away: 'Eagle SC', awayScore: 0, date: '19 Sep', field: 'A', league: 'Cup QF', motm: 'Nadia Ahmed' },
]

const upcoming = [
  { home: 'FC Northgate', away: 'Redwood United', date: '22 Sep', time: '18:00', field: 'A', league: 'Prem Div' },
  { home: 'Ajax Juniors', away: 'Eagle SC', date: '22 Sep', time: '19:30', field: 'B', league: 'U-19 Cup' },
  { home: 'Westside FC', away: 'Sunday XI', date: '22 Sep', time: '20:00', field: 'C', league: 'Prem Div' },
  { home: 'Harbor City', away: 'Rover Athletic', date: '22 Sep', time: '21:30', field: 'A', league: 'Div 2' },
  { home: 'Redwood United', away: 'Westside FC', date: '25 Sep', time: '18:00', field: 'B', league: 'Prem Div' },
  { home: 'FC Northgate', away: 'Ajax Juniors', date: '25 Sep', time: '20:00', field: 'A', league: 'U-19 Cup' },
]

export default function Matches() {
  const [tab, setTab] = useState<Tab>('results')

  return (
    <div className="p-8">
      <div className="mb-8">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-lime)', letterSpacing: '0.12em', marginBottom: 4 }}>COMPETITION TRACKER</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 38, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '0.02em', lineHeight: 1 }}>MATCHES</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 12 }}>
        {(['results', 'upcoming'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{
              fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, letterSpacing: '0.06em',
              padding: '6px 20px', borderRadius: 6, cursor: 'pointer', textTransform: 'uppercase',
              background: tab === t ? 'var(--color-lime)' : 'transparent',
              color: tab === t ? 'var(--color-navy)' : 'var(--color-muted)',
              border: tab === t ? 'none' : '1px solid transparent',
            }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'results' && (
        <div className="flex flex-col gap-3">
          {results.map((m, i) => (
            <div key={i} style={{ background: 'var(--color-panel)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-muted)', width: 50, flexShrink: 0 }}>{m.date}</div>
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 16 }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: m.homeScore > m.awayScore ? 'var(--color-text)' : 'var(--color-muted)', letterSpacing: '0.04em' }}>{m.home}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '0.04em', lineHeight: 1 }}>
                    <span style={{ color: m.homeScore > m.awayScore ? 'var(--color-lime)' : 'var(--color-text)' }}>{m.homeScore}</span>
                    <span style={{ color: 'var(--color-muted)', margin: '0 6px' }}>:</span>
                    <span style={{ color: m.awayScore > m.homeScore ? 'var(--color-lime)' : 'var(--color-text)' }}>{m.awayScore}</span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-muted)', letterSpacing: '0.08em', marginTop: 3 }}>FT</div>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: m.awayScore > m.homeScore ? 'var(--color-text)' : 'var(--color-muted)', letterSpacing: '0.04em' }}>{m.away}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{m.league} · F{m.field}</div>
                <div style={{ fontSize: 12, color: 'var(--color-lime)', marginTop: 3 }}>⭐ {m.motm}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'upcoming' && (
        <div className="flex flex-col gap-3">
          {upcoming.map((m, i) => (
            <div key={i} style={{ background: 'var(--color-panel)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '16px 22px', display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ flexShrink: 0, textAlign: 'center', width: 64 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--color-lime)' }}>{m.time}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-muted)' }}>{m.date}</div>
              </div>
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 12 }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--color-text)', letterSpacing: '0.04em' }}>{m.home}</div>
                </div>
                <div style={{ textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: 'var(--color-muted)' }}>VS</div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--color-text)', letterSpacing: '0.04em' }}>{m.away}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{m.league}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-sky)', marginTop: 2 }}>Field {m.field}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
