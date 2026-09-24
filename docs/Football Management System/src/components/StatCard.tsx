type Props = {
  label: string
  value: string
  sub: string
  trend: 'up' | 'down' | 'neutral'
  color: string
}

export default function StatCard({ label, value, sub, trend, color }: Props) {
  return (
    <div style={{ background: 'var(--color-panel)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '20px 22px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: color, borderRadius: '10px 0 0 10px' }} />
      <div style={{ fontSize: 12, color: 'var(--color-muted)', fontWeight: 500, marginBottom: 8, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: 'var(--color-text)', lineHeight: 1, letterSpacing: '0.01em' }}>{value}</div>
      <div style={{ fontSize: 12, color: trend === 'up' ? 'var(--color-lime)' : trend === 'down' ? 'var(--color-red)' : 'var(--color-text-dim)', marginTop: 6 }}>
        {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '–'} {sub}
      </div>
    </div>
  )
}
