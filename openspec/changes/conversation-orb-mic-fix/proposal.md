## Why

The conversation mode has three bugs: (1) mic animation dies after first response because state goes to "idle" while mic stream stays open, (2) messages split into separate bubbles because Speechmatics emits AddTranscript per segment, (3) can't close mic by tapping orb because toggle logic is wrong.

## What Changes

- Add stream tracking to `SpeechmaticsAdapter` so `stop()` properly closes `MediaStream` tracks and `AudioContext`
- Accumulate partial transcripts in `useVoiceAgent` buffer, only send to parent on `AddTranscript` final
- Return to "listening" state after `speak()` completes (not "idle")
- Fix `toggleConversation` to handle states correctly: speaking→stopTTS (stay listening), listening→stopListening (go idle), idle→startListening

## Capabilities

### Modified Capabilities

- `conversation-management`: Conversation mode now accumulates partial transcripts into single user message, maintains listening state across speak cycles
- `voice-input`: Mic stream cleanup — `SpeechmaticsAdapter.stop()` closes `MediaStream` tracks and `AudioContext`; `useVoiceAgent` returns to listening after TTS completes

## Impact

- `src/adapters/SpeechmaticsAdapter.ts`: save `mediaStream`/`audioContext` references, close in `stop()`
- `src/hooks/useVoiceAgent.ts`: add `transcriptBuffer` ref, return to "listening" after speak
- `src/components/ConversationModeView.tsx`: fix `toggleConversation` state machine
- No new dependencies. No API changes. No database changes.
