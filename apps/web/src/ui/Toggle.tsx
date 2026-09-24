/** On/off switch. Without onChange it renders as a non-interactive indicator (e.g. inside a clickable row). */
export default function Toggle({ on, onChange, label }: { on: boolean; onChange?: (on: boolean) => void; label?: string }) {
  const track = { width: 44, height: 26, borderRadius: 13, background: on ? 'var(--color-primary)' : 'var(--color-border)', position: 'relative', transition: 'background 0.2s', flexShrink: 0 } as const
  const knob = <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: on ? 20 : 2, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />

  if (!onChange) return <div role="switch" aria-checked={on} aria-label={label} style={track}>{knob}</div>
  return (
    <button role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} style={{ ...track, border: 'none', cursor: 'pointer' }}>
      {knob}
    </button>
  )
}
