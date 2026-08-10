## Context

See proposal.md - Why.

The current `useSpeechmatics.ts` captures mic input, streams PCM to Speechmatics via WebSocket, and emits partial/final text. It does not enable `conversation_config` and ignores `EndOfUtterance` events. The `MediaStream` is available internally but not exposed. The composer (`useVoiceComposer.ts`) is stateless about conversation mode.

## Goals / Non-Goals

**Goals:** Add a conversation mode toggle that enables Speechmatics end-of-utterance detection, renders a live waveform during recording, and auto-finalizes transcripts without manual stop.

**Non-Goals:** Auto-submitting transcripts on utterance end (user keeps edit control), multi-turn conversation memory, configurable silence threshold (post-deadline).

## Decisions

**1. Enable `conversation_config` unconditionally, not gated by conversation mode flag.**

The `end_of_utterance_silence_trigger` config affects only how the server signals end-of-utterance. In manual mode, the app already transitions to `done` on `EndOfUtterance`, which fires after a pause — this is harmless and actually improves UX even without the toggle. Keeping it simple: the config is always on, and the conversation mode toggle primarily affects UI behavior (waveform visibility, auto-populate edited text).

**Rationale:** Avoids branching logic in the hook. The event handler is idempotent.

**Alternative considered:** Gating `conversation_config` behind `conversationMode` flag — rejected because it adds complexity for no functional benefit (EndOfUtterance is benign in manual mode).

**2. Handle `EndOfUtterance` as a state transition to `done`.**

The existing `receiveMessage` listener already handles `AddPartialTranscript` and `AddTranscript`. Adding an `EndOfUtterance` branch that sets `state = "done"` when recording is active auto-finalizes the transcript.

**Rationale:** Minimal change, leverages existing state machine.

**3. Expose `MediaStream` via React state in `useSpeechmatics`.**

Add `const [stream, setStream] = useState<MediaStream | null>(null)`, set it on capture, clear on cleanup. This allows the waveform component to tap the audio without refactoring the internal `streamRef` architecture.

**Rationale:** The ref-based architecture is needed for cleanup callbacks. State is needed for rendering. Both coexist.

**4. Waveform via `AnalyserNode` + `requestAnimationFrame` + Canvas.**

Standard Web Audio API pattern. The `AnalyserNode` is connected to the `MediaStreamSource` (not the Speechmatics pipeline) so it renders raw mic input without interfering with transcription.

**Rationale:** Zero dependencies, works in all modern browsers, < 50 lines of code.

**Alternative considered:** CSS-based waveform (pure animation driven by a timer) — rejected because it wouldn't reflect actual audio input, which is the entire point.

**5. Conversation mode toggle in `VoiceInput.tsx`.**

A new button next to the mic that toggles `conversationMode`. Visual distinction: cyan accent when active, muted when inactive. SVG icon: microphone with sound waves.

**Rationale:** Visible, accessible, doesn't break the 44px composer row layout.

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| `EndOfUtterance` fires too early (brief pause mid-sentence) | Default 0.5s is conservative; user can re-record if cut off |
| `AnalyserNode` adds CPU overhead during recording | Only active during recording; cleaned up on unmount |
| Waveform canvas may cause layout shift | Fixed height (`h-[60px]`), only renders when recording |
| Exposing `MediaStream` slightly increases API surface | Read-only; no new permissions needed |
