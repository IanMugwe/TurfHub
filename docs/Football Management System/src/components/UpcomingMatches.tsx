const matches = [
  { time: '18:00', home: 'FC Northgate', away: 'Redwood United', field: 'A', league: 'Prem Div' },
  { time: '19:30', home: 'Ajax Juniors', away: 'Eagle SC', field: 'B', league: 'U-19 Cup' },
  { time: '20:00', home: 'Westside FC', away: 'Sunday XI', field: 'C', league: 'Prem Div' },
  { time: '21:30', home: 'Harbor City', away: 'Rover Athletic', field: 'A', league: 'Div 2' },
]

export default function UpcomingMatches() {
  return (
    <div style={{ background: 'var(--color-panel)', border: '1px solid var(--color-border)', borderRadius: 10 }}>
      <div style={{ borderBottom: '1px solid var(--color-border)', padding: '14px 18px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--color-text)', letterSpacing: '0.04em' }}>TONIGHT'S MATCHES</div>
      </div>
      {matches.map((m, i) => (
        <div key={i} style={{ padding: '12px 18px', borderBottom: i < matches.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
          <div className="flex items-center justify-between mb-1">
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500, color: 'var(--color-lime)' }}>{m.time}</span>
            <div className="flex items-center gap-2">
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.08em', color: 'var(--color-muted)', background: 'var(--color-pitch-mid)', padding: '2px 6px', borderRadius: 3, border: '1px solid var(--color-border)', textTransform: 'uppercase' }}>{m.league}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-sky)' }}>F{m.field}</span>
            </div>
          </div>
          <div style={{ fontSize: 13, color: 'var(--color-text)', fontWeight: 500 }}>{m.home}</div>
          <div style={{ fontSize: 11, color: 'var(--color-muted)' }}>vs {m.away}</div>
        </div>
      ))}
    </div>
  )
}
