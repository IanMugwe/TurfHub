export default function EmptyState({ icon, title, message, action, onAction }: {
  icon: string
  title: string
  message: string
  action?: string
  onAction?: () => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '40px 24px' }}>
      <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, marginBottom: 16 }}>
        {icon}
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 14, color: 'var(--color-muted)', lineHeight: 1.5, maxWidth: 280, marginBottom: action ? 20 : 0 }}>{message}</div>
      {action && (
        <button onClick={onAction}
          style={{ padding: '12px 22px', borderRadius: 12, border: 'none', background: 'var(--color-primary)', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', minHeight: 44 }}>
          {action}
        </button>
      )}
    </div>
  )
}
