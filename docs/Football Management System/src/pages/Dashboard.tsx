import StatCard from '../components/StatCard'
import FieldHeatmap from '../components/FieldHeatmap'
import RecentBookings from '../components/RecentBookings'
import UpcomingMatches from '../components/UpcomingMatches'
import RevenueChart from '../components/RevenueChart'

export default function Dashboard() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-lime)', letterSpacing: '0.12em', marginBottom: 4 }}>
            TUESDAY · 22 SEP 2026
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 38, fontWeight: 800, color: 'var(--color-text)', lineHeight: 1, letterSpacing: '0.02em' }}>
            OPERATIONS OVERVIEW
          </h1>
        </div>
        <div className="flex gap-3">
          <button style={{ background: 'var(--color-panel)', border: '1px solid var(--color-border)', color: 'var(--color-text-dim)', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontFamily: 'var(--font-body)', cursor: 'pointer' }}>
            Export Report
          </button>
          <button style={{ background: 'var(--color-lime)', color: 'var(--color-navy)', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontFamily: 'var(--font-body)', fontWeight: 600, cursor: 'pointer', border: 'none' }}>
            + New Booking
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-6" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <StatCard label="Today's Bookings" value="14" sub="+3 vs yesterday" trend="up" color="var(--color-lime)" />
        <StatCard label="Fields Active" value="4/5" sub="1 under maintenance" trend="neutral" color="var(--color-sky)" />
        <StatCard label="Revenue Today" value="€ 2,840" sub="+18% this week" trend="up" color="var(--color-amber)" />
        <StatCard label="Pending Payments" value="€ 640" sub="3 invoices due" trend="down" color="var(--color-red)" />
      </div>

      {/* Main grid */}
      <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 340px' }}>
        <div className="flex flex-col gap-5">
          <RevenueChart />
          <RecentBookings />
        </div>
        <div className="flex flex-col gap-5">
          <FieldHeatmap />
          <UpcomingMatches />
        </div>
      </div>
    </div>
  )
}
