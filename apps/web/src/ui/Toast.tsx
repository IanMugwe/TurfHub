import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { useIsDesktop } from '../lib/useIsDesktop'

type Toast = { id: number; message: string }

const ToastContext = createContext<(message: string) => void>(() => {})

/** Short confirmation messages ("Payment recorded") that fade after a few seconds */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const desktop = useIsDesktop()

  const show = useCallback((message: string) => {
    clearTimeout(timer.current)
    setToast({ id: Date.now(), message })
    timer.current = setTimeout(() => setToast(null), 2600)
  }, [])
  useEffect(() => () => clearTimeout(timer.current), [])

  return (
    <ToastContext.Provider value={show}>
      {children}
      {toast && (
        <div role="status" key={toast.id}
          style={{ position: 'fixed', left: '50%', transform: 'translateX(-50%)', bottom: desktop ? 32 : 92, zIndex: 500, maxWidth: 'calc(100vw - 32px)', background: 'var(--color-text)', color: 'var(--color-surface)', borderRadius: 10, padding: '10px 16px', fontSize: 14, fontWeight: 500, boxShadow: '0 8px 24px rgba(0,0,0,0.2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  return useContext(ToastContext)
}
