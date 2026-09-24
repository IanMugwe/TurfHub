import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { sessionForPhone } from '../../mocks/data'
import { DEMO_OTP_CODE, OTP_MODE } from '../../lib/otpConfig'
import { useIsDesktop } from '../../lib/useIsDesktop'
import type { Session } from '../../types'


export default function SignInScreen({ onSignedIn }: { onSignedIn: (s: Session) => void }) {
  const [step, setStep] = useState<'phone' | 'code'>('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState<string[]>(Array(6).fill(''))
  const [error, setError] = useState(false)
  const [resendIn, setResendIn] = useState(45)
  const inputs = useRef<(HTMLInputElement | null)[]>([])
  const desktop = useIsDesktop()

  const digits = phone.replace(/\D/g, '')
  const phoneValid = digits.length === 9
  const codeComplete = code.every(c => c !== '')

  useEffect(() => {
    if (step !== 'code' || resendIn === 0) return
    const t = setTimeout(() => setResendIn(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [step, resendIn])

  function formatPhone(raw: string) {
    const d = raw.replace(/\D/g, '').slice(0, 9)
    return [d.slice(0, 3), d.slice(3, 6), d.slice(6, 9)].filter(Boolean).join(' ')
  }

  function sendCode() {
    // Testing bypass: sign in without a code (VITE_OTP_MODE=skip)
    if (OTP_MODE === 'skip') {
      onSignedIn(sessionForPhone(`+254 ${phone}`))
      return
    }
    setStep('code')
    setResendIn(45)
    setCode(Array(6).fill(''))
    setError(false)
    setTimeout(() => inputs.current[0]?.focus(), 50)
  }

  function setDigit(i: number, value: string) {
    const v = value.replace(/\D/g, '')
    if (v.length > 1) {
      // Pasted the full code
      const next = v.slice(0, 6).split('')
      setCode([...next, ...Array(6 - next.length).fill('')])
      inputs.current[Math.min(next.length, 5)]?.focus()
      setError(false)
      return
    }
    setCode(c => c.map((x, j) => (j === i ? v : x)))
    setError(false)
    if (v && i < 5) inputs.current[i + 1]?.focus()
  }

  function onKeyDown(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !code[i] && i > 0) inputs.current[i - 1]?.focus()
  }

  function signIn() {
    if (code.join('') === DEMO_OTP_CODE) onSignedIn(sessionForPhone(`+254 ${phone}`))
    else setError(true)
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--color-surface)', minHeight: desktop ? '100%' : '100vh' }}>
      {/* Brand */}
      <div style={{ background: 'var(--color-primary)', padding: '84px 24px 36px', borderRadius: '0 0 28px 28px' }}>
        <div className="flex items-center gap-3">
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>⚽</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>Turf</div>
        </div>
        <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.8)', marginTop: 14, lineHeight: 1.5 }}>
          Book a pitch in seconds, or run your venue from your phone.
        </div>
      </div>

      <div style={{ padding: '28px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {step === 'phone' ? (
          <>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>Sign in</div>
            <div style={{ fontSize: 14, color: 'var(--color-muted)', marginBottom: 24 }}>We'll text a 6-digit code to your phone.</div>

            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-muted)', marginBottom: 6 }}>Phone number</label>
            <div style={{ display: 'flex', border: '1px solid var(--color-border)', borderRadius: 12, background: 'var(--color-bg)', overflow: 'hidden' }}>
              <div style={{ padding: '14px 12px', fontSize: 16, fontWeight: 600, color: 'var(--color-text)', borderRight: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 6 }}>
                🇰🇪 +254
              </div>
              <input value={phone} onChange={e => setPhone(formatPhone(e.target.value))} type="tel" inputMode="numeric" placeholder="712 345 678" autoFocus
                style={{ flex: 1, padding: '14px 12px', border: 'none', background: 'transparent', fontSize: 16, color: 'var(--color-text)', outline: 'none', letterSpacing: '0.02em', minWidth: 0 }} />
            </div>

            <div style={{ fontSize: 12, color: 'var(--color-muted-light)', marginTop: 10, lineHeight: 1.6 }}>
              Demo numbers — owner: 722 000 111 · manager: 733 000 222 · any other number opens the customer app
            </div>

            <div style={{ flex: 1 }} />
            <button onClick={sendCode} disabled={!phoneValid}
              style={{ width: '100%', padding: '15px', borderRadius: 14, border: 'none', background: phoneValid ? 'var(--color-primary)' : 'var(--color-border)', color: phoneValid ? '#fff' : 'var(--color-muted-light)', fontSize: 16, fontWeight: 700, cursor: phoneValid ? 'pointer' : 'not-allowed', marginTop: 24 }}>
              {OTP_MODE === 'skip' ? 'Continue' : 'Send code'}
            </button>
          </>
        ) : (
          <>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>Enter the code</div>
            <div style={{ fontSize: 14, color: 'var(--color-muted)', marginBottom: 24 }}>
              Sent to <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>+254 {phone}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
              {code.map((c, i) => (
                <input key={i} ref={el => { inputs.current[i] = el }} value={c} inputMode="numeric" autoComplete="one-time-code"
                  onChange={e => setDigit(i, e.target.value)} onKeyDown={e => onKeyDown(i, e)}
                  style={{ width: '100%', height: 56, textAlign: 'center', fontSize: 24, fontWeight: 700, borderRadius: 12, outline: 'none', color: 'var(--color-text)', fontVariantNumeric: 'tabular-nums',
                    border: `1.5px solid ${error ? 'var(--color-noshow)' : c ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    background: error ? 'var(--color-noshow-bg)' : 'var(--color-bg)' }} />
              ))}
            </div>

            {error ? (
              <div style={{ fontSize: 13, color: 'var(--color-noshow)', marginTop: 10, fontWeight: 500 }}>That code is incorrect. Check the SMS and try again.</div>
            ) : (
              <div style={{ fontSize: 12, color: 'var(--color-muted-light)', marginTop: 10 }}>Demo code: {DEMO_OTP_CODE}</div>
            )}

            <div className="flex items-center justify-between" style={{ marginTop: 20 }}>
              <button onClick={() => setStep('phone')} style={{ background: 'none', border: 'none', color: 'var(--color-muted)', fontSize: 14, cursor: 'pointer', padding: '10px 0' }}>
                ‹ Change number
              </button>
              {resendIn > 0 ? (
                <span style={{ fontSize: 14, color: 'var(--color-muted)', fontVariantNumeric: 'tabular-nums' }}>Resend in 0:{String(resendIn).padStart(2, '0')}</span>
              ) : (
                <button onClick={sendCode} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: '10px 0' }}>
                  Resend code
                </button>
              )}
            </div>

            <div style={{ flex: 1 }} />
            <button onClick={signIn} disabled={!codeComplete}
              style={{ width: '100%', padding: '15px', borderRadius: 14, border: 'none', background: codeComplete ? 'var(--color-primary)' : 'var(--color-border)', color: codeComplete ? '#fff' : 'var(--color-muted-light)', fontSize: 16, fontWeight: 700, cursor: codeComplete ? 'pointer' : 'not-allowed', marginTop: 24 }}>
              Sign in
            </button>
          </>
        )}
      </div>
    </div>
  )
}
