import type { SlotSelection } from './types'

export default function ConfirmationScreen({ slot, status, onDone, onMyBookings }: {
  slot: SlotSelection
  status: 'confirmed' | 'pending'
  onDone: () => void
  onMyBookings: () => void
}) {
  const isConfirmed = status === 'confirmed'
  const ref = 'TRF-' + Math.random().toString(36).toUpperCase().slice(2, 6)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', background: 'var(--color-bg)', textAlign: 'center' }}>

      {/* Icon */}
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: isConfirmed ? 'var(--color-primary)' : 'var(--color-pending-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38, marginBottom: 20 }}>
        {isConfirmed ? '✅' : '⏳'}
      </div>

      <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text)', marginBottom: 6 }}>
        {isConfirmed ? "You're booked!" : 'Request sent'}
      </div>
      <div style={{ fontSize: 15, color: 'var(--color-muted)', marginBottom: 28, lineHeight: 1.5 }}>
        {isConfirmed
          ? 'Your pitch is confirmed. See you there!'
          : "Greenfield Arena will confirm your booking shortly. We'll SMS you."}
      </div>

      {/* Summary card */}
      <div style={{ width: '100%', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 16, padding: '16px', marginBottom: 20, textAlign: 'left' }}>
        {/* Reference */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>Reference</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)', fontFamily: 'monospace', letterSpacing: '0.05em' }}>{ref}</span>
        </div>
        {[
          [slot.venueName, slot.area],
          [`${slot.pitch} · ${slot.pitchType}`, ''],
          [slot.date, slot.time],
        ].map(([a, b], i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)' }}>{a}</span>
            <span style={{ fontSize: 14, color: 'var(--color-muted)' }}>{b}</span>
          </div>
        ))}

        {/* Pay at venue */}
        <div style={{ marginTop: 12, background: 'var(--color-primary-light)', borderRadius: 10, padding: '10px 12px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-primary)' }}>
            Pay KES {slot.price.toLocaleString()} at the venue
          </div>
          <div style={{ fontSize: 13, color: 'var(--color-primary)', opacity: 0.8, marginTop: 2 }}>after your game</div>
        </div>
      </div>

      {/* SMS reminder note */}
      <div style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 28 }}>
        📱 We'll SMS you a reminder 2 hours before your booking.
      </div>

      {/* Action buttons */}
      {isConfirmed && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <a href="https://maps.google.com" style={{ padding: '13px', borderRadius: 12, border: 'none', background: 'var(--color-primary)', color: '#fff', fontSize: 15, fontWeight: 600, textDecoration: 'none', display: 'block', textAlign: 'center' }}>
            🗺 Get directions
          </a>
          <button onClick={onMyBookings}
            style={{ padding: '13px', borderRadius: 12, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', fontSize: 15, fontWeight: 500, cursor: 'pointer' }}>
            View my bookings
          </button>
          <button onClick={onDone}
            style={{ padding: '13px', borderRadius: 12, border: 'none', background: 'transparent', color: 'var(--color-muted)', fontSize: 15, cursor: 'pointer' }}>
            Back to Explore
          </button>
        </div>
      )}

      {!isConfirmed && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={onMyBookings}
            style={{ padding: '13px', borderRadius: 12, border: 'none', background: 'var(--color-primary)', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
            View my bookings
          </button>
          <button onClick={onDone}
            style={{ padding: '13px', borderRadius: 12, border: 'none', background: 'transparent', color: 'var(--color-muted)', fontSize: 15, cursor: 'pointer' }}>
            Back to Explore
          </button>
        </div>
      )}
    </div>
  )
}
