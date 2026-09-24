import { Inject, Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common'
import { Redis } from 'ioredis'
import { ENV, type Env } from '../config/env.js'
import { describeError } from '../common/describe-error.js'

/** Shared Redis connection (OTP codes, rate limits and BullMQ later). Keeps retrying in the background if Redis is down. */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  readonly client: Redis
  private readonly logger = new Logger('Redis')
  /** Latest connection problem, shown by the health check */
  lastError: string | null = null

  constructor(@Inject(ENV) env: Env) {
    this.client = new Redis(env.REDIS_URL, {
      lazyConnect: true,
      connectTimeout: 2000,
      maxRetriesPerRequest: 1,
      // Fail commands straight away while disconnected instead of queueing them
      enableOfflineQueue: false,
      retryStrategy: times => Math.min(times * 500, 5000),
    })
    this.client.on('ready', () => {
      if (this.lastError) this.logger.log('Reconnected')
      this.lastError = null
    })
    // Log each distinct failure once, not on every retry
    this.client.on('error', (err: Error) => {
      const reason = describeError(err)
      if (reason !== this.lastError) this.logger.warn(`Connection problem: ${reason}`)
      this.lastError = reason
    })
  }

  async onModuleInit() {
    await this.client.connect().catch(() => undefined)
  }

  async onModuleDestroy() {
    this.client.disconnect()
  }
}
