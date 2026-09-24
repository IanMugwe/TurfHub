import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from './generated/prisma/client.js'

export { PrismaClient }
export * from './generated/prisma/client.js'

/** Create a Prisma client connected through the node-postgres driver */
export function createPrismaClient(databaseUrl: string) {
  return new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) })
}
