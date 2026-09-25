import { describe, expect, it } from 'vitest'
import { cleanup, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderRoutes } from '../test/render'
import { routes } from './routes'
import { sessionForPhone } from '../mocks/data'
import { dayOfMonth, formatDayWithYear, todayKey } from '../lib/dates'
import type { Session } from '../types'

const OWNER = sessionForPhone('+254 722 000 111')
const PLAYER = sessionForPhone('+254 712 345 678')
const renderAt = (path: string, session?: Session) => renderRoutes(routes, path, session)

// The investor-demo story: changes stick and show up everywhere
describe('demo data flows', () => {
  it('saves a walk-in booking and shows it on the calendar', async () => {
    const user = userEvent.setup()
    renderAt('/v/greenfield/calendar?new=1&turf=B&start=15:00', OWNER)
    const sheet = await screen.findByRole('dialog', { name: 'New booking' })
    await user.type(within(sheet).getByPlaceholderText('Brian Otieno'), 'Grace Wanjiku')
    await user.click(within(sheet).getByRole('button', { name: 'Save booking' }))
    expect(await screen.findByText('Booked Grace Wanjiku · Pitch B 15:00')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByText('Grace')).toBeInTheDocument()
  })

  it('records an M-Pesa payment and marks the booking paid', async () => {
    const user = userEvent.setup()
    renderAt('/v/greenfield/today?booking=TRF-9M2X', OWNER)
    const sheet = await screen.findByRole('dialog', { name: 'Booking TRF-9M2X' })
    await user.click(within(sheet).getByRole('button', { name: 'Record payment' }))
    await user.click(within(sheet).getByRole('button', { name: '📱 M-Pesa' }))
    await user.type(within(sheet).getByPlaceholderText(/M-Pesa code/), 'sij4x8y2zq')
    await user.click(within(sheet).getByRole('button', { name: 'Save payment' }))
    expect(within(sheet).getByText('Paid ✓')).toBeInTheDocument()
    expect(within(sheet).getByText('SIJ4X8Y2ZQ', { exact: false })).toBeInTheDocument()
    expect(within(sheet).queryByRole('button', { name: 'Record payment' })).not.toBeInTheDocument()
  })

  it('cancels a booking and removes it from the calendar', async () => {
    const user = userEvent.setup()
    renderAt('/v/greenfield/calendar?booking=TRF-8W1P', OWNER)
    const sheet = await screen.findByRole('dialog', { name: 'Booking TRF-8W1P' })
    await user.click(within(sheet).getByRole('button', { name: 'Cancel booking' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(screen.queryByText('Team')).not.toBeInTheDocument()
  })

  it("sends a player's booking to the owner as a request", async () => {
    const user = userEvent.setup()
    renderAt('/venues/greenfield-arena', PLAYER)
    await user.click(await screen.findByRole('button', { name: '16:00' }))
    await user.click(screen.getByRole('button', { name: 'Book this slot' }))
    // Signed-in players don't retype their details
    expect(screen.getByDisplayValue('Brian Otieno')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Confirm booking' }))
    await user.click(await screen.findByRole('button', { name: 'View my bookings' }))
    expect(await screen.findByText('16:00–17:00')).toBeInTheDocument()

    // Same browser, owner's side
    cleanup()
    renderAt('/v/greenfield/requests', OWNER)
    const card = (await screen.findAllByText('Brian Otieno'))[0].closest('div[style]')!.parentElement!.parentElement!
    expect(card).toHaveTextContent('16:00–17:00')
  })

  it('does not let players book hours that have already passed today', async () => {
    renderAt('/venues/greenfield-arena', PLAYER)
    expect(await screen.findByRole('button', { name: '09:00' })).toBeDisabled()
  })
})

describe('dates follow the real calendar', () => {
  it("shows today's date on Today and selects today in the calendar", async () => {
    renderAt('/v/greenfield/today', OWNER)
    expect(await screen.findByText(formatDayWithYear(todayKey()))).toBeInTheDocument()
    cleanup()
    renderAt('/v/greenfield/calendar', OWNER)
    expect(await screen.findByRole('button', { name: new RegExp(`\\s*${dayOfMonth(todayKey())}$`) })).toHaveStyle({ background: 'var(--color-primary)' })
  })

  it('starts fresh when saved demo data is from an earlier day', async () => {
    localStorage.setItem('turf.demo.v1', JSON.stringify({ seededOn: '2000-01-01', bookings: [], playerBookings: [], autoConfirm: false, seq: 1 }))
    renderAt('/v/greenfield/today', OWNER)
    expect(await screen.findByText('Faith Wanjiru')).toBeInTheDocument()
  })
})
