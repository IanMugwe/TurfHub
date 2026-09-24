const bookings = [
  { id: 'B-1041', team: 'FC Northgate', field: 'Field A', time: '07:00–08:00', status: 'confirmed', amount: '€ 120' },
  { id: 'B-1042', team: 'Redwood United', field: 'Field B', time: '08:00–09:00', status: 'confirmed', amount: '€ 120' },
  { id: 'B-1043', team: 'Ajax Juniors', field: 'Field C', time: '09:00–10:30', status: 'pending', amount: '€ 180' },
  { id: 'B-1044', team: 'Sunday League XI', field: 'Field A', time: '10:00–12:00', status: 'confirmed', amount: '€ 240' },
  { id: 'B-1045', team: 'Eagle SC', field: 'Field D', time: '11:00–12:00', status: 'cancelled', amount: '€ 120' },
  { id: 'B-1046', team: 'Westside FC', field: 'Field B', time: '14:00–15:30', status: 'pending', amount: '€ 180' },
]

const statusColor: Record<string, string> = {
  confirmed: 'var(--color-lime)',
  pending: 'var(--color-amber)',
  cancelled: 'var(--color-red)',
}

export default function RecentBookings() {
  return (
    <div style={{ background: 'var(--color-panel)', border: '1px solid var(--color-border)', borderRadius: 10 }}>
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--color-text)', letterSpacing: '0.04em' }}>TODAY'S BOOKINGS</div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-muted)' }}>14 TOTAL</span>
      </div>
      <div>
        {bookings.map((b, i) => (
          <div key={b.id} className="flex items-center justify-between px-5 py-3" style={{ borderBottom: i < bookings.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
            <div className="flex items-center gap-4">
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-muted)', width: 52, flexShrink: 0 }}>{b.id}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>{b.team}</div>
                <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>{b.field} · {b.time}</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-dim)' }}>{b.amount}</span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em',
                padding: '3px 8px', borderRadius: 4,
                background: statusColor[b.status] + '1a',
                color: statusColor[b.status],
                border: `1px solid ${statusColor[b.status]}33`,
                textTransform: 'uppercase'
              }}>{b.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
