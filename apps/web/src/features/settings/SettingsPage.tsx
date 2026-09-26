import type { ReactNode } from 'react'
import PageHeader from '../../ui/PageHeader'
import { useIsDesktop } from '../../lib/useIsDesktop'

/** Layout for a settings sub-page: back to More, title, and a comfortably narrow body on desktop */
export default function SettingsPage({ title, subtitle, onBack, action, children }: {
  title: string
  subtitle?: string
  onBack: () => void
  action?: ReactNode
  children: ReactNode
}) {
  const desktop = useIsDesktop()
  return (
    <div>
      <PageHeader back="More" onBack={onBack} title={title} subtitle={subtitle} action={action} />
      <div style={desktop ? { padding: '8px 32px 40px', maxWidth: 760 } : { padding: '14px 16px 40px' }}>
        {children}
      </div>
    </div>
  )
}
