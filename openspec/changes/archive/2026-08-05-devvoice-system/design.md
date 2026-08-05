## Context

DevVoice is a voice-powered developer research assistant built for the native.builder hackathon. The system captures voice input, transcribes it in real-time, submits queries to a research pipeline, and displays answers with source citations. Conversations are persisted in Supabase with full user isolation via RLS.

## Goals / Non-Goals

**Goals:**
- Formalize the architecture as documented SDD in OpenSpec format
- Specify all 5 system capabilities with testable requirements
- Provide a foundation for remaining tasks (6-7) and future changes

**Non-Goals:**
- Changing any existing code or API contracts
- Deploying new infrastructure
- Modifying database schema or Edge Function behavior

## Decisions

**Supabase as single backend:** Database, Auth, and Edge Functions all live in one Supabase project. This eliminates separate infra management and keeps secrets (Speechmatics, Bright Data, AI/ML keys) server-side only.

**Edge Functions for token provisioning:** Speechmatics session tokens are obtained via a Supabase Edge Function (`speechmatics-token`). The browser never sees the Speechmatics API key. Same pattern for the research pipeline.

**Real-time STT via WebSocket:** Speechmatics WebSocket API with PCM streaming (16kHz, mono, 16-bit LE) enables partial transcripts while recording. The `useSpeechmatics` hook encapsulates the full lifecycle: token fetch, WebSocket connect, PCM stream, partial/final handling, cleanup.

**Stale closure pattern:** React hooks capturing async state use `useRef` + `useEffect` sync to avoid stale closures in WebSocket callbacks (e.g., `stateRef.current` instead of `state` in `ws.onerror`).

**Conversation-first data model:** Three tables (conversations, messages, sources) with foreign keys and cascade deletes. RLS policies tie everything to `auth.uid()`. Conversations auto-title from the first user message.

**Rate limiting in Edge Functions:** The research Edge Function enforces per-user rate limits using Supabase PostgREST queries (count requests in last N seconds). Simple but effective for hackathon scale.

**Dark theme throughout:** Tailwind dark mode with AMOLED black background. No light theme support.

## Risks / Trade-offs

- [Natively web container limits] No minification or treeshaking means larger bundle sizes. Mitigation: Keep dependencies minimal, avoid heavy libraries.
- [External API dependencies] Bright Data, AI/ML API, and Speechmatics are third-party services. Mitigation: Graceful fallbacks with user-visible errors at every layer.
- [Supabase free tier rate limits] 500MB database, 2M auth users, function invocations limited. Acceptable for hackathon/demo scale.

## Open Questions

None — all architectural decisions are reflected in the existing implementation.
