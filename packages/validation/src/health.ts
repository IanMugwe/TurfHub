import { z } from 'zod'

export const dependencyHealthSchema = z.object({
  status: z.enum(['up', 'down']),
  latencyMs: z.number().nullable(),
  /** Short reason when down; never contains secrets */
  error: z.string().optional(),
})

/** Response of GET /api/v1/health */
export const healthResponseSchema = z.object({
  status: z.enum(['ok', 'degraded']),
  version: z.string(),
  uptimeSeconds: z.number(),
  time: z.string(),
  checks: z.object({
    database: dependencyHealthSchema.extend({ postgis: z.string().nullable() }),
    redis: dependencyHealthSchema,
  }),
})

export type DependencyHealth = z.infer<typeof dependencyHealthSchema>
export type HealthResponse = z.infer<typeof healthResponseSchema>
