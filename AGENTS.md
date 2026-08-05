# DevVoice — Agent Instructions

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
- Design: dark theme, dotgrid-glow background, Inter font

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

## Project Status

### Completed (Tasks 1-5)
1. Supabase Foundation (schema, RLS, types, auth config)
2. Speechmatics Token Edge Function
3. Research Edge Function (Bright Data + AI/ML API tool loop)
4. Auth UI + Supabase Client
5. Voice Input + Real-time Transcription

### Pending (Tasks 6-7)
6. **Conversation UI + Data Layer**: `useConversations.ts`, `useMessages.ts`, `ConversationSidebar.tsx`, `MessageList.tsx`, `ConversationView.tsx`
7. **App Assembly**: Wire everything in `App.tsx`, research pipeline integration, auto-title, navigation, polish

### Known Bugs
- `tsconfig.json`: `erasableSyntaxOnly` is not a valid TypeScript option (line 21)
- `useSpeechmatics.ts`: stale closure on `state` in `ws.onerror` (line ~241) — should use `useRef` instead

## File Map

```
src/
  App.tsx                    # Main app, auth routing, placeholder for conversation UI
  main.tsx                   # Entry point
  index.css                  # Tailwind + custom utilities (dotgrid-glow, pulse animation)
  components/
    AuthScreen.tsx           # Sign in / sign up UI
    VoiceInput.tsx           # Mic button + transcription + edit flow
  contexts/
    AuthContext.tsx          # Auth state, signIn/signUp/signOut
  hooks/
    useSpeechmatics.ts       # WebSocket client for Speechmatics STT
  lib/
    supabase.ts              # Supabase client instance
    database.types.ts        # Generated DB types
supabase/                    # (Empty — Edge Functions deployed via natively, not in repo)
```

## External Services

| Service | Purpose | Integration |
|---------|---------|-------------|
| Supabase | Auth, DB, Edge Functions | SDK client + direct fetch for Edge |
| Speechmatics | Real-time STT | WebSocket via JWT from Edge Function |
| Bright Data | SERP + Web Unlocker | Called by research Edge Function |
| AI/ML API | LLM tool calling | Called by research Edge Function |
