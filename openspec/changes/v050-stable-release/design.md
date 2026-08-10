## Context

See proposal.md - Why.

The production build marks `@supabase/supabase-js` as a rollup `external`, leaving a bare `import` specifier in the bundle. At runtime the browser resolves it via an `importmap` pointing at esm.sh. The CSP `connect-src` does not allow esm.sh, so the fetch is blocked and React never mounts. Verified in-browser: `root.children.length = 0`, esm.sh request has `transferSize: 0`.

## Goals / Non-Goals

**Goals:** Make the production bundle self-contained so it loads without any third-party origin, keeping CSP `default-src 'self'` intact. Align coverage thresholds and README numbers with observed values.

**Non-Goals:** No UI changes, no new features, no Supabase version upgrade.

## Decisions

**Bundle Supabase instead of externalizing.** Removing the `external` flag lets rollup include Supabase in the JS bundle. Alternative considered: add esm.sh to CSP `connect-src` — rejected, because it introduces a third-party runtime dependency that CSP is explicitly designed to prevent, and esm.sh could be compromised to inject code into the app.

**Remove importmap entirely.** With Supabase bundled, the importmap has no remaining purpose. Leaving it would be dead code pointing at a CDN, misleading future readers.

**Add verify-build.sh guard.** A post-build script checks for the regression pattern (importmap, bare Supabase import, CDN reference). Runs in seconds, fails fast if anyone reintroduces the pattern.

**Set coverage thresholds ~2pts below observed floor.** 76.03/67.35/78.90/79.01 → thresholds 74/65/76/77. Tight enough to catch regressions, loose enough to tolerate small natural variance.

## Risks / Trade-offs

- **Bundle grows ~227 kB (433 kB → 660 kB).** Accepted. A working 660 kB bundle beats a broken 433 kB one. Code splitting is a separate concern.
- **No runtime CDN failover.** Previously the CDN worked when it wasn't blocked by CSP; now there's no fallback. This is correct — CSP was blocking it anyway, so there was no real fallback to lose.
