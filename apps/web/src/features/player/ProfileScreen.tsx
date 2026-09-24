import { useState } from 'react'
import Toggle from '../../ui/Toggle'
import { customerByName, initials } from '../../mocks/data'
import { useIsDesktop } from '../../lib/useIsDesktop'

export default function ProfileScreen({ name, phone, onSignOut }: { name: string; phone: string; onSignOut: () => void }) {
  const desktop = useIsDesktop()
  const stats = customerByName(name)
  const [smsReminders, setSmsReminders] = useState(true)
  const [bookingUpdates, setBookingUpdates] = useState(true)
  const [promos, setPromos] = useState(false)

  return (
    <div>
      <div style={{ background: 'var(--color-primary)', padding: desktop ? '28px 32px 28px' : '52px 16px 28px', textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--color-accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: 'var(--color-primary-dark)', marginBottom: 10 }}>
          {initials(name)}
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>{name}</div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>{phone}</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 16 }}>
          {[[`${stats?.visits ?? 0}`, 'Bookings'], [stats?.unpaid ? `KES ${stats.unpaid.toLocaleString()}` : '0', 'Unpaid'], [`${stats?.noShows ?? 0}`, 'No-shows']].map(([val, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>{val}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={desktop ? { padding: '24px 32px', maxWidth: 720, margin: '0 auto' } : { padding: '16px' }}>
        {/* Account details */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Account</div>
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 14, overflow: 'hidden' }}>
            {[
              { label: 'Full name', value: name },
              { label: 'Phone number', value: phone },
            ].map((item, i) => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: i === 0 ? '1px solid var(--color-border)' : 'none' }}>
                <span style={{ fontSize: 15, color: 'var(--color-text)' }}>{item.label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 15, color: 'var(--color-muted)' }}>{item.value}</span>
                  <span style={{ color: 'var(--color-muted-light)', fontSize: 18 }}>›</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Notifications</div>
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 14, overflow: 'hidden' }}>
            {[
              { label: 'SMS reminders', sub: '2 hours before your booking', val: smsReminders, set: setSmsReminders },
              { label: 'Booking updates', sub: 'Confirmations and changes', val: bookingUpdates, set: setBookingUpdates },
              { label: 'Promotions', sub: 'Deals from venues', val: promos, set: setPromos },
            ].map((item, i) => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: i < 2 ? '1px solid var(--color-border)' : 'none' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text)' }}>{item.label}</div>
                  <div style={{ fontSize: 13, color: 'var(--color-muted)' }}>{item.sub}</div>
                </div>
                <Toggle on={item.val} onChange={item.set} label={item.label} />
              </div>
            ))}
          </div>
        </div>

        {/* Favourites */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Favourites</div>
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 14 }}>
            <button style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}>
              <span style={{ fontSize: 20 }}>❤️</span>
              <span style={{ fontSize: 15, color: 'var(--color-text)' }}>Greenfield Arena</span>
              <span style={{ marginLeft: 'auto', color: 'var(--color-muted-light)', fontSize: 18 }}>›</span>
            </button>
          </div>
        </div>

        {/* Sign out */}
        <button onClick={onSignOut} style={{ width: '100%', padding: '14px', borderRadius: 14, border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-noshow)', fontSize: 15, fontWeight: 500, cursor: 'pointer' }}>
          Sign out
        </button>
      </div>
    </div>
  )
}
