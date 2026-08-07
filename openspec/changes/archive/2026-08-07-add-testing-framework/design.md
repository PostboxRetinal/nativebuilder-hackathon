## Context

DevVoice runs on Vite 7 in a memory-constrained web container, has a production CSP plugin applied at build, and uses Supabase + Speechmatics for live services. Previously there was no automated verification. The stack (React 19, TS 7 native typecheck with TS 6 API for ESLint, bun package manager) constrains which test tooling is viable.

## Goals / Non-Goals

**Goals:**
- Fast, offline unit tests for the research pipeline and its UI.
- Isolate test config from the production build so the CSP plugin and OOM-prone build flags never leak into tests.
- One repeatable E2E harness for the core loop that is safe to run against the live environment.
- Regressions blocked in CI via unit tests.

**Non-Goals:**
- Coverage thresholds or coverage gating.
- Playwright in CI (requires live account credentials).
- Automating Speechmatics audio capture in tests.
- Snapshot testing.

## Decisions

1. **Vitest 3 + jsdom over the bun test runner.** Vitest 3.2 is the pairing officially compatible with Vite 7. `bun test` is bun's own runner and does not read Vitest config, jsdom, or Testing Library matchers, so unit tests must run via `vitest run` (wired as the `test` script, invoked with `bun run test`).
2. **Dedicated `vitest.config.ts` instead of reusing `vite.config.ts`.** The production config applies the CSP plugin and a memory-limited build. A separate JSX-enabled Vitest config (jsdom + setup file) keeps tests clean and memory-safe. `tests/e2e/**` is excluded so Vitest never collects Playwright specs.
3. **jest-dom matchers via `@testing-library/jest-dom/vitest`.** Imported in the setup file and referenced from `src/vitest-setup.d.ts` so TypeScript resolves the extended matchers. jsdom lacks `scrollIntoView`, stubbed in setup.
4. **Playwright 1.x for E2E, local-only.** `playwright.config.ts` drives `bun dev` via `webServer`. The spec reads `E2E_TEST_EMAIL`/`E2E_TEST_PASSWORD` and uses `test.skip` when absent, so it is safe to run anywhere without a live backend. Not wired into CI: installing ~150MB of browsers to run a self-skipping test is pure cost. If browser install is needed locally, `bunx playwright install`.
5. **`data-testid` hooks on bubbles and citations.** Counting assistant messages by role/text or class names is fragile; explicit `data-testid` attributes (`message-assistant`, `source-citation`) give stable E2E anchors with no logic change.
6. **CI: lint + unit tests only.** Adds `bunx eslint .` and `bun run test` steps to the existing job, preserving the least-privilege `permissions: contents: read` already present.

## Risks / Trade-offs

- **Vitest OSV advisories (GHSA-5xrq-8626-4rwp, GHSA-9crc-q9x8-hgqq).** Both require the Vitest UI/API server (browser mode, `--api`) listening and network-exposed for RCE/file read. Our setup uses `vitest run` (single pass, no server), so the vector is unreachable. Re-evaluate before adopting browser mode.
- **E2E cannot run without live credentials.** Full verification of the research loop depends on `E2E_TEST_EMAIL`/`E2E_TEST_PASSWORD` in a real Supabase instance. This is accepted and documented; unit tests cover the same logic offline.
- **Playwright config and `tests/e2e` are outside tsconfig `include`.** `tsc --noEmit` does not typecheck them; Playwright validates them at run time via its own resolver. Could be added to tsconfig if stricter typechecking is wanted.
