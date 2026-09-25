/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Sign-in code step: 'demo' (default) or 'skip'. See docs/OTP_GUIDE.md. */
  readonly VITE_OTP_MODE?: 'demo' | 'skip'
  /** 'true' shows the demo numbers and code on the sign-in screen */
  readonly VITE_DEMO_HINTS?: string
  /** 6-digit code accepted in demo mode (default 123456) */
  readonly VITE_DEMO_OTP_CODE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
