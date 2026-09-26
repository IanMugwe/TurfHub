import { Fragment, useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { formatKES } from '@turfhub/validation'
import { useToast } from '../../ui/Toast'
import { useIsDesktop } from '../../lib/useIsDesktop'
import { useDemoStore } from '../../app/DemoStore'
import { balanceOf, rangeOf } from '../../lib/bookings'
import { addDays, dayOfMonth, formatDay, todayKey, weekOf, weekdayShort } from '../../lib/dates'
import { activePitches, hoursFor } from '../../lib/venue'
import { NOW_HOUR, startHour } from '../../mocks/data'
import { inputStyle } from '../../ui/form'
import type { Booking, PaymentMethod, Venue } from '../../types'

type Range = 'week' | 'month' | 'custom'

const METHOD_LABEL: Record<PaymentMethod, string> = { cash: 'Cash', mpesa: 'M-Pesa', other: 'Other' }
const SOURCE_LABEL: Record<string, string> = { walkin: 'Walk-in', phone: 'Phone', whatsapp: 'WhatsApp', app: 'App' }
const SOURCE_COLOR: Record<string, string> = { app: '#0F7A3D', phone: '#B6F23A', whatsapp: '#34D399', walkin: '#9CA3AF' }
const BLOCKS = [6, 9, 12, 15, 18, 21]
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]

function datesBetween(from: string, to: string) {
  const out: string[] = []
  for (let d = from; d <= to && out.length < 366; d = addDays(d, 1)) out.push(d)
  return out
}

/** Money received per method; older sample bookings without a payment record count as cash */
function paymentsOf(b: Booking): { method: PaymentMethod; amount: number }[] {
  if (b.payments?.length) return b.payments
  return b.paid > 0 ? [{ method: 'cash', amount: b.paid }] : []
}

