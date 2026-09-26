import { useState } from 'react'
import { useCustomers } from '../../app/useCustomers'
import EmptyState from '../../ui/EmptyState'
import type { Customer } from '../../types'
import { useIsDesktop } from '../../lib/useIsDesktop'
import ResponsiveGrid from '../../ui/ResponsiveGrid'

export default function CustomersScreen({ venueId, flagged, onCustomerTap, onNewBooking }: { venueId: string; flagged: string[]; onCustomerTap: (c: Customer) => void; onNewBooking: () => void }) {
  const desktop = useIsDesktop()
  const [query, setQuery] = useState('')
  const customers = useCustomers(venueId)
  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.phone.includes(query)
  )

  return (
    <div>
      <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: desktop ? '28px 32px 12px' : '52px 16px 12px', ...(desktop && { background: 'transparent', borderBottom: 'none' }) }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text)', marginBottom: 12 }}>Customers</div>
        <div style={{ position: 'relative' }}>
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search name or phone…"
            style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: 10, border: '1px solid var(--color-border)', background: 'var(--color-bg)', fontSize: 15, color: 'var(--color-text)', outline: 'none' }} />
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔍</span>
        </div>
      </div>

      <div style={{ padding: desktop ? '16px 32px 32px' : '0 16px 16px' }}>
        {filtered.length === 0 && (
          <EmptyState icon="🔍" title={`No customers match "${query}"`} message="Customers are added automatically when you save a booking for them." action="+ New booking" onAction={onNewBooking} />
        )}
        <ResponsiveGrid>
        {filtered.map((c, i) => (
          <button key={c.name} onClick={() => onCustomerTap(c)} style={{ width: '100%', textAlign: 'left', display: 'block', background: 'var(--color-surface)', borderRadius: i === 0 && !desktop ? '0 0 12px 12px' : 12, borderWidth: 1, borderColor: 'var(--color-border)', borderStyle: i === 0 && !desktop ? 'none solid solid' : 'solid', padding: '14px', marginBottom: 8, cursor: 'pointer' }}>
            <div className="flex items-start justify-between gap-2">
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)' }}>{c.name}</span>
                  {flagged.includes(c.name) && <span style={{ fontSize: 13 }}>🚩</span>}
                  {c.noShows >= 2 && <span style={{ fontSize: 11, background: 'var(--color-noshow-bg)', color: 'var(--color-noshow)', padding: '1px 6px', borderRadius: 10, fontWeight: 500 }}>⚠ {c.noShows} no-shows</span>}
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-muted)', marginTop: 2 }}>{c.phone}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: c.unpaid > 0 ? 'var(--color-noshow)' : 'var(--color-muted)' }}>
                  {c.unpaid > 0 ? `KES ${c.unpaid.toLocaleString()} unpaid` : ''}
                </div>
              </div>
            </div>
            <div className="flex gap-4 mt-2">
              <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>{c.visits} visits</span>
              <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>Last: {c.lastVisit}</span>
            </div>
          </button>
        ))}
        </ResponsiveGrid>
      </div>
    </div>
  )
}
