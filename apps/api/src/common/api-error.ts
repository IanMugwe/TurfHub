import { HttpException, HttpStatus } from '@nestjs/common'

/** Throw this for expected failures; the filter turns it into { code, message, details } */
export class ApiError extends HttpException {
  constructor(
    status: HttpStatus,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message, status)
  }
}
