import { phoneToParam } from '@turfhub/validation'
import { CUSTOMERS } from '../mocks/data'
import { balanceOf } from '../lib/bookings'
import type { Customer } from '../types'
import { useDemoStore } from './DemoStore'

/** Known customers plus anyone booked during the demo (walk-ins, new players) */
export function useCustomers(): Customer[] {
  const { bookings } = useDemoStore()
  const known = new Set(CUSTOMERS.map(c => c.name))
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
  return [...[...added.values()].reverse(), ...CUSTOMERS]
}

export function useCustomerByPhoneParam(param: string) {
  return useCustomers().find(c => phoneToParam(c.phone) === param)
}
