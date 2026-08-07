## 1. ESLint security rules (A03)

- [ ] 1.1 Add `eslint-plugin-security` to devDependencies in `package.json`
- [ ] 1.2 Create `eslint.config.mjs` flat config enabling `security/detect-eval-with-expression` and injection rules
- [ ] 1.3 Configure TS handling: `no-undef: off`, `no-unused-vars: off`, `@typescript-eslint/no-unused-vars` (error, `^_` ignore)
- [ ] 1.4 Verify `eslint .` exits 0 and the rules fire on real violations

## 2. Password policy (A02)

- [ ] 2.1 Enforce min 8 chars + uppercase + number + special on signup in `src/components/AuthScreen.tsx`

## 3. Speechmatics SDK migration (A01)

- [ ] 3.1 Add `@speechmatics/real-time-client` to `package.json` dependencies
- [ ] 3.2 Migrate `src/hooks/useSpeechmatics.ts` to `RealtimeClient`: JWT via `client.start(token, config)`, PCM via `client.sendAudio()`

## 4. Content Security Policy (A05)

- [ ] 4.1 Add `vite-plugin-csp-guard` + `csp-toolkit` to dependencies
- [ ] 4.2 Enable CSP in `vite.config.ts` (self-only, `sri: true` build, `outlierSupport: ['tailwind']`, `minify: 'esbuild'`, `sourcemap: 'hidden'`)

## 5. Auth rate limiting (A07)

- [ ] 5.1 Add 5 attempts / 60s window in `src/contexts/AuthContext.tsx`

## 6. Manual verification (not runnable on VPS)

- [ ] 6.1 Verify Supabase RLS policies on `conversations` + `messages` (dashboard)
- [ ] 6.2 Run `bun install && bun audit` on the user machine; address high/critical CVEs
- [ ] 6.3 Confirm `bun lint` and `bun typecheck` pass locally with the new ESLint config
