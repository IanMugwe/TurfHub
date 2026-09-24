import { describe, expect, it } from 'vitest'
import { describeError } from './describe-error.js'

describe('describeError', () => {
  it('uses the first line of a normal message', () => {
    expect(describeError(new Error('boom\nstack-ish detail'))).toBe('boom')
  })

  it('unwraps AggregateError from dual-stack connection attempts', () => {
    const inner = Object.assign(new Error('connect ECONNREFUSED ::1:5432'), { code: 'ECONNREFUSED' })
    expect(describeError(new AggregateError([inner], ''))).toBe('connect ECONNREFUSED ::1:5432')
  })

  it('follows cause, then falls back to the error code', () => {
    expect(describeError(new Error('', { cause: new Error('socket hang up') }))).toBe('socket hang up')
    expect(describeError(Object.assign(new Error(''), { code: 'ECONNREFUSED' }))).toBe('ECONNREFUSED')
  })
})
