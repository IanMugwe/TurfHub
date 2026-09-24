import { describe, expect, it } from 'vitest'
import { loadEnv } from './env.js'

const valid = { DATABASE_URL: 'postgresql://turf:turf@localhost:5432/turf', REDIS_URL: 'redis://localhost:6379' }

describe('loadEnv', () => {
  it('applies defaults', () => {
    expect(loadEnv(valid)).toEqual({ ...valid, NODE_ENV: 'development', API_PORT: 3000, LOG_LEVEL: 'info' })
  })

  it('lists every problem in one clear error', () => {
    expect(() => loadEnv({ DATABASE_URL: 'mysql://x', API_PORT: 'abc' })).toThrow(/DATABASE_URL[\s\S]*REDIS_URL|REDIS_URL[\s\S]*DATABASE_URL/)
  })
})
