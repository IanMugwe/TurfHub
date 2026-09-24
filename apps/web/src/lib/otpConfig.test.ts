import { afterEach, describe, expect, it, vi } from 'vitest'

async function load() {
  vi.resetModules()
  return import('./otpConfig')
}

describe('otpConfig', () => {
  afterEach(() => vi.unstubAllEnvs())

  it('defaults to demo mode with code 123456', async () => {
    const c = await load()
    expect(c.OTP_MODE).toBe('demo')
    expect(c.DEMO_OTP_CODE).toBe('123456')
  })

  it('reads skip mode and a custom demo code', async () => {
    vi.stubEnv('VITE_OTP_MODE', 'skip')
    vi.stubEnv('VITE_DEMO_OTP_CODE', '424242')
    const c = await load()
    expect(c.OTP_MODE).toBe('skip')
    expect(c.DEMO_OTP_CODE).toBe('424242')
  })

  it('ignores codes that are not 6 digits', async () => {
    vi.stubEnv('VITE_DEMO_OTP_CODE', '12ab')
    expect((await load()).DEMO_OTP_CODE).toBe('123456')
  })
})
