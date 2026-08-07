## 1. Unit testing framework (Vitest)

- [x] 1.1 Add devDeps: `vitest@^3.2`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`
- [x] 1.2 Create dedicated `vitest.config.ts` (jsdom + @vitejs/plugin-react, `tests/e2e` excluded) separate from `vite.config.ts`
- [x] 1.3 Create `vitest.setup.ts` importing `@testing-library/jest-dom/vitest` and stubbing `Element.prototype.scrollIntoView`
- [x] 1.4 Create `src/vitest-setup.d.ts` referencing the jest-dom/vitest matcher types
- [x] 1.5 Add `"test": "vitest run"` script to package.json
- [x] 1.6 Write `useResearch.test.ts` with mocked `supabase.functions.invoke` (success, invoke error, thrown error, researching toggle)
- [x] 1.7 Write `SourceCitation.test.tsx` (title+hostname, new-tab noopener, unparsable-url fallback, no-title fallback)
- [x] 1.8 Write `MessageList.test.tsx` (loading, empty, user+assistant content, source cards, researching bubble, no sources on user msg, malformed-source drop)
- [x] 1.9 Verify `bun run test` passes (15/15)

## 2. E2E framework (Playwright)

- [x] 2.1 Add devDep: `@playwright/test`
- [x] 2.2 Create `playwright.config.ts` (testDir `tests/e2e`, webServer `bun dev` on :5173, single worker)
- [x] 2.3 Add `data-testid` to assistant message bubble and source citation
- [x] 2.4 Write `tests/e2e/research-loop.spec.ts` (login, New Chat, submit query, researching indicator, one assistant bubble with source cards; self-skips without credentials)
- [x] 2.5 Add `"e2e": "playwright test"` script
- [x] 2.6 Verify `bunx playwright test --list` loads the spec

## 3. CI integration

- [x] 3.1 Add Lint step (`bunx eslint .`) to CI
- [x] 3.2 Add Unit tests step (`bun run test`) to CI, preserving least-privilege `permissions`
- [x] 3.3 Confirm full gate passes: tsc 0, eslint 0, vitest 15/15, build 0
