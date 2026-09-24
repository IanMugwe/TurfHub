import type { ComponentProps, CSSProperties, ReactNode } from 'react'
import TopNav, { PAGE_MAX_WIDTH } from '../ui/TopNav'
import SiteFooter from '../ui/SiteFooter'

/** Desktop website frame: top navigation, a centred page, and a footer. The page scrolls as a normal document. */
export default function SiteShell<T extends string>({ nav, maxWidth = PAGE_MAX_WIDTH, children }: {
  nav: ComponentProps<typeof TopNav<T>>
  maxWidth?: number
  children: ReactNode
}) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopNav {...nav} />
      <main style={{ flex: 1, width: '100%', maxWidth, margin: '0 auto', '--frame-width': `${maxWidth}px` } as CSSProperties}>
        {children}
      </main>
      <SiteFooter />
    </div>
  )
}
