import type { z } from 'zod'
import { apiErrorSchema, type ApiErrorBody } from '@turfhub/validation'

/** A failed API call, carrying the API's { code, message, details } body */
export class ApiRequestError extends Error {
  constructor(readonly status: number, readonly body: ApiErrorBody) {
    super(body.message)
  }
}

/**
 * GET a JSON endpoint under /api/v1 and validate the response with a shared schema.
 * `acceptStatuses` lists non-2xx statuses whose body is still a valid result (e.g. 503 from /health).
 */
export async function apiGet<T>(path: string, schema: z.ZodType<T>, { acceptStatuses = [] as number[], signal }: { acceptStatuses?: number[]; signal?: AbortSignal } = {}): Promise<T> {
  let res: Response
  try {
    res = await fetch(`/api/v1${path}`, { headers: { Accept: 'application/json' }, credentials: 'same-origin', signal })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err
    throw new ApiRequestError(0, { code: 'UNREACHABLE', message: 'Could not reach the server' })
  }

  const body: unknown = await res.json().catch(() => null)
  if (res.ok || acceptStatuses.includes(res.status)) return schema.parse(body)

  const parsed = apiErrorSchema.safeParse(body)
  // A proxy error page (API not running) has no JSON body
  throw new ApiRequestError(res.status, parsed.success ? parsed.data : { code: 'UNREACHABLE', message: 'Could not reach the server' })
}
