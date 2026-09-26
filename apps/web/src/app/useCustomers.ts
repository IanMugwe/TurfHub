import { phoneToParam } from '@turfhub/validation'
import { CUSTOMERS, GREENFIELD_ID } from '../mocks/data'
import { balanceOf } from '../lib/bookings'
import type { Customer } from '../types'
import { useDemoStore } from './DemoStore'

/** A venue's customers: Greenfield's regulars plus anyone booked at the venue during the demo */
export function useCustomers(venueId = GREENFIELD_ID): Customer[] {
  const { bookings: all } = useDemoStore()
  const bookings = all.filter(b => b.venueId === venueId)
  const regulars = venueId === GREENFIELD_ID ? CUSTOMERS : []
  const known = new Set(regulars.map(c => c.name))
  const added = new Map<string, Customer>()
  for (const b of [...bookings].sort((a, z) => a.dateKey.localeCompare(z.dateKey))) {
    if (known.has(b.customer) || !b.customer) continue
    const c = added.get(b.customer) ?? { name: b.customer, phone: b.phone, visits: 0, lastVisit: b.date, totalPaid: 0, unpaid: 0, noShows: 0 }
    c.visits += b.status === 'cancelled' ? 0 : 1
    c.lastVisit = b.date
    c.totalPaid += b.paid
    c.unpaid += b.status === 'cancelled' ? 0 : balanceOf(b)
    c.noShows += b.status === 'noshow' ? 1 : 0
    added.set(b.customer, c)
  }
  // Newest customers first, so a walk-in you just added is easy to find
  return [...[...added.values()].reverse(), ...regulars]
}

export function useCustomerByPhoneParam(param: string, venueId?: string) {
  return useCustomers(venueId).find(c => phoneToParam(c.phone) === param)
}
