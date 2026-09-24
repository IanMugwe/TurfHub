import path from 'node:path'
import { ConsoleLogger, type LogLevel } from '@nestjs/common'
import { config } from 'dotenv'
import { loadEnv } from './config/env.js'
import { API_PREFIX, createApp } from './app.factory.js'

// Development reads the repo-root .env; production sets real environment variables
config({ path: path.resolve(import.meta.dirname, '../../../.env'), quiet: true })

const LEVELS: Record<string, LogLevel[]> = {
  debug: ['debug', 'log', 'warn', 'error', 'fatal'],
  info: ['log', 'warn', 'error', 'fatal'],
  warn: ['warn', 'error', 'fatal'],
  error: ['error', 'fatal'],
}

async function bootstrap() {
  const env = loadEnv()
  const logger = new ConsoleLogger({
    prefix: 'Turf API',
    logLevels: LEVELS[env.LOG_LEVEL],
    // One JSON object per line in production, for log search; readable colours locally
    json: env.NODE_ENV === 'production',
  })

  const app = await createApp(env, { logger })
  await app.listen(env.API_PORT)
  logger.log(`Listening on http://localhost:${env.API_PORT}/${API_PREFIX} (${env.NODE_ENV})`, 'Bootstrap')
}

await bootstrap()
