## 1. Mic Stream Cleanup (SpeechmaticsAdapter)

- [x] 1.1 Add `mediaStream` and `audioContext` private fields to `SpeechmaticsAdapter` (`src/adapters/SpeechmaticsAdapter.ts`)
- [x] 1.2 Save references in `startAudioCapture()` (`src/adapters/SpeechmaticsAdapter.ts`)
- [x] 1.3 Close MediaStream tracks and AudioContext in `stop()` (`src/adapters/SpeechmaticsAdapter.ts`)

## 2. Transcript Accumulation (useVoiceAgent)

- [x] 2.1 Add `transcriptBuffer` ref to `useVoiceAgent` (`src/hooks/useVoiceAgent.ts`)
- [x] 2.2 Set `transcriptBuffer.current` in `handleTranscriptPartial` (`src/hooks/useVoiceAgent.ts`)
- [x] 2.3 Use `transcriptBuffer.current` in `handleTranscriptFinal` and clear buffer (`src/hooks/useVoiceAgent.ts`)

## 3. State Machine Fix (useVoiceAgent + ConversationModeView)

- [x] 3.1 Change `speak()` finally block to return to "listening" (`src/hooks/useVoiceAgent.ts`)
- [x] 3.2 Fix `toggleConversation` to interrupt TTS only when speaking (`src/components/ConversationModeView.tsx`)

## 4. Tests

- [x] 4.1 Update `SpeechmaticsAdapter.test.ts` with MediaStream mock and track.stop() verification (`src/adapters/SpeechmaticsAdapter.test.ts`)
- [x] 4.2 Update `useVoiceAgent.test.ts` to expect "listening" after speak (`src/hooks/useVoiceAgent.test.ts`)

## 5. Verification

- [x] 5.1 Run typecheck (`bun run typecheck`) — 0 errors
- [x] 5.2 Run tests (`bun run test`) — 174/174 pass
- [x] 5.3 Run coverage (`bun run test --coverage`) — above thresholds
- [x] 5.4 Run lint (`bun run lint`) — 0 errors
- [x] 5.5 Validate SDD (`openspec validate --all`) — all pass
