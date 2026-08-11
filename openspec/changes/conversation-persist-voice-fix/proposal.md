## Why

The conversation mode has two critical bugs: (1) messages are not persisted to Supabase — only the first message stays, subsequent LLM responses create new bubbles instead of appending to the conversation; (2) TTS voice changes between responses because `reference_id` was client-side and the fallback to Web Speech API produced unpredictable system voices.

## What Changes

- Add `conversationId` prop to `ConversationModeView` and pass it from `ConversationView`
- Wire `useMessages(conversationId).addMessage()` to persist user and assistant messages in `onUserTranscriptFinal`
- Add `initialMessages` option to `useVoiceAgent` to seed local state with existing messages
- Remove `fallbackSpeak()` from `FishAudioTTSAdapter` — propagate errors instead of silent fallback
- Move `FISH_AUDIO_REFERENCE_ID` from client `.env` to Supabase Edge Function secret
- Update `fish-tts` Edge Function to read `reference_id` from `Deno.env.get()`

## Capabilities

### Modified Capabilities

- `conversation-management`: Add message persistence in conversation mode — user and assistant messages now persist via `useMessages().addMessage()` and are seeded on entry via `initialMessages`
- `voice-input`: TTS voice consistency — `reference_id` is now server-side (Supabase secret), fallback to Web Speech API removed, errors propagate to UI

## Impact

- `src/components/ConversationModeView.tsx`: new prop, `useMessages` integration, `initialMessages` pass-through
- `src/components/ConversationView.tsx`: pass `conversationId` prop
- `src/hooks/useVoiceAgent.ts`: new `initialMessages` option
- `src/adapters/FishAudioTTSAdapter.ts`: remove `fallbackSpeak`, remove `referenceId` field, propagate errors
- `src/adapters/createAdapters.ts`: remove `VITE_FISH_AUDIO_REFERENCE_ID` read
- `src/vite-env.d.ts`: remove `VITE_FISH_AUDIO_REFERENCE_ID` type
- `supabase/functions/fish-tts/index.ts`: read `FISH_AUDIO_REFERENCE_ID` from `Deno.env.get()`
- No new dependencies. No API changes. No database schema changes.
