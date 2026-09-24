import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { AppStateProvider } from './AppState'
import { routes } from './routes'
import { sessionForPhone } from '../mocks/data'
import type { Session } from '../types'

function renderAt(path: string, session?: Session) {
  if (session) localStorage.setItem('turf.session', JSON.stringify(session))
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(<AppStateProvider><RouterProvider router={router} /></AppStateProvider>)
  return router
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
