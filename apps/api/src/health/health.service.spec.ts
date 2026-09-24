import { describe, expect, it } from 'vitest'
import { healthResponseSchema } from '@turfhub/validation'
import { HealthService } from './health.service.js'
import type { PrismaService } from '../database/prisma.service.js'
import type { RedisService } from '../redis/redis.service.js'

function service({ db, redis }: { db: () => Promise<unknown>; redis: () => Promise<unknown> }) {
  const prisma = { client: { $queryRaw: db } } as unknown as PrismaService
  const redisService = { client: { status: 'ready', ping: redis } } as unknown as RedisService
  return new HealthService(prisma, redisService)
}

describe('HealthService', () => {
  it('reports ok with latencies and the PostGIS version when everything is up', async () => {
    const result = await service({ db: async () => [{ extversion: '3.5.2' }], redis: async () => 'PONG' }).check()
    expect(healthResponseSchema.parse(result)).toBeTruthy()
    expect(result.status).toBe('ok')
    expect(result.checks.database).toMatchObject({ status: 'up', postgis: '3.5.2' })
    expect(result.checks.redis.status).toBe('up')
  })

  it('reports degraded and why when the database is down', async () => {
    const result = await service({ db: async () => { throw new Error('connect ECONNREFUSED 127.0.0.1:5432') }, redis: async () => 'PONG' }).check()
    expect(result.status).toBe('degraded')
    expect(result.checks.database).toEqual({ status: 'down', latencyMs: null, error: 'connect ECONNREFUSED 127.0.0.1:5432', postgis: null })
  })

  it('reports PostGIS as missing when the extension is not installed', async () => {
    const result = await service({ db: async () => [], redis: async () => 'PONG' }).check()
    expect(result.checks.database.postgis).toBeNull()
  })

  it('gives up on a hanging dependency after the timeout', async () => {
    const result = await service({ db: async () => [{ extversion: '3.5' }], redis: () => new Promise(() => {}) }).check()
    expect(result.checks.redis).toMatchObject({ status: 'down', error: 'timed out after 2000ms' })
  }, 5000)
})
