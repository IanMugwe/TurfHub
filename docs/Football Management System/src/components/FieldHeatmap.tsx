const hours = ['7am', '8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm']
const fields = ['Field A', 'Field B', 'Field C', 'Field D', 'Field E']

// 0=free, 1=booked, 2=maintenance
const schedule: number[][] = [
  [1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1, 1],
  [1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1],
  [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
]

export default function FieldHeatmap() {
  return (
    <div style={{ background: 'var(--color-panel)', border: '1px solid var(--color-border)', borderRadius: 10, padding: 18 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--color-text)', letterSpacing: '0.04em', marginBottom: 14 }}>FIELD AVAILABILITY</div>

      <div style={{ overflowX: 'auto' }}>
        {/* Hour labels */}
        <div style={{ display: 'grid', gridTemplateColumns: `60px repeat(${hours.length}, 1fr)`, gap: 2, marginBottom: 2 }}>
          <div />
          {hours.map(h => (
            <div key={h} style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-muted)', textAlign: 'center' }}>{h}</div>
          ))}
        </div>

        {/* Rows */}
        {fields.map((field, fi) => (
          <div key={field} style={{ display: 'grid', gridTemplateColumns: `60px repeat(${hours.length}, 1fr)`, gap: 2, marginBottom: 2 }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-dim)', display: 'flex', alignItems: 'center', fontWeight: 500 }}>{field}</div>
            {schedule[fi].map((status, hi) => (
              <div key={hi} style={{
                height: 22, borderRadius: 3,
                background: status === 2 ? '#2a1e1e' : status === 1 ? 'var(--color-grass)' : 'var(--color-turf)',
                border: `1px solid ${status === 2 ? 'var(--color-red)33' : status === 1 ? 'var(--color-lime)33' : 'var(--color-border)'}`,
                opacity: status === 2 ? 0.5 : 1,
              }} title={status === 2 ? 'Maintenance' : status === 1 ? 'Booked' : 'Available'} />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-3">
        {[['var(--color-grass)', 'Booked'], ['var(--color-turf)', 'Available'], ['#2a1e1e', 'Maintenance']].map(([color, label]) => (
          <div key={label} className="flex items-center gap-1.5">
            <div style={{ width: 10, height: 10, borderRadius: 2, background: color as string, border: `1px solid ${(color as string).includes('turf') ? 'var(--color-border)' : 'transparent'}` }} />
            <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