function csvCell(v: string | number) {
  const s = String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export default function ReportsScreen({ venue }: { venue: Venue }) {
  const toast = useToast()
  const desktop = useIsDesktop()
  const { bookings } = useDemoStore()
  const today = todayKey()
  const [range, setRange] = useState<Range>('week')
  const [custom, setCustom] = useState({ from: addDays(today, -13), to: today })
  const [pitchId, setPitchId] = useState<string>('all')

  // Reports look back: nothing after today counts as revenue yet
  const [from, to] = useMemo(() => {
    if (range === 'week') { const w = weekOf(today); return [w[0], today] }
    if (range === 'month') return [`${today.slice(0, 8)}01`, today]
    return custom.from <= custom.to ? [custom.from, custom.to > today ? today : custom.to] : [custom.to, custom.from]
  }, [range, custom, today])
  const days = datesBetween(from, to)

  const inRange = bookings.filter(b => b.venueId === venue.id && b.dateKey >= from && b.dateKey <= to && (pitchId === 'all' || b.pitchId === pitchId))
  // Played (or due to have been played) by now
  const played = inRange.filter(b => b.status !== 'cancelled' && b.status !== 'pending' && (b.dateKey < today || startHour(b) <= NOW_HOUR))

  // Revenue by day and method
  const byDay = days.map(d => {
    const row = { day: range === 'week' ? weekdayShort(d) : String(dayOfMonth(d)), cash: 0, mpesa: 0, other: 0 }
    for (const b of inRange.filter(x => x.dateKey === d)) for (const p of paymentsOf(b)) row[p.method] += p.amount
    return row
  })
  const totals = byDay.reduce((t, r) => ({ cash: t.cash + r.cash, mpesa: t.mpesa + r.mpesa, other: t.other + r.other }), { cash: 0, mpesa: 0, other: 0 })
  const total = totals.cash + totals.mpesa + totals.other

  // Outstanding balances for games already played
  const owing = played.filter(b => b.status !== 'noshow' && balanceOf(b) > 0)
  const owed = owing.reduce((s, b) => s + balanceOf(b), 0)

  // Occupancy: booked pitch-hours ÷ open pitch-hours, by weekday and 3-hour block
  const pitchCount = pitchId === 'all' ? activePitches(venue).length : 1
  const heat = WEEK_ORDER.map(wd => BLOCKS.map(block => {
    let open = 0
    let booked = 0
    for (const d of days.filter(x => new Date(`${x}T12:00`).getDay() === wd)) {
      const h = hoursFor(venue, d)
      if (h.closed) continue
      const openHrs = Math.max(0, Math.min(block + 3, h.close) - Math.max(block, h.open))
      open += openHrs * pitchCount
      for (const b of played.filter(x => x.dateKey === d)) {
        const [s, e] = rangeOf(b)
        booked += Math.max(0, Math.min(e, (block + 3) * 60) - Math.max(s, block * 60)) / 60
      }
    }
    return open ? Math.min(1, booked / open) : null
  }))

  // Where bookings come from, and how often people don't turn up
  const sourceCounts = Object.entries(inRange.filter(b => b.status !== 'cancelled').reduce<Record<string, number>>((acc, b) => ({ ...acc, [b.source]: (acc[b.source] ?? 0) + 1 }), {}))
    .map(([source, value]) => ({ source, name: SOURCE_LABEL[source], value }))
    .sort((a, b) => b.value - a.value)
  const noShows = played.filter(b => b.status === 'noshow').length
  const noShowRate = played.length ? Math.round((noShows / played.length) * 1000) / 10 : 0

  const top = Object.values(played.reduce<Record<string, { name: string; spent: number; visits: number }>>((acc, b) => {
    const c = acc[b.customer] ?? { name: b.customer, spent: 0, visits: 0 }
    c.spent += b.paid
    c.visits += b.status === 'noshow' ? 0 : 1
    return { ...acc, [b.customer]: c }
  }, {})).sort((a, b) => b.spent - a.spent).slice(0, 5)

  const rangeLabel = from === to ? formatDay(from) : `${formatDay(from)} – ${formatDay(to)}`

  function exportCsv() {
    const header = ['Date', 'Time', 'Pitch', 'Customer', 'Phone', 'Source', 'Status', 'Amount (KES)', 'Paid (KES)', 'Balance (KES)', 'Payments']
    const rows = [...inRange].sort((a, b) => a.dateKey.localeCompare(b.dateKey) || rangeOf(a)[0] - rangeOf(b)[0]).map(b => [
      b.dateKey, b.time, b.pitch, b.customer, b.phone, SOURCE_LABEL[b.source], b.status, b.amount, b.paid, balanceOf(b),
      paymentsOf(b).map(p => `${METHOD_LABEL[p.method]} ${p.amount}${'code' in p && p.code ? ` (${p.code})` : ''}`).join('; '),
    ])
    const csv = [header, ...rows].map(r => r.map(csvCell).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `turf-${venue.slug}-${from}-to-${to}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    toast(`Exported ${rows.length} booking${rows.length === 1 ? '' : 's'} to CSV`)
  }

  const card = { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '16px', marginBottom: 14 } as const

  return (
    <div>
      <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: desktop ? '28px 32px 12px' : '52px 16px 12px', ...(desktop && { background: 'transparent', borderBottom: 'none' }) }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text)', marginBottom: 12 }}>Reports</div>

        <div className="flex gap-2 flex-wrap">
          {(['week', 'month', 'custom'] as Range[]).map(r => (
            <button key={r} onClick={() => setRange(r)} aria-pressed={range === r}
              style={{ padding: '6px 14px', borderRadius: 20, border: range === r ? 'none' : '1px solid var(--color-border)', background: range === r ? 'var(--color-primary)' : 'transparent', color: range === r ? '#fff' : 'var(--color-muted)', fontSize: 13, fontWeight: 500, cursor: 'pointer', textTransform: 'capitalize' }}>
              {r === 'week' ? 'This week' : r === 'month' ? 'This month' : 'Custom'}
            </button>
          ))}
        </div>
        {range === 'custom' && (
          <div className="flex items-center gap-2" style={{ marginTop: 10 }}>
            <input aria-label="From" type="date" max={today} value={custom.from} onChange={e => e.target.value && setCustom(c => ({ ...c, from: e.target.value }))} style={{ ...inputStyle, width: 'auto', padding: '7px 10px', fontSize: 14 }} />
            <span style={{ color: 'var(--color-muted)' }}>to</span>
            <input aria-label="To" type="date" max={today} value={custom.to} onChange={e => e.target.value && setCustom(c => ({ ...c, to: e.target.value }))} style={{ ...inputStyle, width: 'auto', padding: '7px 10px', fontSize: 14 }} />
          </div>
        )}
        <div className="flex gap-2 flex-wrap" style={{ marginTop: 10 }}>
          {[{ id: 'all', name: 'All pitches' }, ...activePitches(venue)].map(p => (
            <button key={p.id} onClick={() => setPitchId(p.id)} aria-pressed={pitchId === p.id}
              style={{ padding: '4px 12px', borderRadius: 20, border: '1px solid var(--color-border)', background: pitchId === p.id ? 'var(--color-primary-light)' : 'transparent', color: pitchId === p.id ? 'var(--color-primary)' : 'var(--color-muted)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: desktop ? '24px 32px' : '16px' }}>
        {/* Total */}
        <div style={{ background: 'var(--color-primary)', borderRadius: 14, padding: '18px 20px', marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>Total collected · {rangeLabel}</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>{formatKES(total)}</div>
          <div className="flex gap-4 mt-3">
            <div><div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Cash</div><div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{formatKES(totals.cash)}</div></div>
            <div><div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>M-Pesa</div><div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-accent)' }}>{formatKES(totals.mpesa)}</div></div>
            <div><div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Other</div><div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{formatKES(totals.other)}</div></div>
          </div>
        </div>

        <div style={desktop ? { display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 14, alignItems: 'start' } : undefined}>
          {/* Revenue chart */}
          <div style={card}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', marginBottom: 12 }}>Revenue per day</div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={byDay} margin={{ top: 0, right: 0, left: -16, bottom: 0 }}>
                <XAxis dataKey="day" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} interval={byDay.length > 16 ? 'preserveStartEnd' : 0} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v / 1000}K`} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }} formatter={(v, name) => [formatKES(Number(v)), METHOD_LABEL[name as PaymentMethod] ?? name]} />
                <Bar dataKey="cash" stackId="a" fill="#0F7A3D" />
                <Bar dataKey="mpesa" stackId="a" fill="#B6F23A" />
                <Bar dataKey="other" stackId="a" fill="#D1FAE5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Outstanding */}
          <div style={{ background: 'var(--color-noshow-bg)', border: '1px solid var(--color-noshow-border)', borderRadius: 14, padding: '14px 16px', marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>Outstanding unpaid</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: owed ? 'var(--color-noshow)' : 'var(--color-text)' }}>{formatKES(owed)}</div>
            <div style={{ fontSize: 13, color: 'var(--color-muted)', marginTop: 2 }}>{owing.length} booking{owing.length === 1 ? '' : 's'} · {new Set(owing.map(b => b.customer)).size} customers</div>
            {owing.slice(0, 4).map(b => (
              <div key={b.ref} className="flex justify-between" style={{ fontSize: 13, color: 'var(--color-text)', paddingTop: 6 }}>
                <span>{b.customer} · {formatDay(b.dateKey)}</span>
                <span style={{ fontWeight: 600 }}>{formatKES(balanceOf(b))}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={desktop ? { display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 14, alignItems: 'start' } : undefined}>
          {/* Occupancy heatmap */}
          <div style={card}>
            <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)' }}>Occupancy heatmap</span>
              <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>Lighter = quiet hours to promote</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '36px repeat(7, 1fr)', gap: 2, minWidth: 280 }}>
                <div />
                {WEEK_ORDER.map(wd => (
                  <div key={wd} style={{ fontSize: 10, color: 'var(--color-muted)', textAlign: 'center' }}>{['S', 'M', 'T', 'W', 'T', 'F', 'S'][wd]}</div>
                ))}
                {BLOCKS.map((block, bi) => (
                  <Fragment key={block}>
                    <div style={{ fontSize: 10, color: 'var(--color-muted)', paddingTop: 2 }}>{block}:00</div>
                    {WEEK_ORDER.map((wd, di) => {
                      const occ = heat[di][bi]
                      return (
                        <div key={wd} title={occ === null ? 'Closed' : `${Math.round(occ * 100)}% booked`}
                          style={{ height: 18, borderRadius: 3, background: occ === null ? 'var(--color-surface-2)' : `rgba(15,122,61,${0.08 + occ * 0.92})` }} />
                      )
                    })}
                  </Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Sources and no-shows */}
          <div style={card}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>Bookings by source</div>
            {sourceCounts.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--color-muted)' }}>No bookings in this period.</div>
            ) : (
              <div className="flex items-center gap-3">
                <div style={{ width: 110, height: 110, flexShrink: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={sourceCounts} dataKey="value" nameKey="name" innerRadius={32} outerRadius={52} paddingAngle={2} stroke="none">
                        {sourceCounts.map(s => <Cell key={s.source} fill={SOURCE_COLOR[s.source]} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ flex: 1 }}>
                  {sourceCounts.map(s => (
                    <div key={s.source} className="flex items-center justify-between" style={{ fontSize: 13, padding: '2px 0' }}>
                      <span className="flex items-center gap-2" style={{ color: 'var(--color-text)' }}><span style={{ width: 8, height: 8, borderRadius: 2, background: SOURCE_COLOR[s.source] }} />{s.name}</span>
                      <span style={{ color: 'var(--color-muted)' }}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div style={{ borderTop: '1px solid var(--color-border)', marginTop: 12, paddingTop: 10 }}>
              <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>No-show rate</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: noShowRate > 5 ? 'var(--color-noshow)' : 'var(--color-text)' }}>{noShowRate}%</div>
              <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>{noShows} of {played.length} bookings</div>
            </div>
          </div>
        </div>

        {/* Top customers */}
        <div style={{ ...card, padding: '14px 16px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', marginBottom: 10 }}>Top 5 customers</div>
          {top.length === 0 && <div style={{ fontSize: 13, color: 'var(--color-muted)' }}>No games played in this period.</div>}
          {top.map((c, i) => (
            <div key={c.name} className="flex items-center justify-between" style={{ padding: '7px 0', borderBottom: i < top.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
              <div className="flex items-center gap-3">
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-muted)', width: 16 }}>{i + 1}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)' }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>{c.visits} visit{c.visits === 1 ? '' : 's'}</div>
                </div>
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-primary)' }}>{formatKES(c.spent)}</span>
            </div>
          ))}
        </div>

        <button onClick={exportCsv} style={{ width: '100%', padding: '13px', borderRadius: 12, border: '1px solid var(--color-primary)', background: 'transparent', color: 'var(--color-primary)', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
          Export CSV · {inRange.length} booking{inRange.length === 1 ? '' : 's'}
        </button>
      </div>
    </div>
  )
}
