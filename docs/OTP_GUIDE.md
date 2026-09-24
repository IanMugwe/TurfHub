# Sign-in codes (OTP): testing and enabling

Turf signs everyone in with a phone number and a 6-digit code sent by SMS (SRS §6.1, [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) D1, [BUILD_PLAN.md](BUILD_PLAN.md) P1).

> **Current status:** there is no backend yet, so **no SMS is sent**. The sign-in screen in `apps/web` is a local mock: it accepts a demo code, and the phone number decides which app you see. Real codes arrive with the API in milestone M1 ([Part 2](#part-2-enabling-real-otp-milestone-m1)).

---

## Part 1: Testing sign-in today

### 1.1 Demo accounts

Enter the number after the fixed `+254` prefix, then the code **`123456`**.

| Number | Signs in as | What you see |
|--------|-------------|--------------|
| `722 000 111` | James Kariuki, **owner** | Staff app with everything, including Reports, pricing rules and team |
| `733 000 222` | Achieng Odhiambo, **manager** | Staff app without Reports, pricing rules or team settings |
| `712 345 678` | Brian Otieno, **player** | Player app with his stats on Profile |
| Any other valid number (e.g. `798 765 432`) | **New player** | Player app with an empty profile |

A wrong code shows "That code is incorrect". Numbers and roles are defined in `apps/web/src/mocks/data.ts` (`STAFF_ACCOUNTS`, `CUSTOMERS`).

Your sign-in is remembered in this browser, so a refresh keeps you signed in. To switch accounts, sign out: More › Sign out or Profile › Sign out on a phone, or the account menu (your name, top right) on desktop.

### 1.2 Settings for the sign-in step

Two environment variables control the code step. Put them in **`apps/web/.env.local`**. The file is git-ignored, so each developer can have their own. Restart `pnpm dev` after changing them.

| Variable | Values | Effect |
|----------|--------|--------|
| `VITE_OTP_MODE` | `demo` *(default)* | Code screen shown; the demo code is accepted |
| | `skip` | **Bypass:** no code screen. The button says "Continue" and signs you straight in |
| `VITE_DEMO_OTP_CODE` | any 6 digits *(default `123456`)* | The code accepted in `demo` mode. Anything that isn't 6 digits falls back to `123456` |

**Bypass the code step:**

```bash
# apps/web/.env.local
VITE_OTP_MODE=skip
```

Or for a single run, from the repo root:

```bash
VITE_OTP_MODE=skip pnpm dev
```

**Use a different demo code:**

```bash
# apps/web/.env.local
VITE_DEMO_OTP_CODE=424242
```

> ⚠️ Vite writes these values into the built files. **Never build a public deployment with `VITE_OTP_MODE=skip`.** Anyone could sign in as anyone. While sign-in is a mock this only affects demo data, but the rule matters once real accounts exist.

The settings live in `apps/web/src/lib/otpConfig.ts`.

### 1.3 Skip the sign-in screen entirely

To jump straight to a page as a given account, for example while checking a layout, run one of these in the browser console on the app's page, then reload:

```js
// Owner
localStorage.setItem('turf.session', JSON.stringify({ role: 'staff', staffRole: 'owner', name: 'James Kariuki', phone: '+254 722 000 111' }))

// Manager
localStorage.setItem('turf.session', JSON.stringify({ role: 'staff', staffRole: 'manager', name: 'Achieng Odhiambo', phone: '+254 733 000 222' }))

// Player
localStorage.setItem('turf.session', JSON.stringify({ role: 'customer', name: 'Brian Otieno', phone: '+254 712 345 678' }))

// Sign out
localStorage.removeItem('turf.session')
```

Then open any page directly, e.g. `/v/greenfield/calendar` or `/explore`.

### 1.4 In automated tests

- **Signed in:** tests put a session in `localStorage` before rendering, as `renderAt(path, session)` does in `src/app/routes.test.tsx`.
- **Through the real screen:** tests type the phone number and `123456`, as in "signs an owner in with phone and code".
- **Bypass mode:** tests use `vi.stubEnv('VITE_OTP_MODE', 'skip')` and then re-import the app, as in "sign-in bypass" in `routes.test.tsx`.

---

## Part 2: Enabling real OTP (milestone M1)

This needs the API (`apps/api`, M0). The steps below follow the design in the implementation plan (§2.9) and the build plan (M1).

### 2.1 SMS provider: Africa's Talking

1. **Sandbox first.** Create an Africa's Talking account and use the **sandbox** app (username `sandbox`). Sandbox SMS are free and appear in the Africa's Talking **simulator** instead of on a real phone, which is ideal for development.
2. **Production.** Create a live app, top up credit, and apply for an **alphanumeric sender ID** (e.g. `TURF`). Approval by the Kenyan networks can take a few days, so start early.
3. Keep the credentials in the API's environment, never in the web app:

| Variable (API) | Example | Notes |
|----------------|---------|-------|
| `AT_USERNAME` | `sandbox` | Live app username in production |
| `AT_API_KEY` | *(secret)* | Store in the host's secret manager |
| `AT_SENDER_ID` | `TURF` | Leave empty in the sandbox |
| `OTP_HMAC_SECRET` | *(32+ random bytes)* | Used to hash codes before storing them |

### 2.2 API endpoints

| Endpoint | Body | Result |
|----------|------|--------|
| `POST /api/v1/auth/otp/request` | `{ phone }` | `204`. Sends the SMS. `429` when rate-limited |
| `POST /api/v1/auth/otp/verify` | `{ phone, code }` | `200 { user, memberships[] }` and sets the session cookies. `400 OTP_INVALID` for a wrong code, `410 OTP_EXPIRED` when it has run out, `429` after too many tries |
| `POST /api/v1/auth/refresh` | — | Rotates the session cookies |
| `POST /api/v1/auth/logout` | — | Clears the session |
| `GET /api/v1/me` | — | The signed-in user and memberships, or `401` |

### 2.3 Server rules

- **Phone numbers:** normalise every number to `+2547…` first. Use `normalizePhoneKE` from `apps/web/src/lib/format.ts`, which moves to `packages/validation` in M0.
- **Codes:** generate 6 digits with `crypto.randomInt(0, 1_000_000)`, zero-padded. Store only an **HMAC-SHA256 hash** in Redis under `otp:{phone}`, with a **5-minute** expiry. Compare in constant time, and delete the key once the code is used.
- **Limits:**
  - At most **5 wrong tries** per code.
  - A **45-second** resend cooldown, which matches the timer on the code screen.
  - At most **5 codes per phone per hour**, plus a per-IP limit.
  - Respond the same way whether or not the number has an account.
- **Sessions:** the access token (15 min) and a rotating refresh token go in **httpOnly, Secure, SameSite=Lax** cookies. Store only a hash of the refresh token (`sessions` table).
- **SMS text:** `Your Turf code is 123456. It expires in 5 minutes. Don't share it.` Keep it under 160 characters so it's sent as one SMS.

### 2.4 Test bypass on the real backend

Once real OTP exists, testers still need to sign in without a phone. Add two **API** settings, never web ones:

| Variable (API) | Example | Effect |
|----------------|---------|--------|
| `OTP_TEST_NUMBERS` | `+254722000111,+254733000222,+254712345678` | For these numbers no SMS is sent… |
| `OTP_TEST_CODE` | `123456` | …and this code is accepted |

Guard rails:
- The API **refuses to start** if `OTP_TEST_NUMBERS` is set while `NODE_ENV=production`, unless `ALLOW_OTP_TEST_NUMBERS_IN_PRODUCTION=true` is also set (for example for app-store review accounts).
- Log every sign-in that uses a test number.
- Use the Africa's Talking sandbox for everything else in development and staging.

### 2.5 Wiring the web app

1. In `SignInScreen.tsx`, replace the mock:
   - "Send code" calls `POST /auth/otp/request`.
   - "Sign in" calls `POST /auth/otp/verify`.
   - "Resend code" calls request again.
2. Map the errors onto the existing UI:
   - `OTP_INVALID` → "That code is incorrect".
   - `OTP_EXPIRED` → "That code has expired. We've sent a new one."
   - `429` → "Too many attempts. Try again in a few minutes."
3. In `AppState.tsx`, stop storing the session in `localStorage`. Load it with `GET /me` when the app starts, and sign out with `POST /auth/logout`.
4. Add a third mode, `VITE_OTP_MODE=api`, and make it the default for staging and production builds. Keep `demo` and `skip` for working on screens without the API running.
5. Remove the demo-number hint and "Demo code" line in `api` mode.

### 2.6 Checklist before going live

- [ ] Sender ID approved and live Africa's Talking credentials set in production
- [ ] `OTP_TEST_NUMBERS` not set in production (the API refuses to start otherwise)
- [ ] Production web build uses `VITE_OTP_MODE=api`
- [ ] Rate limits tested (wrong code ×5, resend spam, many numbers from one IP)
- [ ] SMS arrives within ~10 s on Safaricom, Airtel and Telkom numbers
- [ ] Code expiry, resend and sign-out tested end to end in Playwright against the sandbox
