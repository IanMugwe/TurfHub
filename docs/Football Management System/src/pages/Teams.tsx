import { useState } from 'react'

const teams = [
  {
    name: 'FC Northgate', division: 'Premier Division', founded: 2011, players: 22, captain: 'Luca Ferrari',
    record: { w: 6, d: 1, l: 1 }, goalsFor: 18, goalsAgainst: 7, color: '#e84040',
    players_list: [
      { name: 'Luca Ferrari', pos: 'FW', age: 27, goals: 8, assists: 3 },
      { name: 'Bruno Carvalho', pos: 'MF', age: 24, goals: 4, assists: 6 },
      { name: 'Dimitri Kostas', pos: 'DF', age: 29, goals: 1, assists: 1 },
      { name: 'Kwame Asante', pos: 'GK', age: 31, goals: 0, assists: 0 },
    ]
  },
  {
    name: 'Redwood United', division: 'Premier Division', founded: 2008, players: 20, captain: 'Sarah Okonkwo',
    record: { w: 5, d: 2, l: 1 }, goalsFor: 15, goalsAgainst: 9, color: '#8b4513',
    players_list: [
      { name: 'Sarah Okonkwo', pos: 'FW', age: 25, goals: 7, assists: 2 },
      { name: 'Yuki Tanaka', pos: 'MF', age: 22, goals: 3, assists: 5 },
      { name: 'Marco Rossi', pos: 'DF', age: 28, goals: 0, assists: 2 },
      { name: 'Anders Berg', pos: 'GK', age: 33, goals: 0, assists: 0 },
    ]
  },
  {
    name: 'Ajax Juniors', division: 'U-19 Cup', founded: 2019, players: 18, captain: 'Piet van Dijk',
    record: { w: 4, d: 2, l: 2 }, goalsFor: 14, goalsAgainst: 12, color: '#3ab4f2',
    players_list: [
      { name: 'Piet van Dijk', pos: 'MF', age: 18, goals: 5, assists: 4 },
      { name: 'Kofi Mensah', pos: 'FW', age: 17, goals: 6, assists: 1 },
    ]
  },
  {
    name: 'Westside FC', division: 'Premier Division', founded: 2014, players: 21, captain: 'Nadia Ahmed',
    record: { w: 5, d: 0, l: 3 }, goalsFor: 12, goalsAgainst: 11, color: '#f5a623',
    players_list: [
      { name: 'Nadia Ahmed', pos: 'DF', age: 26, goals: 2, assists: 3 },
      { name: 'Tomás García', pos: 'FW', age: 24, goals: 5, assists: 2 },
    ]
  },
]

const posColor: Record<string, string> = {
  FW: 'var(--color-red)', MF: 'var(--color-amber)', DF: 'var(--color-sky)', GK: 'var(--color-lime)'
}

export default function Teams() {
  const [selected, setSelected] = useState<number | null>(null)

  return (
    <div className="p-8">
      <div className="mb-8">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-lime)', letterSpacing: '0.12em', marginBottom: 4 }}>CLUB REGISTRY</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 38, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '0.02em', lineHeight: 1 }}>TEAMS</h1>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: selected !== null ? '1fr 1fr' : '1fr' }}>
        <div className="flex flex-col gap-3">
          {teams.map((t, i) => (
            <div key={t.name} onClick={() => setSelected(selected === i ? null : i)}
              style={{
                background: 'var(--color-panel)',
                border: `1px solid ${selected === i ? t.color : 'var(--color-border)'}`,
                borderRadius: 10, padding: '18px 20px', cursor: 'pointer',
                transition: 'border-color 0.15s',
              }}>
              <div className="flex items-center gap-4">
                {/* Club crest placeholder */}
                <div style={{ width: 44, height: 44, borderRadius: 8, background: t.color + '22', border: `1px solid ${t.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: t.color }}>
                    {t.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div className="flex-1">
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--color-text)', letterSpacing: '0.03em' }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>{t.division} · Est. {t.founded} · {t.players} players</div>
                </div>
                <div className="flex gap-5 text-right">
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--color-lime)' }}>{t.record.w}W {t.record.d}D {t.record.l}L</div>
                    <div style={{ fontSize: 11, color: 'var(--color-muted)' }}>{t.goalsFor} gf · {t.goalsAgainst} ga</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selected !== null && (
          <div style={{ background: 'var(--color-panel)', border: `1px solid ${teams[selected].color}`, borderRadius: 10, padding: '20px', position: 'sticky', top: 20, height: 'fit-content' }}>
            <div className="flex items-center gap-3 mb-5">
              <div style={{ width: 40, height: 40, borderRadius: 8, background: teams[selected].color + '22', border: `1px solid ${teams[selected].color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: teams[selected].color }}>
                  {teams[selected].name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </span>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--color-text)' }}>{teams[selected].name}</div>
                <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>Captain: {teams[selected].captain}</div>
              </div>
            </div>

            <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--color-muted)', letterSpacing: '0.08em', marginBottom: 10 }}>SQUAD</div>
            <div className="flex flex-col gap-2">
              {teams[selected].players_list.map(p => (
                <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'var(--color-pitch-mid)', borderRadius: 6, border: '1px solid var(--color-border)' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em',
                    padding: '2px 6px', borderRadius: 3,
                    background: posColor[p.pos] + '1a', color: posColor[p.pos],
                    border: `1px solid ${posColor[p.pos]}33`, flexShrink: 0
                  }}>{p.pos}</span>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--color-text)' }}>{p.name}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-muted)' }}>Age {p.age}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-lime)' }}>{p.goals}G {p.assists}A</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
