## Context

See proposal.md - Why.

The current `SpeechmaticsAdapter` closes the WebSocket on `stop()` but leaves the `MediaStream` and `AudioContext` open. The `useVoiceAgent` hook calls `onUserTranscriptFinal` for every `AddTranscript` event (per-segment), and `speak()` returns to "idle" state. The `toggleConversation` in `ConversationModeView` has incorrect logic for the speaking state.

## Goals / Non-Goals

**Goals:**
- Properly release microphone hardware on stop
- Accumulate Speechmatics segments into single user message
- Maintain listening state across speak cycles
- Fix orb toggle to correctly handle all states

**Non-Goals:**
- Auto-send on silence detection (user taps orb to send)
- Message editing before send
- TTS voice selection UI

## Decisions

**1. Save MediaStream/AudioContext references in SpeechmaticsAdapter**

Add `private mediaStream: MediaStream | null = null` and `private audioContext: AudioContext | null = null` fields. Set them in `startAudioCapture()`, close in `stop()`.

**Rationale:** The adapter already has access to these objects in `startAudioCapture()`. Saving references is the minimal change to enable cleanup.

**Alternative considered:** Return stream from `start()` — rejected because it changes the adapter interface and complicates the `useVoiceAgent` hook.

**2. Accumulate transcripts in useVoiceAgent buffer**

Add `const transcriptBuffer = useRef<string>("")`. On `AddPartialTranscript`, set `transcriptBuffer.current = data.text`. On `AddTranscript`, use `transcriptBuffer.current` as the finalized text and clear buffer.

**Rationale:** Speechmatics emits `AddTranscript` per utterance segment (words/phrases), not per sentence. Buffering in the hook decouples accumulation from the UI and the parent callback.

**Alternative considered:** Accumulate in `ConversationModeView` — rejected because it spreads logic across components and complicates testing.

**3. Return to "listening" after speak()**

Change `speak()` finally block from `setStateAndEmit("idle")` to `setStateAndEmit("listening")`.

**Rationale:** After TTS completes, the user should be able to continue speaking without re-tapping. The mic is still open; only TTS stopped.

**Alternative considered:** Add a new "ready" state — rejected because "listening" already means "mic active, waiting for input".

**4. Fix toggleConversation state machine**

- speaking → stopSpeaking() (interrupt TTS, stay listening)
- listening → stopListening() (close mic, go idle)
- idle → startListening() (open mic, go listening)

**Rationale:** Each state has exactly one correct transition on tap. The previous logic called both `stopSpeaking()` and `stopListening()` when speaking, which was redundant.

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| Double-stop throws error | Null checks in `stop()` guard against double-close |
| Buffer not cleared on stop | `stopListening()` clears `transcriptBuffer.current = ""` |
| speak() error leaves state in "listening" | `finally` block always runs |
| User expects immediate AI response per segment | Now waits for full sentence — documented in UI text |

## Migration Plan

1. Deploy frontend (Vercel) — no migration needed, all changes are backward-compatible
2. No database changes
3. No API changes

**Rollback:** Revert frontend deployment. The state machine changes are purely client-side.

## Open Questions

None.
