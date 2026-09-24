import { readFileSync } from 'node:fs'
import path from 'node:path'
import { Injectable } from '@nestjs/common'
import type { DependencyHealth, HealthResponse } from '@turfhub/validation'
import { PrismaService } from '../database/prisma.service.js'
import { RedisService } from '../redis/redis.service.js'
import { describeError } from '../common/describe-error.js'

const CHECK_TIMEOUT_MS = 2000

const VERSION: string = (() => {
  try {
    // dist/ and src/ both sit one level below the package root
    return JSON.parse(readFileSync(path.resolve(import.meta.dirname, '../../package.json'), 'utf8')).version
  } catch {
    return '0.0.0'
  }
})()

async function timed<T>(check: () => Promise<T>): Promise<{ result: T | null; health: DependencyHealth }> {
  const start = performance.now()
  try {
    const result = await Promise.race([
      check(),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error(`timed out after ${CHECK_TIMEOUT_MS}ms`)), CHECK_TIMEOUT_MS)),
    ])
    return { result, health: { status: 'up', latencyMs: Math.round(performance.now() - start) } }
  } catch (err) {
    // Only the message: connection errors can include hostnames but never credentials
    return { result: null, health: { status: 'down', latencyMs: null, error: describeError(err) } }
  }
}

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async check(): Promise<HealthResponse> {
    const [db, redis] = await Promise.all([
      timed(async () => {
        const rows = await this.prisma.client.$queryRaw<{ extversion: string }[]>`SELECT extversion FROM pg_extension WHERE extname = 'postgis'`
        return rows[0]?.extversion ?? null
      }),
      timed(() => {
        // Report why it's disconnected rather than ioredis's generic "stream isn't writeable"
        if (this.redis.client.status !== 'ready') throw new Error(`not connected${this.redis.lastError ? ` (${this.redis.lastError})` : ''}`)
        return this.redis.client.ping()
      }),
    ])

    const allUp = db.health.status === 'up' && redis.health.status === 'up'
    return {
      status: allUp ? 'ok' : 'degraded',
      version: VERSION,
      uptimeSeconds: Math.round(process.uptime()),
      time: new Date().toISOString(),
      checks: {
        database: { ...db.health, postgis: db.result ?? null },
        redis: redis.health,
      },
    }
  }
}
