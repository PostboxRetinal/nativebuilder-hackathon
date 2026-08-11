## Context

See proposal.md - Why.

The current `ConversationModeView` does not persist messages — only the first message stays because subsequent responses create new bubbles instead of appending. The TTS voice is inconsistent because `reference_id` was client-side and the fallback to Web Speech API produced unpredictable system voices. The `useVoiceAgent` hook initializes with an empty message array every time conversation mode is entered, losing history.

## Goals / Non-Goals

**Goals:**
- Persist user and assistant messages in conversation mode via `useMessages().addMessage()`
- Seed local message state with existing messages on conversation mode entry
- Consistent TTS voice via server-side `FISH_AUDIO_REFERENCE_ID` secret
- Explicit TTS errors in UI instead of silent fallback

**Non-Goals:**
- Message editing or deletion
- Multi-conversation support (single active conversation)
- TTS voice selection UI (voice is server-configured)

## Decisions

**1. Persist messages in `onUserTranscriptFinal` callback**

The `ConversationModeView` calls `addMessage("user", text)` before the research call and `addMessage("assistant", response)` after. This ensures both sides of the conversation are persisted with correct roles.

**Rationale:** The callback is the single point where both user input and assistant output are known. Persisting here guarantees consistency.

**Alternative considered:** Persisting in `useVoiceAgent` via a separate effect — rejected because it decouples persistence from the conversation flow and makes ordering harder to guarantee.

**2. Seed local state with `initialMessages`**

`useVoiceAgent` accepts an optional `initialMessages: ChatMessage[]` option that initializes the `messages` state. `ConversationModeView` passes an empty array (placeholder for future expansion).

**Rationale:** Keeps the hook flexible. The empty array maintains current behavior while enabling future pre-loading from the database.

**Alternative considered:** Loading messages from the database directly in the hook — rejected because it couples the hook to Supabase and complicates testing.

**3. Remove `fallbackSpeak()` from adapter**

The `FishAudioTTSAdapter.speak()` method now throws errors instead of catching them and falling back to `speechSynthesis`. The error propagates to `useVoiceAgent` which sets the message status to `error` and displays it in the UI.

**Rationale:** Silent fallback to a different voice is a bug, not a feature. Users should know when TTS fails.

**Alternative considered:** Logging a warning but still playing fallback — rejected because voice consistency is a core requirement.

**4. Server-side `reference_id`**

The `fish-tts` Edge Function reads `FISH_AUDIO_REFERENCE_ID` from `Deno.env.get()`. The client no longer sends `reference_id` in the request body.

**Rationale:** Keeps voice configuration server-side, prevents exposure in the bundle, and ensures consistent voice across all clients.

**Alternative considered:** Per-user voice preferences in the database — rejected as over-engineering for current scope.

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| `addMessage` fails silently (network error) | UI shows optimistic update; error logged to console |
| `FISH_AUDIO_REFERENCE_ID` secret not set | EF uses `undefined`, Fish Audio defaults to its default voice (same as before) |
| No fallback TTS when Fish Audio fails | Error displayed in UI; user can read the text response |
| Race condition: rapid messages | `addMessage` uses Supabase INSERT; `order_index` handled by DB default |

## Migration Plan

1. Deploy updated `fish-tts` Edge Function (reads `FISH_AUDIO_REFERENCE_ID` from secret)
2. Set `FISH_AUDIO_REFERENCE_ID` secret via `supabase secrets set`
3. Deploy frontend (Vercel) — no migration needed, `VITE_FISH_AUDIO_REFERENCE_ID` removal is backward-compatible

**Rollback:** Revert frontend deployment. The EF change is backward-compatible (if `reference_id` is missing, Fish Audio uses default voice).

## Open Questions

None.
