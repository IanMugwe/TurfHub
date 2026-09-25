/**
 * How the sign-in code step behaves, set with Vite env variables (see docs/OTP_GUIDE.md).
 *
 * - `demo` (default): the code screen is shown and DEMO_OTP_CODE is accepted.
 * - `skip`: no code screen; entering a phone number signs you straight in. For testing only.
 *
 * Real SMS codes need the API (milestone M1); until then every mode is a local mock.
 */
export type OtpMode = 'demo' | 'skip'

export const OTP_MODE: OtpMode = import.meta.env.VITE_OTP_MODE === 'skip' ? 'skip' : 'demo'

/** Show the demo phone numbers and code on the sign-in screen (off by default, so demos look like the real product) */
export const SHOW_DEMO_HINTS: boolean = import.meta.env.VITE_DEMO_HINTS === 'true'

export const DEMO_OTP_CODE: string = /^\d{6}$/.test(import.meta.env.VITE_DEMO_OTP_CODE ?? '')
  ? import.meta.env.VITE_DEMO_OTP_CODE!
  : '123456'
