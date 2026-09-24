import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { healthResponseSchema } from '@turfhub/validation'
import { AppModule } from '../src/app.module.js'
import { configureApp } from '../src/app.factory.js'
import { PrismaService } from '../src/database/prisma.service.js'
import { RedisService } from '../src/redis/redis.service.js'

// HTTP behaviour with the database and Redis replaced by fakes
describe('API over HTTP', () => {
  let app: INestApplication
  let redisUp = true

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule.register({ NODE_ENV: 'test', API_PORT: 0, DATABASE_URL: 'postgresql://x@localhost/x', REDIS_URL: 'redis://localhost:1', LOG_LEVEL: 'error' })],
    })
      .overrideProvider(PrismaService).useValue({ client: { $queryRaw: async () => [{ extversion: '3.5.2' }] } })
      .overrideProvider(RedisService).useValue({ lastError: null, client: { get status() { return redisUp ? 'ready' : 'reconnecting' }, ping: async () => { if (!redisUp) throw new Error('Connection is closed.'); return 'PONG' } } })
      .compile()
    app = configureApp(moduleRef.createNestApplication({ logger: false }))
    await app.init()
  })

  afterAll(async () => { await app?.close() })

  it('GET /api/v1/health returns 200 and the documented shape', async () => {
    redisUp = true
    const res = await request(app.getHttpServer()).get('/api/v1/health').expect(200)
    expect(healthResponseSchema.parse(res.body).status).toBe('ok')
    expect(res.headers['cache-control']).toBe('no-store')
  })

  it('returns 503 when a dependency is down', async () => {
    redisUp = false
    const res = await request(app.getHttpServer()).get('/api/v1/health').expect(503)
    expect(res.body.status).toBe('degraded')
    expect(res.body.checks.redis).toMatchObject({ status: 'down', error: 'not connected' })
  })

  it('answers unknown routes in the standard error format', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/nope').expect(404)
    expect(res.body).toEqual({ code: 'NOT_FOUND', message: expect.any(String) })
  })

  it('tags every response with a request id, reusing a valid incoming one', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/health').set('x-request-id', 'test-123')
    expect(res.headers['x-request-id']).toBe('test-123')
    const generated = await request(app.getHttpServer()).get('/api/v1/health')
    expect(generated.headers['x-request-id']).toMatch(/^[0-9a-f-]{36}$/)
  })

  it('does not advertise Express', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/health')
    expect(res.headers['x-powered-by']).toBeUndefined()
  })
})
