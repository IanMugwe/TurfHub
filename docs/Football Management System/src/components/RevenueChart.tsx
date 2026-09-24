import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const data = [
  { day: 'Mon', revenue: 1200, bookings: 8 },
  { day: 'Tue', revenue: 1850, bookings: 12 },
  { day: 'Wed', revenue: 2100, bookings: 14 },
  { day: 'Thu', revenue: 1650, bookings: 11 },
  { day: 'Fri', revenue: 3200, bookings: 19 },
  { day: 'Sat', revenue: 4100, bookings: 24 },
  { day: 'Sun', revenue: 3750, bookings: 22 },
]

export default function RevenueChart() {
  return (
    <div style={{ background: 'var(--color-panel)', border: '1px solid var(--color-border)', borderRadius: 10, padding: 22 }}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--color-text)', letterSpacing: '0.04em' }}>WEEKLY REVENUE</div>
          <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 2 }}>Sep 15–22, 2026</div>
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: 'var(--color-lime)' }}>€ 17,850</div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5bce6f" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#5bce6f" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e3248" vertical={false} />
          <XAxis dataKey="day" tick={{ fill: '#4a6180', fontSize: 11, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#4a6180', fontSize: 11, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} tickFormatter={v => `€${v}`} />
          <Tooltip
            contentStyle={{ background: '#111d2e', border: '1px solid #1e3248', borderRadius: 8, fontFamily: 'var(--font-body)', fontSize: 13 }}
            labelStyle={{ color: '#8aadb5' }}
            itemStyle={{ color: '#5bce6f' }}
            formatter={(v: number) => [`€${v.toLocaleString()}`, 'Revenue']}
          />
          <Area type="monotone" dataKey="revenue" stroke="#5bce6f" strokeWidth={2} fill="url(#revenueGrad)" dot={false} activeDot={{ r: 4, fill: '#5bce6f' }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
