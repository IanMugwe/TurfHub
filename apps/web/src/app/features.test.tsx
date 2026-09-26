import { describe, expect, it, vi } from 'vitest'
import { cleanup, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderRoutes } from '../test/render'
import { routes } from './routes'
import { sessionForPhone } from '../mocks/data'
import type { Session } from '../types'

const OWNER = sessionForPhone('+254 722 000 111')
const PLAYER = sessionForPhone('+254 712 345 678')
const renderAt = (path: string, session?: Session) => renderRoutes(routes, path, session)

describe('booking changes', () => {
  it('moves a booking to a free time', async () => {
    const user = userEvent.setup()
    renderAt('/v/greenfield/today?booking=TRF-9M2X', OWNER)
    const sheet = await screen.findByRole('dialog', { name: 'Booking TRF-9M2X' })
    await user.click(within(sheet).getByRole('button', { name: 'Move' }))
    await user.click(within(sheet).getByRole('button', { name: '15:00' }))
    await user.click(within(sheet).getByRole('button', { name: 'Move booking' }))
    expect(await screen.findByText(/^Moved to .* Pitch B 15:00$/)).toBeInTheDocument()
    expect(within(sheet).getByText('15:00–16:00')).toBeInTheDocument()
  })

  it('extends a booking and reprices it', async () => {
    const user = userEvent.setup()
    renderAt('/v/greenfield/today?booking=TRF-5L3N', OWNER)
    const sheet = await screen.findByRole('dialog', { name: 'Booking TRF-5L3N' })
    await user.click(within(sheet).getByRole('button', { name: 'Extend' }))
    await user.click(within(sheet).getByRole('button', { name: /\+1 hour/ }))
    await user.click(within(sheet).getByRole('button', { name: 'Extend booking' }))
    expect(await screen.findByText('Extended to 19:00 · now KES 7,000')).toBeInTheDocument()
  })
})

