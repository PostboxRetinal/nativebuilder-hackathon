## Why

An OWASP Top 10 2021 audit found client-side gaps fixable in this web repo: no lint rules for injection/eval, the Speechmatics JWT exposed in the WebSocket URL, no Content Security Policy, a weak password policy, no auth rate limiting, and a disabled production minifier. This change hardens the frontend and records the security posture in the SDD.

## What Changes

- Enable `eslint-plugin-security` with a correct TypeScript flat config (`no-unused-vars` / `no-undef` delegated to TS, `@typescript-eslint/no-unused-vars` active).
- Raise the password policy to min 8 chars + uppercase + number + special (signup only).
- Migrate Speechmatics to the official `@speechmatics/real-time-client` SDK so the JWT is passed to `client.start(jwt, config)` and never appears in a WebSocket URL.
- Add a Content Security Policy via `vite-plugin-csp-guard` (self-only, SRI on build, Tailwind outlier support).
- Add auth attempt rate limiting (5 attempts / 60s) in the auth context.
- Harden the production build (`minify: 'esbuild'`, `cssMinify`, `sourcemap: 'hidden'`).

## Capabilities

### New Capabilities
- `security-posture`: CSP enforcement, hardened production build, and lint-level injection detection.

### Modified Capabilities
- `authentication`: password policy on signup; rate limiting on sign in.
- `voice-input`: Speechmatics SDK migration so the JWT is passed via `client.start()` and never embedded in the WebSocket URL.

## Impact

Frontend-only. Files: `eslint.config.mjs`, `vite.config.ts`, `src/components/AuthScreen.tsx`, `src/contexts/AuthContext.tsx`, `src/hooks/useSpeechmatics.ts`, `package.json`. Server-side concerns (RLS, Edge Function secrets, server rate limiting) are out of scope; password enforcement exists only in the UI and must be mirrored server-side for real strength.

## Non-Goals

- Server-side rate limiting (lives in Supabase/Edge Functions, out of this repo).
- Migrating RLS policies (server-side, verified manually against the Supabase dashboard).
- Running `bun audit` (must run locally on the user machine; bun not on the VPS).
- Changing the WebSocket audio transport beyond replacing the JWT-in-URL path.
