## Context

Frontend-only security hardening from the OWASP Top 10 2021 audit. The app is a Vite + React + TS + Tailwind SPA talking to Speechmatics (real-time STT), Supabase (auth/DB/Edge Functions), Bright Data, and an AI/ML API. All secrets live server-side in Edge Functions; the browser only holds the anon Supabase key and short-lived JWTs. Constraints: TypeScript strict mode, dark Tailwind theme, aggressive OOM protection in the web container.

## Goals / Non-Goals

**Goals:**
- Close the client-side OWASP findings in this repo.
- Enforce baseline lint, build, and UI-layer security controls.
- Record the security posture in the SDD.

**Non-Goals:**
- Server-side rate limiting and RLS policy authoring (Supabase-side).
- Running `bun audit` (user machine, bun not on VPS).
- Changing the audio transport beyond removing the JWT from the URL.

## Decisions

- **ESLint flat config**: disable base `no-undef` and `no-unused-vars` for TS files (they false-positive on the `React` namespace under `jsx: react-jsx`; TS already validates refs and unused via `noUnusedLocals`/`noUnusedParameters`), and enable `@typescript-eslint/no-unused-vars` (error, `^_` ignore). This matches the documented typescript-eslint guidance.
- **Speechmatics SDK**: replace the raw WebSocket + JWT-in-URL with `@speechmatics/real-time-client`. `client.start(token, { transcription_config })` carries the JWT; `client.sendAudio()` streams PCM16; `client.stopRecognition()` ends the session.
- **CSP**: `vite-plugin-csp-guard` with a self-only policy, `sri: true` on build, and `outlierSupport: ['tailwind']` in dev (required by the plugin's Tailwind support table).
- **Password policy**: applied on signup only in `AuthScreen.tsx` (min 8 + uppercase + number + special).
- **Rate limiting**: client-side 5 attempts / 60s sliding window in `AuthContext.tsx`.

## Risks / Trade-offs

- Rate limiting is client-side only; a determined attacker can bypass it by calling Supabase directly. Accepted for the hackathon; server-side enforcement is a documented non-goal.
- Password policy is UI-layer only; it must be mirrored in Supabase auth settings to be enforceable, not just advisory.
