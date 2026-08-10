## Why

The current voice input requires manual start/stop for each utterance. For a conversational flow, the user expects to speak naturally with pauses and have the system detect when they're done — not tap a button after every sentence. Speechmatics already supports server-side end-of-utterance detection, but the app doesn't enable it. Adding a conversation mode toggle with live waveform visualization makes the interaction natural and demonstrates Speechmatics' real-time capabilities.

## What Changes

- Enable Speechmatics `end_of_utterance_silence_trigger` (0.5s) in the transcription config.
- Handle `EndOfUtterance` event to auto-finalize transcripts.
- Add a `conversationMode` toggle in the composer.
- Create a `WaveformVisualizer` component using Web Audio API (`AnalyserNode` + Canvas).
- Expose `MediaStream` from `useSpeechmatics` for visualization.
- Wire the waveform and toggle into `ConversationView` and `VoiceInput`.

## Capabilities

### Modified Capabilities

- `voice-input`: Add conversation mode with end-of-utterance detection and live waveform visualization.

## Impact

- `src/hooks/useSpeechmatics.ts`: add `conversation_config`, handle `EndOfUtterance`, expose `stream`.
- `src/hooks/useVoiceComposer.ts`: add `conversationMode` state and auto-finalize effect.
- `src/components/WaveformVisualizer.tsx`: new component.
- `src/components/ConversationView.tsx`: render waveform, pass conversation mode props.
- `src/components/VoiceInput.tsx`: add conversation mode toggle button.
- No new dependencies. No API changes. No database changes.
