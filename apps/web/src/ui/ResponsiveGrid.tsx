import type { ReactNode } from 'react'
import { useIsDesktop } from '../lib/useIsDesktop'

/** A plain stack on phones; a grid of cards at least `min` px wide on desktop */
export default function ResponsiveGrid({ min = 320, gap = 14, children }: { min?: number; gap?: number; children: ReactNode }) {
  const desktop = useIsDesktop()
  if (!desktop) return <div>{children}</div>
  return <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${min}px, 1fr))`, columnGap: gap, alignItems: 'start' }}>{children}</div>
}
