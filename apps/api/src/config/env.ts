import { z } from 'zod'

/** Settings the API reads from the environment (repo-root .env in development) */
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
  REDIS_URL: z.url({ protocol: /^rediss?$/ }),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
})

export type Env = z.infer<typeof envSchema>

/** Injection token for the validated settings */
export const ENV = Symbol('ENV')

/** Validate settings at startup so a missing or wrong value fails fast with a clear message */
export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const result = envSchema.safeParse(source)
  if (!result.success) {
    const problems = result.error.issues.map(i => `  - ${i.path.join('.')}: ${i.message}`).join('\n')
    throw new Error(`Invalid API settings. Check the repo-root .env (see .env.example):\n${problems}`)
  }
  return result.data
}
