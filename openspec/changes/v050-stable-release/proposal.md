## Why

The production build served a blank page due to `@supabase/supabase-js` marked as `external` in `vite.config.ts`, resolved at runtime via an `importmap` pointing at esm.sh. The CSP has no esm.sh in its `connect-src` allowlist, so the module fetch was blocked and React never mounted. Verified in real browser: `root.children.length = 0` with `transferSize: 0` on the esm.sh request. Dev worked because Vite rewrites bare imports to `node_modules` and never touches the importmap. This also corrects stale coverage thresholds and README numbers that no longer match observed coverage.

## What Changes

- Remove `external: ['@supabase/supabase-js']` from `vite.config.ts` — the library is now bundled, making the app self-contained and CSP-compliant.
- Remove the `importmap` block from `index.html` (no longer needed; no CDN dependency).
- Add `scripts/verify-build.sh` — automated guard that asserts the bundle is self-contained (no importmap, no unresolved bare imports, no CDN references).
- Bump coverage thresholds in `vitest.config.ts` from 25/65/60/25 to 74/65/76/77 (~2pts below observed 76.03/67.35/78.90/79.01).
- Correct README coverage numbers from "~60%+ statements, ~79% branches" to "76% statements, 67% branches, 79% functions, 79% lines".
- Bump `package.json` version from `0.4.5` to `0.5.0`.
- Archive completed `chat-composer-stt-copy-polish` change.

## Capabilities

This change is a release-stabilization refactor: build configuration, test thresholds, and documentation. It does not alter application-level user behavior — the rendered UI and workflows are unchanged. `skip_specs: true` is set accordingly.

## Impact

- **Build output**: bundle grows from ~433 kB to ~660 kB (Supabase now bundled).
- **CSP**: remains `default-src 'self'` — no third-party origins at runtime.
- **Tests**: 122/122 pass (unchanged behavior).
- **Coverage gate**: raises the floor from 25/65/60/25 to 74/65/76/77, so regressions now fail CI.
- **Dev workflow**: `scripts/verify-build.sh` guards against reintroducing an importmap or bare import in the future.
- **Version**: `0.5.0` marks a stable, verified release.