describe('venue settings', () => {
  it('uses new prices for new bookings', async () => {
    const user = userEvent.setup()
    renderAt('/v/greenfield/settings/pricing', OWNER)
    const peak = await screen.findByLabelText('Pitch A peak price')
    await user.clear(peak)
    await user.type(peak, '4200')
    await user.click(screen.getByRole('button', { name: 'Save pricing' }))
    cleanup()
    renderAt('/v/greenfield/calendar?new=1&turf=A&start=20:00', OWNER)
    const sheet = await screen.findByRole('dialog', { name: 'New booking' })
    expect(sheet).toHaveTextContent('KES 4,200')
  })

  it("won't block time that already has bookings", async () => {
    renderAt('/v/greenfield/settings/blocked', OWNER)
    // Default: whole venue, today, 10:00–12:00 — Faith is booked at 10:00
    expect(await screen.findByText(/booking.* in this time/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Block 10:00–12:00/ })).toBeDisabled()
  })

  it('invites a manager who can then sign in to the staff app', async () => {
    const user = userEvent.setup()
    renderAt('/v/greenfield/settings/team?invite=1', OWNER)
    const sheet = await screen.findByRole('dialog', { name: 'Invite a team member' })
    await user.type(within(sheet).getByPlaceholderText('Achieng Odhiambo'), 'Grace Muthoni')
    const phone = within(sheet).getByDisplayValue('+254')
    await user.clear(phone)
    await user.type(phone, '0799 111 222')
    await user.click(within(sheet).getByRole('button', { name: 'Send invite' }))
    expect(await screen.findByText('Invite sent by SMS to +254 799 111 222')).toBeInTheDocument()

    localStorage.removeItem('turf.session')
    cleanup()
    const router = renderAt('/login')
    await user.type(screen.getByPlaceholderText('712 345 678'), '799111222')
    await user.click(screen.getByRole('button', { name: 'Send code' }))
    const boxes = await screen.findAllByRole('textbox')
    for (const [i, d] of [...'123456'].entries()) await user.type(boxes[i], d)
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/v/greenfield/today'))
    expect(screen.queryByRole('button', { name: 'Reports' })).not.toBeInTheDocument()
  })

  it('lists a new venue and switches to it', async () => {
    const user = userEvent.setup()
    const router = renderAt('/v/greenfield/settings/new-venue', OWNER)
    await user.type(await screen.findByPlaceholderText('e.g. Karen Turf Club'), 'Karen Turf Club')
    await user.type(screen.getByPlaceholderText('Karen, Nairobi'), 'Karen, Nairobi')
    await user.click(screen.getByRole('button', { name: 'List venue' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/v/karen-turf-club/today'))
    expect(await screen.findByText('Karen Turf Club')).toBeInTheDocument()

    // Both venues are in the switcher
    await user.click(screen.getByRole('button', { name: 'Switch venue' }))
    const switcher = await screen.findByRole('dialog', { name: 'Your venues' })
    expect(within(switcher).getByText('Greenfield Arena')).toBeInTheDocument()
    expect(within(switcher).getByText('Pending approval')).toBeInTheDocument()
  })
})

describe('reports', () => {
  it('switches ranges and exports CSV', async () => {
    const user = userEvent.setup()
    const createObjectURL = vi.fn(() => 'blob:test')
    vi.stubGlobal('URL', Object.assign(URL, { createObjectURL, revokeObjectURL: vi.fn() }))
    renderAt('/v/greenfield/reports', OWNER)
    const weekTotal = (await screen.findByText(/^Total collected/)).parentElement!.textContent
    await user.click(screen.getByRole('button', { name: 'This month' }))
    expect(screen.getByRole('button', { name: 'This month' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText(/^Total collected/).parentElement!.textContent).not.toBe(weekTotal)
    await user.click(screen.getByRole('button', { name: /^Export CSV/ }))
    expect(createObjectURL).toHaveBeenCalled()
    expect(await screen.findByText(/^Exported \d+ bookings to CSV$/)).toBeInTheDocument()
    vi.unstubAllGlobals()
  })
})

describe('player features', () => {
  it('filters venues by price', async () => {
    const user = userEvent.setup()
    renderAt('/explore', PLAYER)
    expect(await screen.findByText('Lavington Sports Centre')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Price/ }))
    await user.click(await screen.findByRole('button', { name: 'Up to KES 2,500' }))
    await waitFor(() => expect(screen.queryByText('Lavington Sports Centre')).not.toBeInTheDocument())
    expect(screen.getByText('Greenfield Arena')).toBeInTheDocument()
  })

  it('opens the right venue from Explore', async () => {
    const user = userEvent.setup()
    const router = renderAt('/explore', PLAYER)
    await user.click(await screen.findByText('Westlands Turf'))
    await waitFor(() => expect(router.state.location.pathname).toBe('/venues/westlands-turf'))
    expect(await screen.findByText('Ring Road Parklands, behind Sarit Centre', { exact: false })).toBeInTheDocument()
  })

  it('saves a favourite that shows on the profile', async () => {
    const user = userEvent.setup()
    renderAt('/venues/westlands-turf', PLAYER)
    await user.click(await screen.findByRole('button', { name: 'Add to favourites' }))
    expect(await screen.findByText('Saved Westlands Turf to favourites')).toBeInTheDocument()
    cleanup()
    renderAt('/profile', PLAYER)
    expect(await screen.findByText('Westlands Turf')).toBeInTheDocument()
  })

  it('posts a review that appears on the venue page', async () => {
    const user = userEvent.setup()
    renderAt('/bookings', PLAYER)
    await user.click(await screen.findByRole('button', { name: 'past' }))
    await user.click((await screen.findAllByRole('button', { name: '★ Leave a review' }))[0])
    const sheet = await screen.findByRole('dialog', { name: /^Review / })
    await user.click(within(sheet).getByRole('radio', { name: '5 stars' }))
    await user.type(within(sheet).getByPlaceholderText(/What should other players know/), 'Lovely pitch, great lights')
    await user.click(within(sheet).getByRole('button', { name: 'Post review' }))
    expect(await screen.findByText(/You rated this/)).toBeInTheDocument()
    cleanup()
    renderAt('/venues/greenfield-arena', PLAYER)
    expect(await screen.findByText('Lovely pitch, great lights')).toBeInTheDocument()
  })
})
