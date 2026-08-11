## 1. Persistence: Conversation Mode Messages

- [x] 1.1 Add `conversationId: string` prop to `ConversationModeView` component (`src/components/ConversationModeView.tsx`)
- [x] 1.2 Pass `conversationId` prop from `ConversationView` (`src/components/ConversationView.tsx`)
- [x] 1.3 Import `useMessages` hook and call `addMessage("user", text)` before research in `onUserTranscriptFinal` (`src/components/ConversationModeView.tsx`)
- [x] 1.4 Call `addMessage("assistant", response)` after research completes in `onUserTranscriptFinal` (`src/components/ConversationModeView.tsx`)
- [x] 1.5 Add `initialMessages?: ChatMessage[]` option to `useVoiceAgent` hook (`src/hooks/useVoiceAgent.ts`)
- [x] 1.6 Initialize `messages` state with `initialMessages` in `useVoiceAgent` (`src/hooks/useVoiceAgent.ts`)

## 2. TTS: Consistent Voice

- [x] 2.1 Remove `referenceId` field and parameter from `FishAudioTTSAdapter` (`src/adapters/FishAudioTTSAdapter.ts`)
- [x] 2.2 Remove `fallbackSpeak()` method from `FishAudioTTSAdapter` (`src/adapters/FishAudioTTSAdapter.ts`)
- [x] 2.3 Propagate errors from Edge Function via `throw new Error()` in `speak()` (`src/adapters/FishAudioTTSAdapter.ts`)
- [x] 2.4 Remove `VITE_FISH_AUDIO_REFERENCE_ID` read from `createAdapters.ts` (`src/adapters/createAdapters.ts`)
- [x] 2.5 Remove `VITE_FISH_AUDIO_REFERENCE_ID` type from `vite-env.d.ts` (`src/vite-env.d.ts`)

## 3. Edge Function: Server-Side Secret

- [x] 3.1 Read `FISH_AUDIO_REFERENCE_ID` from `Deno.env.get()` in `fish-tts` Edge Function (`supabase/functions/fish-tts/index.ts`)
- [x] 3.2 Remove `reference_id` from client request body type in EF (`supabase/functions/fish-tts/index.ts`)

## 4. Tests and Verification

- [x] 4.1 Update `FishAudioTTSAdapter.test.ts` for new constructor and error propagation (`src/adapters/FishAudioTTSAdapter.test.ts`)
- [x] 4.2 Update `ConversationModeView.test.tsx` with `conversationId` prop (`src/components/ConversationModeView.test.tsx`)
- [x] 4.3 Run typecheck (`bun run typecheck`) — 0 errors
- [x] 4.4 Run tests (`bun run test`) — 173/173 pass
- [x] 4.5 Run coverage — above thresholds (60/53/66/60)
- [x] 4.6 Run lint (`bun run lint`) — 0 errors

## 5. Deployment

- [x] 5.1 Set `FISH_AUDIO_REFERENCE_ID` secret in Supabase (`supabase secrets set`)
- [x] 5.2 Deploy `fish-tts` Edge Function (`supabase functions deploy`)
- [x] 5.3 Validate SDD (`openspec validate --all`)
