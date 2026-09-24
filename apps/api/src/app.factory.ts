import type { INestApplication, NestApplicationOptions } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import type { NestExpressApplication } from '@nestjs/platform-express'
import { AppModule } from './app.module.js'
import type { Env } from './config/env.js'

/** All routes live under /api/v1 (implementation plan §2.10) */
export const API_PREFIX = 'api/v1'

/** Shared setup for main.ts and the end-to-end tests */
export function configureApp(app: INestApplication) {
  app.setGlobalPrefix(API_PREFIX)
  app.enableShutdownHooks()
  const express = app as NestExpressApplication
  express.disable('x-powered-by')
  // Behind the web host's proxy in production; needed for correct client IPs in rate limits
  express.set('trust proxy', 1)
  return app
}

export async function createApp(env: Env, options: NestApplicationOptions = {}) {
  const app = await NestFactory.create<NestExpressApplication>(AppModule.register(env), options)
  return configureApp(app)
}
