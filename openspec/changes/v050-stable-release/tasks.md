## 1. Fix production bundle

- [x] 1.1 Remove `external: ['@supabase/supabase-js']` from `vite.config.ts:50-55` — library is now bundled, making the app self-contained and CSP-compliant.
- [x] 1.2 Remove `importmap` block from `index.html:8-13` — dead code pointing at a CDN; Supabase is bundled now.
- [x] 1.3 Add `scripts/verify-build.sh` — automated guard: fails if `dist/` contains an importmap, unresolved bare import, or CDN reference.

## 2. Align coverage + docs

- [x] 2.1 Raise `vitest.config.ts` thresholds from 25/65/60/25 to 74/65/76/77 (~2pts below observed 76.03/67.35/78.90/79.01).
- [x] 2.2 Correct README.md coverage line from "~60%+ statements, ~79% branches (thresholds: 25/65/60/25)" to "76% statements, 67% branches, 79% functions, 79% lines (thresholds: 74/65/76/77)".

## 3. Version bump + gate

- [x] 3.1 Bump `package.json` version from `0.4.5` to `0.5.0`.
- [x] 3.2 Run full gate: `bun run typecheck` (0 errors), `bun run lint` (0 errors, 1 legacy warning), `bun run test` (122 pass), `bun run test --coverage` (above thresholds), `bun run build` (OK), `./scripts/verify-build.sh` (PASS).
- [x] 3.3 Verify production bundle renders in real browser — confirmed `root.children.length = 2` on `dist/` served via HTTP (was 0 before fix).
