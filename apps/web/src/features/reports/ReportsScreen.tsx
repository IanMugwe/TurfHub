import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useIsDesktop } from '../../lib/useIsDesktop'

const DAYS_DATA = [
  { day: 'Mon', cash: 8000, mpesa: 12000, other: 1000 },
  { day: 'Tue', cash: 11000, mpesa: 15000, other: 2000 },
  { day: 'Wed', cash: 7500, mpesa: 10000, other: 500 },
  { day: 'Thu', cash: 9000, mpesa: 14000, other: 1500 },
  { day: 'Fri', cash: 14000, mpesa: 18000, other: 2500 },
  { day: 'Sat', cash: 18000, mpesa: 22000, other: 3000 },
  { day: 'Sun', cash: 16000, mpesa: 20000, other: 2000 },
]

type Range = 'week' | 'month' | 'custom'

export default function ReportsScreen() {
  const desktop = useIsDesktop()
  const [range, setRange] = useState<Range>('week')

  const total = DAYS_DATA.reduce((s, d) => s + d.cash + d.mpesa + d.other, 0)

  return (
    <div>
      <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: desktop ? '28px 32px 12px' : '52px 16px 12px' }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text)', marginBottom: 12 }}>Reports</div>

        <div className="flex gap-2">
          {(['week', 'month', 'custom'] as Range[]).map(r => (
            <button key={r} onClick={() => setRange(r)}
              style={{ padding: '6px 14px', borderRadius: 20, border: range === r ? 'none' : '1px solid var(--color-border)', background: range === r ? 'var(--color-primary)' : 'transparent', color: range === r ? '#fff' : 'var(--color-muted)', fontSize: 13, fontWeight: 500, cursor: 'pointer', textTransform: 'capitalize' }}>
              {r === 'week' ? 'This week' : r === 'month' ? 'This month' : 'Custom'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: desktop ? '24px 32px' : '16px' }}>
        {/* Total */}
        <div style={{ background: 'var(--color-primary)', borderRadius: 14, padding: '18px 20px', marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>Total collected this week</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#fff' }}>KES {total.toLocaleString()}</div>
          <div className="flex gap-4 mt-3">
            <div><div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Cash</div><div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>KES 83,500</div></div>
            <div><div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>M-Pesa</div><div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-accent)' }}>KES 111,000</div></div>
            <div><div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Other</div><div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>KES 12,500</div></div>
          </div>
        </div>

        {/* Revenue chart */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '16px', marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', marginBottom: 12 }}>Revenue per day</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={DAYS_DATA} margin={{ top: 0, right: 0, left: -16, bottom: 0 }}>
              <XAxis dataKey="day" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v/1000}K`} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }} formatter={(v) => [`KES ${Number(v).toLocaleString()}`, '']} />
              <Bar dataKey="cash" stackId="a" fill="#0F7A3D" radius={[0,0,0,0]} />
              <Bar dataKey="mpesa" stackId="a" fill="#B6F23A" radius={[0,0,0,0]} />
              <Bar dataKey="other" stackId="a" fill="#D1FAE5" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Outstanding */}
        <div style={{ background: 'var(--color-noshow-bg)', border: '1px solid var(--color-noshow-border)', borderRadius: 14, padding: '14px 16px', marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>Outstanding unpaid</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-noshow)' }}>KES 16,000</div>
          <div style={{ fontSize: 13, color: 'var(--color-muted)', marginTop: 2 }}>4 bookings · 3 customers</div>
        </div>

        {/* Occupancy heatmap */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '16px', marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', marginBottom: 12 }}>Occupancy heatmap</div>
          <div style={{ overflowX: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '30px repeat(7, 1fr)', gap: 2, minWidth: 280 }}>
              <div />
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                <div key={i} style={{ fontSize: 10, color: 'var(--color-muted)', textAlign: 'center' }}>{d}</div>
              ))}
              {[6,9,12,15,18,21].map(h => (
                <>
                  <div key={h} style={{ fontSize: 10, color: 'var(--color-muted)', paddingTop: 2 }}>{h}:00</div>
                  {[0.3,0.6,0.5,0.8,0.9,1.0,0.9].map((occ, di) => (
                    <div key={di} style={{ height: 18, borderRadius: 3, background: `rgba(15,122,61,${h >= 17 && h < 22 ? occ * 1.2 : occ * 0.7})` }} />
                  ))}
                </>
              ))}
            </div>
          </div>
        </div>

        {/* Top customers */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '14px 16px', marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', marginBottom: 10 }}>Top 5 customers</div>
          {[
            { name: 'Moses Ochieng', spent: 105000, visits: 42 },
            { name: 'Kevin Mwangi', spent: 77500, visits: 31 },
            { name: 'Brian Otieno', spent: 60000, visits: 24 },
            { name: 'Faith Wanjiru', spent: 45000, visits: 18 },
            { name: 'Lydia Chebet', spent: 37500, visits: 15 },
          ].map((c, i) => (
            <div key={c.name} className="flex items-center justify-between" style={{ padding: '7px 0', borderBottom: i < 4 ? '1px solid var(--color-border)' : 'none' }}>
              <div className="flex items-center gap-3">
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-muted)', width: 16 }}>{i + 1}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)' }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>{c.visits} visits</div>
                </div>
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-primary)' }}>KES {c.spent.toLocaleString()}</span>
            </div>
          ))}
        </div>

        <button style={{ width: '100%', padding: '13px', borderRadius: 12, border: '1px solid var(--color-primary)', background: 'transparent', color: 'var(--color-primary)', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
          Export CSV
        </button>
      </div>
    </div>
  )
}
