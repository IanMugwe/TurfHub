import path from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { config } from 'dotenv'
import { createApp } from '../src/app.factory.js'
import { loadEnv } from '../src/config/env.js'

config({ path: path.resolve(import.meta.dirname, '../../../.env'), quiet: true })

// Needs the real database and Redis: `pnpm db:up` locally; CI sets RUN_INTEGRATION=1
describe.runIf(process.env.RUN_INTEGRATION === '1')('health against real Postgres and Redis', () => {
  let app: INestApplication

  beforeAll(async () => {
    app = await createApp({ ...loadEnv(), NODE_ENV: 'test' }, { logger: false })
    await app.init()
  })

  afterAll(async () => { await app?.close() })

  it('reports everything up, with PostGIS installed by the first migration', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/health').expect(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.checks.database.postgis).toMatch(/^\d+\.\d+/)
    expect(res.body.checks.redis.status).toBe('up')
  })
})
