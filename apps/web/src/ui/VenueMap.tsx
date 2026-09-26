import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useAppState } from '../app/AppState'

export interface MapPin {
  id: string
  lat: number
  lng: number
  /** Short text on the pin, e.g. "KES 2,500" */
  label: string
  selected?: boolean
}

// OpenStreetMap's standard tiles (no API key). Dark mode inverts them with a CSS filter.
// Production should use a tile provider with an SLA (implementation plan D10: MapLibre).
const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const ATTRIBUTION = '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
const DARK_FILTER = 'invert(1) hue-rotate(180deg) brightness(0.9) contrast(0.9)'

function pinIcon(pin: MapPin) {
  const bg = pin.selected ? '#0F7A3D' : '#ffffff'
  const fg = pin.selected ? '#ffffff' : '#0F7A3D'
  return L.divIcon({
    className: '',
    iconSize: undefined,
    iconAnchor: [0, 0],
    html: `<div style="transform:translate(-50%,-100%);display:inline-flex;align-items:center;gap:4px;white-space:nowrap;padding:5px 9px;border-radius:14px;background:${bg};color:${fg};border:2px solid #0F7A3D;font:600 12px Inter,system-ui,sans-serif;box-shadow:0 2px 8px rgba(0,0,0,.25)">⚽ ${pin.label}</div>`,
  })
}

const userIcon = L.divIcon({
  className: '',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  html: '<div style="width:16px;height:16px;border-radius:50%;background:#2563eb;border:3px solid #fff;box-shadow:0 0 0 4px rgba(37,99,235,.25)"></div>',
})

/** Map of venues (Explore) or a single draggable pin (venue settings) */
export default function VenueMap({ center, zoom = 13, pins, user, onPinClick, draggable, onMove, height = 320, fitToPins }: {
  center: { lat: number; lng: number }
  zoom?: number
  pins: MapPin[]
  /** Player's location, shown as a blue dot */
  user?: { lat: number; lng: number }
  onPinClick?: (id: string) => void
  draggable?: boolean
  onMove?: (lat: number, lng: number) => void
  height?: number | string
  /** Zoom to show every pin (and the user) instead of centring on `center` */
  fitToPins?: boolean
}) {
  const { theme } = useAppState()
  const el = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const layer = useRef<L.LayerGroup | null>(null)
  // Keep the latest callbacks without re-creating markers
  const handlers = useRef({ onPinClick, onMove })
  useEffect(() => {
    handlers.current = { onPinClick, onMove }
  })

  // Create the map once
  useEffect(() => {
    if (!el.current || map.current) return
    map.current = L.map(el.current, { zoomControl: true, attributionControl: true, scrollWheelZoom: false }).setView([center.lat, center.lng], zoom)
    L.tileLayer(TILE_URL, { attribution: ATTRIBUTION, maxZoom: 19 }).addTo(map.current)
    layer.current = L.layerGroup().addTo(map.current)
    return () => {
      map.current?.remove()
      map.current = null
      layer.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Tiles are dimmed and inverted in dark mode
  useEffect(() => {
    const pane = map.current?.getPane('tilePane')
    if (pane) pane.style.filter = theme === 'dark' ? DARK_FILTER : ''
  }, [theme])

  // Pins
  useEffect(() => {
    if (!layer.current) return
    layer.current.clearLayers()
    for (const pin of pins) {
      const marker = L.marker([pin.lat, pin.lng], { icon: pinIcon(pin), draggable, title: pin.label, keyboard: true })
      marker.on('click', () => handlers.current.onPinClick?.(pin.id))
      marker.on('dragend', () => {
        const { lat, lng } = marker.getLatLng()
        handlers.current.onMove?.(Math.round(lat * 1e5) / 1e5, Math.round(lng * 1e5) / 1e5)
      })
      marker.addTo(layer.current)
    }
    if (user) L.marker([user.lat, user.lng], { icon: userIcon, interactive: false }).addTo(layer.current)
  }, [pins, user, draggable])

  // Show every venue at once when asked
  const pinKey = pins.map(p => `${p.id}:${p.lat},${p.lng}`).join('|')
  useEffect(() => {
    if (!map.current || !fitToPins || pins.length === 0) return
    const points: L.LatLngTuple[] = pins.map(p => [p.lat, p.lng])
    if (user) points.push([user.lat, user.lng])
    map.current.fitBounds(L.latLngBounds(points), { padding: [48, 48], maxZoom: 15 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitToPins, pinKey])

  // Recentre when asked (e.g. selecting a venue)
  useEffect(() => {
    if (!fitToPins) map.current?.panTo([center.lat, center.lng])
  }, [center.lat, center.lng, fitToPins])

  return <div ref={el} style={{ height, width: '100%', zIndex: 0, background: 'var(--color-surface-2)' }} role="application" aria-label="Map of venues" />
}
