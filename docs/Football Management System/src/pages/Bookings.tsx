import { useState } from 'react'

type Filter = 'all' | 'confirmed' | 'pending' | 'cancelled'

const allBookings = [
  { id: 'B-1041', team: 'FC Northgate', contact: 'Luca Ferrari', field: 'Field A', date: '22 Sep', time: '07:00–08:00', duration: '1h', status: 'confirmed', amount: 120 },
  { id: 'B-1042', team: 'Redwood United', contact: 'Sarah Okonkwo', field: 'Field B', date: '22 Sep', time: '08:00–09:00', duration: '1h', status: 'confirmed', amount: 120 },
  { id: 'B-1043', team: 'Ajax Juniors', contact: 'Piet van Dijk', field: 'Field C', date: '22 Sep', time: '09:00–10:30', duration: '1.5h', status: 'pending', amount: 180 },
  { id: 'B-1044', team: 'Sunday League XI', contact: 'James McCabe', field: 'Field A', date: '22 Sep', time: '10:00–12:00', duration: '2h', status: 'confirmed', amount: 240 },
  { id: 'B-1045', team: 'Eagle SC', contact: 'Mia Torres', field: 'Field D', date: '22 Sep', time: '11:00–12:00', duration: '1h', status: 'cancelled', amount: 120 },
  { id: 'B-1046', team: 'Westside FC', contact: 'Nadia Ahmed', field: 'Field B', date: '22 Sep', time: '14:00–15:30', duration: '1.5h', status: 'pending', amount: 180 },
  { id: 'B-1038', team: 'Harbor City FC', contact: 'Tom Reeves', field: 'Field A', date: '21 Sep', time: '18:00–20:00', duration: '2h', status: 'confirmed', amount: 240 },
  { id: 'B-1039', team: 'Rover Athletic', contact: 'Emma Schulz', field: 'Field C', date: '21 Sep', time: '19:00–20:00', duration: '1h', status: 'confirmed', amount: 120 },
]

const statusColor: Record<string, string> = {
  confirmed: 'var(--color-lime)',
  pending: 'var(--color-amber)',
  cancelled: 'var(--color-red)',
}

export default function Bookings() {
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = filter === 'all' ? allBookings : allBookings.filter(b => b.status === filter)

  return (
    <div className="p-8">
      <div className="flex items-end justify-between mb-8">
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-lime)', letterSpacing: '0.12em', marginBottom: 4 }}>RESERVATION SYSTEM</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 38, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '0.02em', lineHeight: 1 }}>BOOKINGS</h1>
        </div>
        <button style={{ background: 'var(--color-lime)', color: 'var(--color-navy)', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
          + New Booking
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {(['all', 'confirmed', 'pending', 'cancelled'] as Filter[]).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{
              fontFamily: 'var(--font-display)', fontSize: 13, letterSpacing: '0.06em',
              padding: '6px 16px', borderRadius: 6, cursor: 'pointer',
              textTransform: 'uppercase', fontWeight: 600,
              background: filter === f ? 'var(--color-turf)' : 'var(--color-panel)',
              color: filter === f ? 'var(--color-lime)' : 'var(--color-muted)',
              border: filter === f ? '1px solid var(--color-grass)' : '1px solid var(--color-border)',
            }}>
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: 'var(--color-panel)', border: '1px solid var(--color-border)', borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              {['Booking ID', 'Team', 'Contact', 'Field', 'Date', 'Time', 'Status', 'Amount'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((b, i) => (
              <tr key={b.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--color-border)' : 'none' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-pitch-mid)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-dim)' }}>{b.id}</td>
                <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>{b.team}</td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--color-text-dim)' }}>{b.contact}</td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--color-text-dim)' }}>{b.field}</td>
                <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-muted)' }}>{b.date}</td>
                <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-dim)' }}>{b.time}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase',
                    padding: '3px 8px', borderRadius: 4,
                    background: statusColor[b.status] + '1a',
                    color: statusColor[b.status],
                    border: `1px solid ${statusColor[b.status]}33`,
                  }}>{b.status}</span>
                </td>
                <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-lime)', fontWeight: 500 }}>€ {b.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
