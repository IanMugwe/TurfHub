import { type DynamicModule, Global, type MiddlewareConsumer, Module, type NestModule } from '@nestjs/common'
import { APP_FILTER } from '@nestjs/core'
import { ENV, type Env } from './config/env.js'
import { AllExceptionsFilter } from './common/all-exceptions.filter.js'
import { RequestLoggerMiddleware } from './common/request-logger.middleware.js'
import { PrismaService } from './database/prisma.service.js'
import { RedisService } from './redis/redis.service.js'
import { HealthController } from './health/health.controller.js'
import { HealthService } from './health/health.service.js'

@Global()
@Module({})
export class AppModule implements NestModule {
  /** Settings are passed in, so tests can build the app with their own */
  static register(env: Env): DynamicModule {
    return {
      module: AppModule,
      controllers: [HealthController],
      providers: [
        { provide: ENV, useValue: env },
        { provide: APP_FILTER, useClass: AllExceptionsFilter },
        PrismaService,
        RedisService,
        HealthService,
      ],
      exports: [ENV, PrismaService, RedisService],
    }
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*path')
  }
}
