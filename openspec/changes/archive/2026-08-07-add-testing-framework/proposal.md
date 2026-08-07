## Why

DevVoice shipped complex, high-risk features (voice capture, STT, research pipeline) with zero automated verification. Bugs regress silently and the core loop (auth -> submit -> research -> citations) has never been exercised end to end. A lightweight test framework gives fast feedback in CI and one repeatable E2E loop against the live environment.

## What Changes

- Add Vitest 3 + jsdom + Testing Library as the unit test runner, with a dedicated `vitest.config.ts` so the CSP plugin and memory-limited build config never leak into tests.
- Add smoke tests for `useResearch` (mocked Supabase edge invoke), `SourceCitation`, and `MessageList`.
- Add Playwright for one E2E test of the research loop (login, new conversation, submit query, one researched answer with source cards).
- Add `data-testid` hooks on message bubbles and source citations to make E2E assertions stable.
- Add `test` and `e2e` scripts to package.json.
- Extend CI to run lint and the Vitest unit suite on every push/PR. Playwright stays local-only (requires live Supabase credentials; self-skips when absent).
- Add package.json devDependencies: vitest, jsdom, @testing-library/*, @playwright/test.

## Capabilities

### New Capabilities
- `test-framework`: Automated testing infrastructure — unit tests run in CI and an on-demand E2E loop against the live environment, with stable DOM hooks for assertions.

### Modified Capabilities
- (none)

## Impact

- Code: new `vitest.config.ts`, `vitest.setup.ts`, `src/vitest-setup.d.ts`, `playwright.config.ts`, `tests/e2e/`, `src/**/__tests__/`; two `data-testid` attributes added to existing components.
- Dependencies (devDeps): `vitest@^3.2`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `@playwright/test`.
- CI: `.github/workflows/ci.yml` gains Lint and Unit test steps; E2E is intentionally not in CI (would install ~150MB of browsers to run a self-skipping test without credentials).
- Systems: no production behavior, API, or schema changes.

## Non-goals

- No unit-test coverage threshold or coverage gates.
- No Playwright runs in CI (blocked on test-account credentials; E2E is a local, live-environment step).
- No end-to-end test of audio recording/Speechmatics STT (requires microphone + live credentials).
- No snapshot testing.
- No changes to production runtime code beyond two `data-testid` attributes.
