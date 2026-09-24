import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/**/*.spec.ts', 'test/**/*.spec.ts'],
    // Integration tests share one database and Redis
    fileParallelism: false,
  },
})
