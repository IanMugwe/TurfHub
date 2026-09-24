import { Controller, Get, HttpStatus, Res } from '@nestjs/common'
import type { Response } from 'express'
import type { HealthResponse } from '@turfhub/validation'
import { HealthService } from './health.service.js'

@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService) {}

  /** 200 when the database and Redis are reachable, 503 otherwise. Used by the web app, uptime checks and deploys. */
  @Get()
  async get(@Res({ passthrough: true }) res: Response): Promise<HealthResponse> {
    const result = await this.health.check()
    res.status(result.status === 'ok' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE)
    res.setHeader('Cache-Control', 'no-store')
    return result
  }
}
