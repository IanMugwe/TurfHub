import { describe, expect, it } from 'vitest'
import { formatKES, formatPhoneKE, normalizePhoneKE, phoneToParam } from './format.js'

describe('formatKES', () => {
  it('groups thousands and prefixes the currency', () => {
    expect(formatKES(2500)).toBe('KES 2,500')
    expect(formatKES(111000)).toBe('KES 111,000')
    expect(formatKES(0)).toBe('KES 0')
  })
})

describe('normalizePhoneKE', () => {
  it.each([
    ['0712 345 678', '+254712345678'],
    ['+254 712 345 678', '+254712345678'],
    ['254712345678', '+254712345678'],
    ['712345678', '+254712345678'],
    ['0110 123 456', '+254110123456'],
  ])('%s → %s', (input, expected) => {
    expect(normalizePhoneKE(input)).toBe(expected)
  })

  it('rejects numbers that are not Kenyan mobiles', () => {
    expect(normalizePhoneKE('12345')).toBeNull()
    expect(normalizePhoneKE('+1 415 555 0100')).toBeNull()
  })
})

describe('formatPhoneKE', () => {
  it('spaces the number as +254 712 345 678', () => {
    expect(formatPhoneKE('0712345678')).toBe('+254 712 345 678')
  })
})

describe('phoneToParam', () => {
  it('turns a display number into a URL segment', () => {
    expect(phoneToParam('+254 756 789 012')).toBe('254756789012')
  })
})
