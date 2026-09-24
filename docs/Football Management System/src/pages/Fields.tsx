import { useState } from 'react'

const fields = [
  { id: 'A', name: 'Field Alpha', size: '11v11', surface: 'Natural Grass', lights: true, status: 'open', bookings: 8, revenue: '€ 960', lastMaint: '12 Sep' },
  { id: 'B', name: 'Field Beta', size: '11v11', surface: 'Artificial Turf', lights: true, status: 'open', bookings: 6, revenue: '€ 720', lastMaint: '8 Sep' },
  { id: 'C', name: 'Field Gamma', size: '7v7', surface: 'Artificial Turf', lights: false, status: 'open', bookings: 5, revenue: '€ 450', lastMaint: '15 Sep' },
  { id: 'D', name: 'Field Delta', size: '5v5', surface: 'Artificial Turf', lights: true, status: 'open', bookings: 9, revenue: '€ 630', lastMaint: '10 Sep' },
  { id: 'E', name: 'Field Echo', size: '11v11', surface: 'Natural Grass', lights: false, status: 'maintenance', bookings: 0, revenue: '€ 0', lastMaint: '20 Sep (ongoing)' },
]

export default function Fields() {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <div className="p-8">
      <div className="mb-8">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-lime)', letterSpacing: '0.12em', marginBottom: 4 }}>FACILITY MANAGEMENT</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 38, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '0.02em', lineHeight: 1 }}>FIELDS</h1>
      </div>

      <div className="grid gap-4">
        {fields.map(f => (
          <div key={f.id} onClick={() => setSelected(selected === f.id ? null : f.id)}
            style={{
              background: 'var(--color-panel)',
              border: `1px solid ${selected === f.id ? 'var(--color-lime)' : 'var(--color-border)'}`,
              borderRadius: 10, cursor: 'pointer', overflow: 'hidden',
              transition: 'border-color 0.15s',
            }}>
            <div className="flex items-center gap-6 p-5">
              {/* Field graphic */}
              <div style={{ width: 72, height: 50, background: f.status === 'maintenance' ? '#1a1010' : 'var(--color-turf)', borderRadius: 6, border: '1px solid var(--color-grass)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ width: '70%', height: '80%', border: '1px solid rgba(93,206,111,0.4)', borderRadius: 2, position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 18, height: 18, border: '1px solid rgba(93,206,111,0.4)', borderRadius: '50%' }} />
                </div>
                {f.status === 'maintenance' && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(230,64,64,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: 'var(--color-red)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>MAINT</div>
                )}
              </div>

              <div className="flex-1 grid" style={{ gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 16 }}>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--color-text)', letterSpacing: '0.04em' }}>{f.name}</span>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em',
                      padding: '2px 7px', borderRadius: 3, textTransform: 'uppercase',
                      background: f.status === 'open' ? 'rgba(91,206,111,0.12)' : 'rgba(232,64,64,0.12)',
                      color: f.status === 'open' ? 'var(--color-lime)' : 'var(--color-red)',
                      border: `1px solid ${f.status === 'open' ? 'rgba(91,206,111,0.3)' : 'rgba(232,64,64,0.3)'}`,
                    }}>{f.status}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>{f.size} · {f.surface}</span>
                    <span style={{ fontSize: 12, color: 'var(--color-text-dim)' }}>{f.lights ? '💡 Floodlights' : 'No lights'}</span>
                    <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>Maint: {f.lastMaint}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-5 text-right">
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--color-text)' }}>{f.bookings}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-muted)' }}>bookings today</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--color-lime)' }}>{f.revenue}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-muted)' }}>today's rev</div>
                  </div>
                </div>
              </div>
            </div>

            {selected === f.id && (
              <div style={{ borderTop: '1px solid var(--color-border)', padding: '14px 20px', background: 'var(--color-pitch-mid)', display: 'flex', gap: 10 }}>
                <button style={{ background: 'var(--color-lime)', color: 'var(--color-navy)', border: 'none', borderRadius: 6, padding: '7px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Book Now</button>
                <button style={{ background: 'transparent', color: 'var(--color-text-dim)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '7px 16px', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>View Schedule</button>
                <button style={{ background: 'transparent', color: 'var(--color-red)', border: '1px solid rgba(232,64,64,0.3)', borderRadius: 6, padding: '7px 16px', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Mark Maintenance</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
