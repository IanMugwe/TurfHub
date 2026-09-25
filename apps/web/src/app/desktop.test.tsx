import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderRoutes } from '../test/render'
import { routes } from './routes'
import { sessionForPhone } from '../mocks/data'
import type { Session } from '../types'

function renderAt(path: string, session?: Session) {
  return renderRoutes(routes, path, session)
}

describe('desktop layout', () => {
  beforeEach(() => {
    // Pretend the screen is desktop-wide
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: true, media: query, addEventListener: () => {}, removeEventListener: () => {},
    }))
  })
  afterEach(() => vi.unstubAllGlobals())

  it('shows a website header with page links instead of the tab bar', async () => {
    renderAt('/v/greenfield/today', sessionForPhone('+254 722 000 111'))
    const header = await screen.findByRole('banner')
    expect(within(header).getByRole('button', { name: '+ New booking' })).toBeInTheDocument()
    expect(within(header).getByRole('button', { name: 'Reports' })).toBeInTheDocument()
    expect(within(header).getByText('James Kariuki')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toHaveTextContent('© 2026 Turf') // footer
    expect(screen.queryByRole('button', { name: 'New booking' })).not.toBeInTheDocument() // no floating + button
  })

  it('signs out from the account menu', async () => {
    const user = userEvent.setup()
    const router = renderAt('/v/greenfield/today', sessionForPhone('+254 722 000 111'))
    await user.click(await screen.findByRole('button', { name: /James Kariuki/ }))
    await user.click(screen.getByRole('menuitem', { name: 'Sign out' }))
    expect(router.state.location.pathname).toBe('/login')
  })

  it('hides Reports from managers in the header too', async () => {
    renderAt('/v/greenfield/today', sessionForPhone('+254 733 000 222'))
    const header = await screen.findByRole('banner')
    expect(within(header).queryByRole('button', { name: 'Reports' })).not.toBeInTheDocument()
  })

  it('opens booking details as a centred dialog', async () => {
    renderAt('/v/greenfield/today?booking=TRF-4K7Q', sessionForPhone('+254 722 000 111'))
    const dialog = await screen.findByRole('dialog', { name: 'Booking TRF-4K7Q' })
    expect(dialog).toHaveStyle({ maxWidth: '480px' })
  })

  it('gives players the website header on Explore', async () => {
    renderAt('/explore', sessionForPhone('+254 712 345 678'))
    const header = await screen.findByRole('banner')
    expect(within(header).getByRole('button', { name: 'My Bookings' })).toBeInTheDocument()
  })
})

describe('API status in the desktop footer', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', (query: string) => ({ matches: true, media: query, addEventListener: () => {}, removeEventListener: () => {} }))
  })
  afterEach(() => vi.unstubAllGlobals())

  const health = (status: 'ok' | 'degraded', httpStatus: number) => vi.fn(async () => new Response(JSON.stringify({
    status, version: '0.1.0', uptimeSeconds: 5, time: new Date().toISOString(),
    checks: { database: { status: 'up', latencyMs: 2, postgis: '3.5.2' }, redis: { status: status === 'ok' ? 'up' : 'down', latencyMs: status === 'ok' ? 1 : null } },
  }), { status: httpStatus, headers: { 'Content-Type': 'application/json' } }))

  it('shows the API as online', async () => {
    vi.stubGlobal('fetch', health('ok', 200))
    renderAt('/login')
    expect(await screen.findByText('All systems normal')).toBeInTheDocument()
  })

  // Visitors never see a warning: the app keeps working on local demo data without the API
  it('shows nothing when the API is degraded', async () => {
    const fetch = health('degraded', 503)
    vi.stubGlobal('fetch', fetch)
    renderAt('/login')
    await waitFor(() => expect(fetch).toHaveBeenCalled())
    await new Promise(r => setTimeout(r, 50))
    expect(within(screen.getByRole('contentinfo')).queryByRole('status')).not.toBeInTheDocument()
  })

  it('shows nothing when the API cannot be reached', async () => {
    const fetch = vi.fn(async () => { throw new TypeError('Failed to fetch') })
    vi.stubGlobal('fetch', fetch)
    renderAt('/login')
    await waitFor(() => expect(fetch).toHaveBeenCalled())
    await new Promise(r => setTimeout(r, 50))
    expect(screen.getByRole('contentinfo')).not.toHaveTextContent(/offline|degraded/i)
  })
})
