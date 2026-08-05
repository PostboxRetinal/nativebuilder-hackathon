## 1. SDD Documentation

- [ ] 1.1 Validate all 5 spec files format compliance (completed via `openspec validate`)
- [ ] 1.2 Archive change to sync delta specs to main specs (`openspec/specs/`)

## 2. Remaining Implementation (Task 6 - Conversation UI + Data Layer)

- [x] 2.1 Create `src/hooks/useConversations.ts` — conversation CRUD data hook (create, list, delete, active)
- [x] 2.2 Create `src/hooks/useMessages.ts` — message list hook with upsert on insert + order_index
- [x] 2.3 Create `src/components/ConversationSidebar.tsx` — sidebar with conversation list, new button, delete
- [x] 2.4 Create `src/components/MessageList.tsx` — message bubbles with role-based styling + source citations
- [ ] 2.5 Create `src/components/SourceCitation.tsx` — clickable citation card with title, favicon, snippet
- [x] 2.6 Create `src/components/ConversationView.tsx` — conversation layout with top bar, messages, input

## 3. Remaining Implementation (Task 7 - App Assembly + Research Integration)

- [ ] 3.1 Create `src/hooks/useResearch.ts` — research call hook wired to Edge Function
- [ ] 3.2 Wire VoiceInput submit to research pipeline (query -> save user message -> call research -> save answer + sources)
- [ ] 3.3 Wire research results to active conversation context
- [x] 3.4 Replace App.tsx placeholder with full layout: AuthProvider > AuthGate > Sidebar + MessageList + VoiceInput
- [ ] 3.5 End-to-end flow test: auth -> record -> transcribe -> submit research -> see answer with sources

## 4. Infrastructure

- [x] 4.1 GitHub Actions CI: tsc check + vite build on push to main
