import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderRoutes } from '../test/render'
import { routes } from './routes'
import { sessionForPhone } from '../mocks/data'
import type { Session } from '../types'

const OWNER = sessionForPhone('+254 722 000 111')
const MANAGER = sessionForPhone('+254 733 000 222')
const PLAYER = sessionForPhone('+254 712 345 678')

function renderAt(path: string, session?: Session) {
  return renderRoutes(routes, path, session)
}

describe('routing', () => {
  it('sends signed-out visitors to sign in', async () => {
    const router = renderAt('/v/greenfield/today')
    expect(await screen.findByText('Sign in')).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/login')
  })

  it('signs an owner in with phone and code, landing on Today', async () => {
    const user = userEvent.setup()
    const router = renderAt('/login')
    await user.type(screen.getByPlaceholderText('712 345 678'), '722000111')
    await user.click(screen.getByRole('button', { name: 'Send code' }))
    const boxes = await screen.findAllByRole('textbox')
    for (const [i, digit] of [...'123456'].entries()) await user.type(boxes[i], digit)
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/v/greenfield/today'))
    expect(screen.getByRole('button', { name: 'Reports' })).toBeInTheDocument()
  })

  it('signs a manager in when the number is typed with a leading 0', async () => {
    const user = userEvent.setup()
    const router = renderAt('/login')
    await user.type(screen.getByPlaceholderText('712 345 678'), '0733000222')
    expect(screen.getByPlaceholderText('712 345 678')).toHaveValue('733 000 222')
    await user.click(screen.getByRole('button', { name: 'Send code' }))
    const boxes = await screen.findAllByRole('textbox')
    for (const [i, digit] of [...'123456'].entries()) await user.type(boxes[i], digit)
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/v/greenfield/today'))
    expect(screen.queryByRole('button', { name: 'Reports' })).not.toBeInTheDocument()
  })

  it('keeps managers out of Reports', async () => {
    const router = renderAt('/v/greenfield/reports', MANAGER)
    expect(await screen.findByRole('button', { name: 'Today' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/v/greenfield/today')
    expect(screen.queryByRole('button', { name: 'Reports' })).not.toBeInTheDocument()
  })

  it('sends players away from staff pages', async () => {
    const router = renderAt('/v/greenfield/today', PLAYER)
    expect(await screen.findByText('Find a pitch')).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/explore')
  })

  it('opens a booking sheet from the URL', async () => {
    renderAt('/v/greenfield/calendar?booking=TRF-4K7Q', OWNER)
    expect(await screen.findByRole('dialog', { name: 'Booking TRF-4K7Q' })).toBeInTheDocument()
  })

  it('prefills New booking from a tapped slot', async () => {
    renderAt('/v/greenfield/calendar?new=1&turf=C&start=18:00', OWNER)
    const sheet = await screen.findByRole('dialog', { name: 'New booking' })
    expect(sheet).toHaveTextContent('peak rate')
  })

  it('opens a customer by phone number', async () => {
    renderAt('/v/greenfield/customers/254756789012', OWNER)
    expect(await screen.findByText('Aisha Hassan')).toBeInTheDocument()
  })

  it('shows not found for unknown pages', async () => {
    renderAt('/nowhere', OWNER)
    expect(await screen.findByText('Page not found')).toBeInTheDocument()
  })
})

describe('sign-in bypass (VITE_OTP_MODE=skip)', () => {
  it('signs in straight from the phone number, without a code', async () => {
    vi.stubEnv('VITE_OTP_MODE', 'skip')
    vi.resetModules()
    const { routes: skipRoutes } = await import('./routes')
    const { AppStateProvider: Provider } = await import('./AppState')
    const user = userEvent.setup()
    const router = renderRoutes(skipRoutes, '/login', undefined, Provider)
    await user.type(screen.getByPlaceholderText('712 345 678'), '733000222')
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/v/greenfield/today'))
    vi.unstubAllEnvs()
  })
})
