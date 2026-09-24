/**
 * A short, human-readable reason for a failure.
 * Connection errors often arrive as an AggregateError (one per address tried) with an
 * empty message, or wrapped in a `cause`; this digs out something useful like "connect ECONNREFUSED 127.0.0.1:5432".
 */
export function describeError(err: unknown): string {
  if (err instanceof AggregateError && err.errors.length > 0) return describeError(err.errors[0])
  if (err instanceof Error) {
    const message = err.message.split('\n')[0].trim()
    if (message) return message
    if (err.cause) return describeError(err.cause)
    const code = (err as { code?: unknown }).code
    return typeof code === 'string' ? code : err.name
  }
  return 'unavailable'
}
