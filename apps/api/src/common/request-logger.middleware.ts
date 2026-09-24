import { randomUUID } from 'node:crypto'
import { Injectable, Logger, type NestMiddleware } from '@nestjs/common'
import type { NextFunction, Request, Response } from 'express'

/** Logs one line per request and tags it with an id (reused from x-request-id when present) */
@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP')

  use(req: Request, res: Response, next: NextFunction) {
    const incoming = req.header('x-request-id')
    const id = incoming && /^[\w-]{1,64}$/.test(incoming) ? incoming : randomUUID()
    res.setHeader('x-request-id', id)

    const start = process.hrtime.bigint()
    res.on('finish', () => {
      const ms = Number(process.hrtime.bigint() - start) / 1e6
      this.logger.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${ms.toFixed(1)}ms [${id}]`)
    })
    next()
  }
}
