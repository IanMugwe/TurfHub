import { useSyncExternalStore } from 'react'

/** Width at which the app switches from the phone layout to the desktop layout */
export const DESKTOP_QUERY = '(min-width: 900px)'

function subscribe(onChange: () => void) {
  if (typeof window.matchMedia !== 'function') return () => {}
  const mq = window.matchMedia(DESKTOP_QUERY)
  mq.addEventListener('change', onChange)
  return () => mq.removeEventListener('change', onChange)
}

function getSnapshot() {
  return typeof window.matchMedia === 'function' && window.matchMedia(DESKTOP_QUERY).matches
}

/** True on laptop/desktop widths. Phones and tablets get the phone layout. */
export function useIsDesktop() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
