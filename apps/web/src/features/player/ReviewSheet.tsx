import { useState } from 'react'
import BottomSheet from '../../ui/BottomSheet'
import { PrimaryButton, inputStyle } from '../../ui/form'
import { useDemoStore } from '../../app/DemoStore'
import { useAppState } from '../../app/AppState'
import { useToast } from '../../ui/Toast'
import type { PlayerBooking } from '../../types'

const LABELS = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent']

/** Rate a venue after a game; the review shows on the venue page and counts towards its rating */
export default function ReviewSheet({ booking, onClose }: { booking: PlayerBooking; onClose: () => void }) {
  const { addReview } = useDemoStore()
  const { session } = useAppState()
  const toast = useToast()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')

  // "Brian Otieno" → "Brian O."
  const author = (() => {
    const [first, last] = (session?.name ?? 'Player').split(' ')
    return last ? `${first} ${last[0]}.` : first
  })()

  function submit() {
    addReview({ venueId: booking.venueId, author, rating, comment: comment.trim(), bookingRef: booking.ref })
    toast(`Thanks! Your review of ${booking.venue} is live`)
    onClose()
  }

  return (
    <BottomSheet onClose={onClose} label={`Review ${booking.venue}`}>
      <div style={{ padding: '16px 20px 0' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)' }}>How was {booking.venue}?</div>
        <div style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 16 }}>{booking.pitch} · {booking.date} · {booking.time}</div>
        <div className="flex items-center gap-2" style={{ marginBottom: 6 }} role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map(n => (
            <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} star${n > 1 ? 's' : ''}`} onClick={() => setRating(n)}
              style={{ fontSize: 34, lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer', color: n <= rating ? '#F59E0B' : 'var(--color-border)', padding: 2 }}>★</button>
          ))}
        </div>
        <div style={{ fontSize: 13, color: 'var(--color-muted)', height: 18, marginBottom: 12 }}>{LABELS[rating]}</div>
        <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} placeholder="What should other players know? (optional)"
          style={{ ...inputStyle, resize: 'none', lineHeight: 1.5, marginBottom: 16 }} />
        <PrimaryButton onClick={submit} disabled={rating === 0}>Post review</PrimaryButton>
      </div>
    </BottomSheet>
  )
}
