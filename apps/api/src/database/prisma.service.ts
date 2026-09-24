import { Inject, Injectable, type OnModuleDestroy } from '@nestjs/common'
import { createPrismaClient, type PrismaClient } from '@turfhub/database'
import { ENV, type Env } from '../config/env.js'

/** One Prisma client for the whole API. It connects lazily on the first query. */
@Injectable()
export class PrismaService implements OnModuleDestroy {
  readonly client: PrismaClient

  constructor(@Inject(ENV) env: Env) {
    this.client = createPrismaClient(env.DATABASE_URL)
  }

  async onModuleDestroy() {
    await this.client.$disconnect()
  }
}
