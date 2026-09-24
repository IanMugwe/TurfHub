import { type ArgumentsHost, Catch, type ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'
import { ZodError } from 'zod'
import { type ApiErrorBody, ErrorCode } from '@turfhub/validation'
import { ApiError } from './api-error.js'

const CODE_BY_STATUS: Partial<Record<number, string>> = {
  [HttpStatus.BAD_REQUEST]: ErrorCode.VALIDATION_FAILED,
  [HttpStatus.UNAUTHORIZED]: ErrorCode.UNAUTHORIZED,
  [HttpStatus.FORBIDDEN]: ErrorCode.FORBIDDEN,
  [HttpStatus.NOT_FOUND]: ErrorCode.NOT_FOUND,
  [HttpStatus.TOO_MANY_REQUESTS]: ErrorCode.RATE_LIMITED,
}

/** Every error leaves the API in one shape: { code, message, details? } (implementation plan §2.10) */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Errors')

  constructor(private readonly adapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.adapterHost
    const ctx = host.switchToHttp()
    const [status, body] = this.toResponse(exception)

    if (status >= 500) this.logger.error(exception instanceof Error ? exception.stack ?? exception.message : String(exception))
    httpAdapter.reply(ctx.getResponse(), body, status)
  }

  private toResponse(exception: unknown): [number, ApiErrorBody] {
    if (exception instanceof ApiError) {
      return [exception.getStatus(), { code: exception.code, message: exception.message, ...(exception.details !== undefined && { details: exception.details }) }]
    }
    if (exception instanceof ZodError) {
      return [HttpStatus.BAD_REQUEST, { code: ErrorCode.VALIDATION_FAILED, message: 'The request is not valid', details: exception.issues }]
    }
    if (exception instanceof HttpException) {
      const status = exception.getStatus()
      return [status, { code: CODE_BY_STATUS[status] ?? (status >= 500 ? ErrorCode.INTERNAL : `HTTP_${status}`), message: exception.message }]
    }
    // Never leak internals to clients
    return [HttpStatus.INTERNAL_SERVER_ERROR, { code: ErrorCode.INTERNAL, message: 'Something went wrong' }]
  }
}
