import { useState } from 'react'
import SettingsPage from './SettingsPage'
import { useStaff } from '../../app/StaffLayout'
import { useDemoStore } from '../../app/DemoStore'
import { useToast } from '../../ui/Toast'
import { Field, Panel, PrimaryButton, SectionTitle, inputStyle } from '../../ui/form'
import VenueMap from '../../ui/VenueMap'

const AMENITIES = ['💡 Floodlights', '🅿 Parking', '🚿 Changing rooms', '🏪 Canteen', '👕 Bibs & balls', '📶 Wi-Fi', '🎥 Match recording']

// A small library of pitch photos owners can add in the demo (uploads come with the API)
const PHOTO_LIBRARY = [
  'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&h=450&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=450&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=800&h=450&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&h=450&fit=crop&auto=format',
]

export default function VenueDetailsPage({ onBack }: { onBack: () => void }) {
  const { venue } = useStaff()
  const { updateVenue } = useDemoStore()
  const toast = useToast()
  const [form, setForm] = useState({
    name: venue.name, area: venue.area, address: venue.address, phone: venue.phone, description: venue.description,
    amenities: venue.amenities, images: venue.images, lat: venue.lat, lng: venue.lng,
  })
  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm(f => ({ ...f, [key]: value }))
  const valid = form.name.trim().length > 1 && form.area.trim().length > 1 && form.images.length > 0

  function save() {
    updateVenue(venue.id, { ...form, name: form.name.trim(), area: form.area.trim(), address: form.address.trim(), description: form.description.trim() })
    toast('Venue details saved')
    onBack()
  }

  const unused = PHOTO_LIBRARY.filter(p => !form.images.includes(p))

  return (
    <SettingsPage title="Venue details" subtitle="What players see on your venue page" onBack={onBack}>
      <Field label="Venue name"><input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} /></Field>
      <Field label="Area" hint="Shown in search, e.g. Kilimani, Nairobi"><input style={inputStyle} value={form.area} onChange={e => set('area', e.target.value)} /></Field>
      <Field label="Address"><input style={inputStyle} value={form.address} onChange={e => set('address', e.target.value)} /></Field>
      <Field label="Contact phone"><input style={inputStyle} type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} /></Field>
      <Field label="Description">
        <textarea rows={3} style={{ ...inputStyle, resize: 'none', lineHeight: 1.5 }} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Surfaces, facilities, what makes your venue great" />
      </Field>

      <SectionTitle>Amenities</SectionTitle>
      <div className="flex flex-wrap gap-2" style={{ marginBottom: 20 }}>
        {AMENITIES.map(a => {
          const on = form.amenities.includes(a)
          return (
            <button key={a} type="button" aria-pressed={on} onClick={() => set('amenities', on ? form.amenities.filter(x => x !== a) : [...form.amenities, a])}
              style={{ padding: '7px 12px', borderRadius: 20, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: on ? '1px solid var(--color-primary)' : '1px solid var(--color-border)', background: on ? 'var(--color-primary-light)' : 'var(--color-surface)', color: on ? 'var(--color-primary)' : 'var(--color-muted)' }}>
              {a}
            </button>
          )
        })}
      </div>

      <SectionTitle>Photos</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 20 }}>
        {form.images.map((src, i) => (
          <div key={src} style={{ position: 'relative', aspectRatio: '16 / 10', borderRadius: 10, overflow: 'hidden', background: 'var(--color-confirmed-bg)' }}>
            <img src={src} alt={`Photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {i === 0 && <span style={{ position: 'absolute', left: 6, bottom: 6, fontSize: 10, fontWeight: 600, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '2px 6px', borderRadius: 6 }}>Cover</span>}
            {form.images.length > 1 && (
              <button type="button" aria-label={`Remove photo ${i + 1}`} onClick={() => set('images', form.images.filter(x => x !== src))}
                style={{ position: 'absolute', top: 4, right: 4, width: 24, height: 24, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.6)', color: '#fff', cursor: 'pointer', fontSize: 14, lineHeight: 1 }}>×</button>
            )}
          </div>
        ))}
        {unused.length > 0 && (
          <button type="button" onClick={() => set('images', [...form.images, unused[0]])}
            style={{ aspectRatio: '16 / 10', borderRadius: 10, border: '1px dashed var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-primary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            + Add photo
          </button>
        )}
      </div>

      <SectionTitle>Location</SectionTitle>
      <Panel>
        <VenueMap height={220} center={{ lat: form.lat, lng: form.lng }} pins={[{ id: venue.id, lat: form.lat, lng: form.lng, label: form.name }]}
          draggable onMove={(lat, lng) => setForm(f => ({ ...f, lat, lng }))} />
        <div style={{ fontSize: 12, color: 'var(--color-muted)', padding: '8px 12px' }}>Drag the pin to your entrance so players get accurate directions.</div>
      </Panel>

      <PrimaryButton onClick={save} disabled={!valid}>Save details</PrimaryButton>
    </SettingsPage>
  )
}
