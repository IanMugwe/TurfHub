import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Toggle from './Toggle'

describe('Toggle', () => {
  it('reports the new value when clicked', async () => {
    const onChange = vi.fn()
    render(<Toggle on={false} onChange={onChange} label="Repeat weekly" />)
    await userEvent.click(screen.getByRole('switch', { name: 'Repeat weekly' }))
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('is a read-only indicator without onChange', () => {
    render(<Toggle on label="Dark mode" />)
    const sw = screen.getByRole('switch', { name: 'Dark mode' })
    expect(sw).toHaveAttribute('aria-checked', 'true')
    expect(sw.tagName).toBe('DIV')
  })
})
