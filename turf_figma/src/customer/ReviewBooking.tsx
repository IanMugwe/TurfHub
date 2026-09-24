import { useState } from 'react'
import type { SlotSelection } from './types'

export default function ReviewBooking({ slot, onBack, onConfirm }: {
  slot: SlotSelection
  onBack: () => void
  onConfirm: (status: 'confirmed' | 'pending') => void
}) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('+254 ')
  const [notes, setNotes] = useState('')

  return (
    <div>
      {/* Header */}
      <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: '52px 16px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--color-border)', background: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--color-text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)' }}>Review booking</div>
      </div>

      <div style={{ padding: '16px', paddingBottom: 120 }}>
        {/* Booking summary card */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 16, overflow: 'hidden', marginBottom: 14 }}>
          {/* Green top bar */}
          <div style={{ background: 'var(--color-primary)', padding: '12px 16px' }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>{slot.venueName}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>{slot.area}</div>
          </div>
          <div style={{ padding: '14px 16px' }}>
            {[
              ['Pitch', `${slot.pitch} · ${slot.pitchType}`],
              ['Date', slot.date],
              ['Time', slot.time],
              ['Duration', '1 hour'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between" style={{ padding: '6px 0', borderBottom: '1px solid var(--color-border)' }}>
                <span style={{ fontSize: 14, color: 'var(--color-muted)' }}>{label}</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)' }}>{value}</span>
              </div>
            ))}
            <div className="flex justify-between" style={{ padding: '6px 0' }}>
              <span style={{ fontSize: 14, color: 'var(--color-muted)' }}>Price</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-primary)' }}>
                KES {slot.price.toLocaleString()} {slot.isPeak ? '· peak' : '· off-peak'}
              </span>
            </div>
          </div>
        </div>

        {/* Pay at venue banner */}
        <div style={{ background: 'var(--color-primary-light)', border: '1px solid var(--color-primary)', borderRadius: 14, padding: '14px 16px', marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-primary)', marginBottom: 4 }}>
            💳 No payment now
          </div>
          <div style={{ fontSize: 14, color: 'var(--color-primary)' }}>
            Pay <strong>KES {slot.price.toLocaleString()}</strong> at the venue after your game.
          </div>
        </div>

        {/* Your details */}
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Your details</div>

        <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: 'var(--color-text)', marginBottom: 6 }}>Full name</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Brian Otieno"
          style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid var(--color-border)', background: 'var(--color-surface)', fontSize: 15, color: 'var(--color-text)', outline: 'none', marginBottom: 12, display: 'block' }} />

        <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: 'var(--color-text)', marginBottom: 6 }}>Phone number</label>
        <input value={phone} onChange={e => setPhone(e.target.value)} type="tel"
          style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid var(--color-border)', background: 'var(--color-surface)', fontSize: 15, color: 'var(--color-text)', outline: 'none', marginBottom: 12, display: 'block' }} />

        <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: 'var(--color-text)', marginBottom: 6 }}>Notes <span style={{ color: 'var(--color-muted)', fontWeight: 400 }}>(optional)</span></label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. We'll be 8 players…" rows={2}
          style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid var(--color-border)', background: 'var(--color-surface)', fontSize: 15, color: 'var(--color-text)', outline: 'none', display: 'block', resize: 'none', fontFamily: 'inherit' }} />

        {/* Cancellation policy */}
        <div style={{ fontSize: 13, color: 'var(--color-muted)', marginTop: 12 }}>
          🔓 Free cancellation up to <strong>2 hours before</strong> your booking starts.
        </div>
      </div>

      {/* Sticky confirm button */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 390, background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', padding: '12px 16px 28px', zIndex: 90 }}>
        <button onClick={() => onConfirm('confirmed')} disabled={!name || phone.length < 10}
          style={{ width: '100%', padding: '15px', borderRadius: 14, border: 'none', background: name && phone.length >= 10 ? 'var(--color-primary)' : 'var(--color-border)', color: name && phone.length >= 10 ? '#fff' : 'var(--color-muted-light)', fontSize: 16, fontWeight: 700, cursor: name && phone.length >= 10 ? 'pointer' : 'not-allowed', transition: 'background 0.15s' }}>
          Confirm booking
        </button>
      </div>
    </div>
  )
}
