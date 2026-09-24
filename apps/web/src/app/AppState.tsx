import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import type { Session } from '../types'

type Theme = 'light' | 'dark'

interface AppState {
  session: Session | null
  signIn: (s: Session) => void
  signOut: () => void
  theme: Theme
  toggleTheme: () => void
}

const AppStateContext = createContext<AppState | null>(null)

// Stored on this device only so a refresh keeps you signed in. The real app
// will use httpOnly session cookies from the API instead.
const SESSION_KEY = 'turf.session'
const THEME_KEY = 'turf.theme'

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function write(key: string, value: unknown) {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage unavailable (private mode): state just won't survive a refresh
  }
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => read<Session>(SESSION_KEY))
  const [theme, setTheme] = useState<Theme>(() => read<Theme>(THEME_KEY) ?? 'light')

  const signIn = useCallback((s: Session) => {
    write(SESSION_KEY, s)
    setSession(s)
  }, [])

  const signOut = useCallback(() => {
    write(SESSION_KEY, null)
    setSession(null)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(t => {
      const next = t === 'light' ? 'dark' : 'light'
      write(THEME_KEY, next)
      return next
    })
  }, [])

  return (
    <AppStateContext.Provider value={{ session, signIn, signOut, theme, toggleTheme }}>
      {children}
    </AppStateContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAppState() {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState must be used inside AppStateProvider')
  return ctx
}
