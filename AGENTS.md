# DevVoice - Agent Instructions

Voice-powered developer research assistant for the native.builder hackathon.

## Architecture

```
Browser (React + Vite + Tailwind)
  |
  |-- Auth: Supabase (email/password, implicit flow)
  |-- STT: Speechmatics (WebSocket, PCM 16kHz)
  |-- Research: Supabase Edge Function (Bright Data + AI/ML API)
  |-- Storage: Supabase DB (conversations + messages, RLS enforced)
```

### Frontend (this repo)
- React 19, TypeScript, Vite, Tailwind v3
- Auth: `src/contexts/AuthContext.tsx` + `src/components/AuthScreen.tsx`
- Voice: `src/components/VoiceInput.tsx` + `src/hooks/useSpeechmatics.ts`
- DB client: `src/lib/supabase.ts` (types in `src/lib/database.types.ts`)
- Design: dark theme, dotgrid-glow background, system-ui font

### Backend (Supabase, not in this repo)
- **speechmatics-token** Edge Function: mints JWTs for Speechmatics WebSocket
  - Endpoint: `https://vpditxpomxixcijriyzg.supabase.co/functions/v1/speechmatics-token`
  - Auth: JWT required. Secret: `SPEECHMATICS_API_KEY`
- **research** Edge Function: tool-calling loop (Bright Data + AI/ML API)
  - Endpoint: `https://vpditxpomxixcijriyzg.supabase.co/functions/v1/research`
  - Auth: JWT required. Secrets: `AIML_API_KEY`, `BRIGHTDATA_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- **Supabase DB**: project ref `vpditxpomxixcijriyzg`
  - Tables: `conversations`, `messages` (RLS policies active)
  - URL: `https://vpditxpomxixcijriyzg.supabase.co`
  - Anon key: in `src/lib/supabase.ts`

## How to Develop

### Environment
- Web container sandbox: extremely tight memory limits
- `vite.config.ts` has aggressive OOM protection: `minify: false`, `treeshake: false`, `NODE_OPTIONS='--max-old-space-size=100'`, `external: ['@supabase/supabase-js']`
- `index.html` has importmap for Supabase (loaded from esm.sh)
- These constraints are INTENTIONAL. Do not remove or relax them unless OOM is no longer an issue.

### Commands
```bash
pnpm install          # install deps
pnpm dev              # start dev server (128MB limit)
pnpm build            # production build (100MB limit)
```

### Secrets
- NO secrets in this repo. All API keys live in Supabase Edge Function secrets.
- Never hardcode `SPEECHMATICS_API_KEY`, `BRIGHTDATA_API_KEY`, `AIML_API_KEY`, or `SUPABASE_SERVICE_ROLE_KEY`.
- The Supabase publishable key (`sb_publishable_...`) is safe in client code.

### Code Conventions
- TypeScript strict mode enabled
- React hooks only (no class components)
- Tailwind utility classes for all styling (no CSS modules or styled-components)
- Dark theme only (no light mode)
- Use `src/lib/database.types.ts` for type-safe Supabase queries
- Component files: PascalCase, one component per file
- Custom hooks: `use*` prefix, lowercase

### TypeScript Best Practices
- No `any` - use `unknown` and narrow with type guards
- Null/undefined: use `!= null` checks (catches both); never rely on truthiness for strings or numbers
- Explicit return types on all exported functions
- `const` over `let`; no `var`
- Discriminated unions for state machines; exhaustive checks with `never`
- `useCallback` on all functions passed as props or used in dependency arrays
- `useRef` for persistent mutable values (channels, timers, IDs)
- useEffect cleanup: always return cleanup; use `cancelled` flag for async operations
- Supabase real-time: `useRef` for channel + `supabase.removeChannel()` in cleanup
- Relative imports only (no `@/` alias)
- `satisfies` operator for literal type inference

## Project Status

### Completed
1. Supabase Foundation (schema, RLS, types, auth config)
2. Speechmatics Token Edge Function
3. Research Edge Function (Bright Data + AI/ML API tool loop)
4. Auth UI + Supabase Client
5. Voice Input + Real-time Transcription
6. Conversation Data Layer: `useConversations.ts`, `useMessages.ts`
7. Conversation UI: `ConversationSidebar.tsx`, `MessageList.tsx`, `ConversationView.tsx`
8. App Assembly: AuthProvider > AuthGate > Sidebar + MessageList + VoiceInput layout
9. Research Pipeline: `useResearch.ts` hook + `SourceCitation.tsx` cards + `Message` type widened with `sources` + wiring in `ConversationView` (user msg -> research EF -> assistant msg with sources)

### Pending
- End-to-end flow test (manual): auth -> record -> transcribe -> submit research -> see answer with sources

### Security (OWASP Top 10 2021) - Plan: `.hermes/plans/2026-08-06_OWASP-e2e-check.md`
- ESLint security plugin (`eslint-plugin-security`)
- Migrate to official Speechmatics SDK (`@speechmatics/real-time-client`) - eliminate JWT in WS URL
- Add Content Security Policy header
- Strengthen password policy (min 8 chars, complexity)
- Verify Supabase RLS policies on `conversations` + `messages`  [DONE 2026-08-07: verified via Supabase MCP - all CRUD scoped by auth.uid(), anon has no access]
- Add rate limiting on auth endpoints
- Harden Vite build config (`minify: 'esbuild'`, `sourcemap`)
- Run `bun audit` - fix high/critical CVEs  [DONE 2026-08-07: audit clean, no vulnerabilities]
- Generate OWASP audit report

### Known Bugs
- No known bugs at this time.

## File Map

```
src/
  App.tsx                    # Main app: AuthProvider > AuthGate > Sidebar + MessageList + VoiceInput
  main.tsx                   # Entry point
  index.css                  # Tailwind + custom utilities (dotgrid-glow, pulse animation)
  components/
    AuthScreen.tsx           # Sign in / sign up UI
    VoiceInput.tsx           # Mic button + transcription + edit flow
    ConversationSidebar.tsx  # Conversation list, new button, delete
    MessageList.tsx          # Message bubbles with role-based styling
    ConversationView.tsx     # Conversation layout with top bar, messages, input
  contexts/
    AuthContext.tsx          # Auth state, signIn/signUp/signOut
  hooks/
    useSpeechmatics.ts       # WebSocket client for Speechmatics STT
    useConversations.ts      # Conversation CRUD data hook
    useMessages.ts           # Message list hook with upsert + order_index
  lib/
    supabase.ts              # Supabase client instance
    database.types.ts        # Generated DB types
supabase/                    # (Empty - Edge Functions deployed via natively, not in repo)
```

## External Services

| Service | Purpose | Integration |
|---------|---------|-------------|
| Supabase | Auth, DB, Edge Functions | SDK client + direct fetch for Edge |
| Speechmatics | Real-time STT | WebSocket via JWT from Edge Function |
| Bright Data | SERP + Web Unlocker | Called by research Edge Function |
| AI/ML API | LLM tool calling | Called by research Edge Function |
