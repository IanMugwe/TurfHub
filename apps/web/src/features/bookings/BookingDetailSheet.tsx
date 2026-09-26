import { useState } from 'react'
import type { Booking, PaymentMethod } from '../../types'
import { StatusPill, PayPill } from '../../ui/Pill'
import BottomSheet from '../../ui/BottomSheet'
import { NOW_HOUR, startHour } from '../../mocks/data'
import { useDemoStore } from '../../app/DemoStore'
import { balanceOf } from '../../lib/bookings'
import { todayKey } from '../../lib/dates'
import { useToast } from '../../ui/Toast'
import { MoveView, ExtendView } from './MoveExtend'
import { formatKES } from '@turfhub/validation'

const METHOD_LABEL: Record<PaymentMethod, string> = { cash: '💵 Cash', mpesa: '📱 M-Pesa', other: '🏦 Other' }

const SOURCE_LABEL: Record<string, string> = { walkin: '🚶 Walk-in', phone: '📞 Phone', whatsapp: '💬 WhatsApp', app: '📱 App' }

export default function BookingDetailSheet({ booking: b, onClose }: { booking: Booking; onClose: () => void }) {
  const [showPayment, setShowPayment] = useState(false)
  const [amount, setAmount] = useState(String(balanceOf(b)))
  const [method, setMethod] = useState<PaymentMethod>('cash')
  const [mpesaCode, setMpesaCode] = useState('')
  const [scope, setScope] = useState<'one' | 'following'>('one')
  const [mode, setMode] = useState<'detail' | 'move' | 'extend'>('detail')

  const { recordPayment, waiveBalance, cancelBooking, markNoShow } = useDemoStore()
  const toast = useToast()
  const today = todayKey()
  const balance = balanceOf(b)
  const hasStarted = b.dateKey < today || (b.dateKey === today && startHour(b) <= NOW_HOUR)
  const isOpen = b.status === 'confirmed' || b.status === 'pending' || b.status === 'completed'
  const payAmount = Math.round(Number(amount))

  function savePayment() {
    recordPayment(b.ref, payAmount, method, method === 'mpesa' ? mpesaCode : undefined)
    toast(`Payment recorded · ${formatKES(Math.min(payAmount, balance))} ${method === 'mpesa' ? 'M-Pesa' : method === 'cash' ? 'cash' : ''}`.trim())
    setShowPayment(false)
    setMpesaCode('')
  }

  return (
    <BottomSheet onClose={onClose} maxHeight="92vh" label={`Booking ${b.ref}`}>
      {mode === 'move' ? <MoveView booking={b} scope={scope} onDone={() => setMode('detail')} />
        : mode === 'extend' ? <ExtendView booking={b} onDone={() => setMode('detail')} />
        : (
      <>
        <div style={{ padding: '12px 20px 0' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <StatusPill status={b.status} />
              <span style={{ fontSize: 13, color: 'var(--color-muted)', fontFamily: 'monospace' }}>{b.ref}</span>
            </div>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'var(--color-bg)', cursor: 'pointer', fontSize: 18, color: 'var(--color-muted)' }}>×</button>
          </div>

          {/* Customer */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)' }}>{b.customer}</div>
            <div style={{ fontSize: 14, color: 'var(--color-muted)', marginTop: 2 }}>{b.phone}</div>
            <div className="flex gap-2 mt-3">
              <a href={`tel:${b.phone}`} style={{ flex: 1, padding: '10px', borderRadius: 10, background: 'var(--color-primary-light)', color: 'var(--color-primary)', fontSize: 14, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                📞 Call
              </a>
              <a href={`https://wa.me/${b.phone.replace(/\D/g, '')}`} style={{ flex: 1, padding: '10px', borderRadius: 10, background: 'var(--color-whatsapp-bg)', color: 'var(--color-whatsapp)', fontSize: 14, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                💬 WhatsApp
              </a>
            </div>
          </div>

          {/* Details */}
          <div style={{ background: 'var(--color-bg)', borderRadius: 12, padding: '14px', marginBottom: 14 }}>
            {[
              ['Pitch', `${b.pitch} · ${b.pitchType}`],
              ['Date', b.date],
              ['Time', b.time],
              ['Duration', b.duration],
              ['Source', SOURCE_LABEL[b.source]],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between" style={{ padding: '5px 0', borderBottom: '1px solid var(--color-border)' }}>
                <span style={{ fontSize: 14, color: 'var(--color-muted)' }}>{label}</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)' }}>{value}</span>
              </div>
            ))}
            {b.notes && (
              <div style={{ marginTop: 8, fontSize: 13, color: 'var(--color-muted)', fontStyle: 'italic' }}>{b.notes}</div>
            )}
          </div>

          {/* Payment card */}
          <div style={{ border: '1px solid var(--color-border)', borderRadius: 14, padding: '14px', marginBottom: 14 }}>
            <div className="flex items-center justify-between mb-3">
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)' }}>Payment</div>
              <PayPill status={b.payment} />
            </div>
            <div className="flex justify-between mb-1">
              <span style={{ fontSize: 14, color: 'var(--color-muted)' }}>Total</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>KES {b.amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span style={{ fontSize: 14, color: 'var(--color-muted)' }}>Paid</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-primary)' }}>KES {b.paid.toLocaleString()}</span>
            </div>
            {balance > 0 && (
              <div className="flex justify-between" style={{ paddingTop: 8, borderTop: '1px solid var(--color-border)' }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)' }}>Balance</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-noshow)' }}>KES {balance.toLocaleString()}</span>
              </div>
            )}

            {/* Payments recorded so far */}
            {(b.payments ?? []).map((p, i) => (
              <div key={i} className="flex justify-between" style={{ fontSize: 13, color: 'var(--color-muted)', padding: '2px 0 2px 10px' }}>
                <span>{METHOD_LABEL[p.method]}{p.code && <span style={{ fontFamily: 'monospace' }}> · {p.code}</span>} · {p.at}</span>
                <span>{formatKES(p.amount)}</span>
              </div>
            ))}
            {b.payment === 'waived' && (
              <div style={{ fontSize: 13, color: 'var(--color-muted)', padding: '2px 0 2px 10px' }}>Remaining balance waived</div>
            )}
            {balance > 0 && !showPayment && (
              <button onClick={() => { setAmount(String(balance)); setShowPayment(true) }}
                style={{ width: '100%', marginTop: 12, padding: '11px', borderRadius: 10, border: 'none', background: 'var(--color-primary)', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
                Record payment
              </button>
            )}

            {/* Record payment inline */}
            {showPayment && (
              <div style={{ marginTop: 12, background: 'var(--color-bg)', borderRadius: 10, padding: '12px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-muted)', marginBottom: 8 }}>Record payment</div>
                <input value={amount} onChange={e => setAmount(e.target.value)} type="number"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface)', fontSize: 15, color: 'var(--color-text)', marginBottom: 10, display: 'block', outline: 'none' }} />
                <div className="flex gap-2 mb-2">
                  {(Object.entries(METHOD_LABEL) as [PaymentMethod, string][]).map(([id, label]) => (
                    <button key={id} onClick={() => setMethod(id)}
                      style={{ flex: 1, padding: '8px 4px', borderRadius: 8, border: method === id ? 'none' : '1px solid var(--color-border)', background: method === id ? 'var(--color-primary)' : 'var(--color-surface)', color: method === id ? '#fff' : 'var(--color-muted)', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
                      {label}
                    </button>
                  ))}
                </div>
                {method === 'mpesa' && (
                  <input value={mpesaCode} onChange={e => setMpesaCode(e.target.value.toUpperCase())} placeholder="M-Pesa code e.g. SIJ4X8Y2ZQ"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface)', fontSize: 14, marginBottom: 8, display: 'block', outline: 'none', fontFamily: 'monospace' }} />
                )}
                <button onClick={savePayment} disabled={!(payAmount > 0)}
                  style={{ width: '100%', padding: '11px', borderRadius: 8, border: 'none', background: 'var(--color-primary)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', marginBottom: 6 }}>
                  Save payment
                </button>
                <button onClick={() => { waiveBalance(b.ref); setShowPayment(false); toast(`Waived ${formatKES(balance)} for ${b.customer}`) }}
                  style={{ width: '100%', padding: '8px', background: 'none', border: 'none', color: 'var(--color-muted)', fontSize: 13, cursor: 'pointer' }}>
                  Waive remaining balance
                </button>
              </div>
            )}
          </div>

          {/* Recurring series */}
          {b.series && (
            <div style={{ background: 'var(--color-bg)', borderRadius: 12, padding: '12px 14px', marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', marginBottom: 8 }}>🔁 Part of weekly series ({b.series.index} of {b.series.total})</div>
              <div style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 6 }}>Changes apply to</div>
              <div style={{ display: 'flex', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, padding: 3 }}>
                {([['one', 'This booking'], ['following', 'This and following']] as const).map(([id, label]) => (
                  <button key={id} onClick={() => setScope(id)}
                    style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: scope === id ? 'var(--color-primary)' : 'transparent', color: scope === id ? '#fff' : 'var(--color-muted)' }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions (only while the booking is still open) */}
          {isOpen && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {(['Move', 'Extend'] as const).map(action => (
                  <button key={action} onClick={() => setMode(action === 'Move' ? 'move' : 'extend')}
                    style={{ padding: '11px', minHeight: 44, borderRadius: 10, border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text)', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>{action}</button>
                ))}
                <button onClick={() => { cancelBooking(b.ref); toast(`Cancelled ${b.customer} · ${b.time}`); onClose() }}
                  style={{ padding: '11px', minHeight: 44, borderRadius: 10, border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-noshow)', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Cancel booking</button>
                <button disabled={!hasStarted} onClick={() => { markNoShow(b.ref); toast(`Marked ${b.customer} as a no-show`) }}
                  style={{ padding: '11px', minHeight: 44, borderRadius: 10, border: `1px solid ${hasStarted ? 'var(--color-noshow-border)' : 'var(--color-border)'}`, background: hasStarted ? 'var(--color-noshow-bg)' : 'transparent', color: hasStarted ? 'var(--color-noshow)' : 'var(--color-muted-light)', fontSize: 14, fontWeight: 500, cursor: hasStarted ? 'pointer' : 'not-allowed' }}>
                  Mark no-show
                </button>
              </div>
              {!hasStarted && (
                <div style={{ fontSize: 12, color: 'var(--color-muted)', textAlign: 'right', marginTop: 6 }}>No-show available after {b.time.split('–')[0]}</div>
              )}
            </>
          )}
        </div>
      </>
      )}
    </BottomSheet>
  )
}
