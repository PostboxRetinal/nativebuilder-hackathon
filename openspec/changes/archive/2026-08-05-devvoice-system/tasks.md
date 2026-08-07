## 1. SDD Documentation

- [x] 1.1 Validate all 5 spec files format compliance (completed via `openspec validate --all` - 5 passed, 0 failed)
- [x] 1.2 Archive change to sync delta specs to main specs (`openspec/specs/`)
- [x] 1.3 OpenSpec CLI updated to v1.8.0

## 2. Remaining Implementation (Task 6 - Conversation UI + Data Layer)

- [x] 2.1 Create `src/hooks/useConversations.ts` - conversation CRUD data hook (create, list, delete, active)
- [x] 2.2 Create `src/hooks/useMessages.ts` - message list hook with upsert on insert + order_index
- [x] 2.3 Create `src/components/ConversationSidebar.tsx` - sidebar with conversation list, new button, delete
- [x] 2.4 Create `src/components/MessageList.tsx` - message bubbles with role-based styling + source citations
- [ ] 2.5 Create `src/components/SourceCitation.tsx` - clickable citation card with title, favicon, snippet
- [x] 2.6 Create `src/components/ConversationView.tsx` - conversation layout with top bar, messages, input

## 3. Remaining Implementation (Task 7 - App Assembly + Research Integration)

- [ ] 3.1 Create `src/hooks/useResearch.ts` - research call hook wired to Edge Function
- [ ] 3.2 Wire VoiceInput submit to research pipeline (query -> save user message -> call research -> save answer + sources)
- [ ] 3.3 Wire research results to active conversation context
- [x] 3.4 Replace App.tsx placeholder with full layout: AuthProvider > AuthGate > Sidebar + MessageList + VoiceInput
- [ ] 3.5 End-to-end flow test: auth -> record -> transcribe -> submit research -> see answer with sources

## 4. Infrastructure

- [x] 4.1 GitHub Actions CI: tsc check + vite build on push to main
- [ ] 4.2 GitHub Actions: add explicit `permissions: contents: read` (CodeQL alert #1)

## 5. Security (OWASP Top 10 2021)

> Plan: `.hermes/plans/2026-08-06_OWASP-e2e-check.md`

- [ ] 5.1 Add ESLint security plugin (`eslint-plugin-security`)
- [ ] 5.2 Migrate to official Speechmatics SDK (`@speechmatics/real-time-client`) - eliminate JWT in WS URL
- [ ] 5.3 Add Content Security Policy header via Vite
- [ ] 5.4 Strengthen password policy (min 8 chars, complexity)
- [ ] 5.5 Verify Supabase RLS policies on `conversations` + `messages`
- [ ] 5.6 Add rate limiting on auth endpoints
- [ ] 5.7 Harden Vite build config (`minify: 'esbuild'`, `sourcemap`)
- [ ] 5.8 Document external deps (SRI not applicable for bundled)
- [ ] 5.9 Run `bun audit` - fix high/critical CVEs
- [ ] 5.10 Generate OWASP audit report (`.hermes/reports/owasp-audit-2026-08-06.md`)
- [ ] 4.2 GitHub Actions: add explicit `permissions: contents: read` (CodeQL alert #1)

## 5. Security (OWASP Top 10 2021)

> Plan: `.hermes/plans/2026-08-06_OWASP-e2e-check.md`

- [ ] 5.1 Add ESLint security plugin (`eslint-plugin-security`)
- [ ] 5.2 Migrate to official Speechmatics SDK (`@speechmatics/real-time-client`) - eliminate JWT in WS URL
- [ ] 5.3 Add Content Security Policy header via Vite
- [ ] 5.4 Strengthen password policy (min 8 chars, complexity)
- [ ] 5.5 Verify Supabase RLS policies on `conversations` + `messages`
- [ ] 5.6 Add rate limiting on auth endpoints
- [ ] 5.7 Harden Vite build config (`minify: 'esbuild'`, `sourcemap`)
- [ ] 5.8 Document external deps (SRI not applicable for bundled)
- [ ] 5.9 Run `bun audit` - fix high/critical CVEs
- [ ] 5.10 Generate OWASP audit report (`.hermes/reports/owasp-audit-2026-08-06.md`)
