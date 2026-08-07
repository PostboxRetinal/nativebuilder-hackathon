## Why

The real-time transcription currently hard-codes `transcription_config.language: "en"`, so any non-English speech (e.g. Spanish, the user's primary language) is transcribed through the wrong language model and produces poor results. Real-time STT requires an explicit language; there is no auto-detect in the realtime API. Users need to pick their input language.

## What Changes

- Add a language selector to the voice input UI toggling between English and Spanish.
- Wire the selected language into `useSpeechmatics` and pass it to `client.start()` as `transcription_config.language` (`en` or `es`).
- Default the selector to English (current behavior) so nothing regresses until the user changes it.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `voice-input`: the PCM streaming requirement is unchanged, but a new requirement is added for user-selectable transcription language that propagates to the Speechmatics session.

## Impact

- `src/components/VoiceInput.tsx`: adds the language selector control.
- `src/hooks/useSpeechmatics.ts`: accepts and forwards the selected language to `transcription_config`.
- Speechmatics session: `language` becomes `en` or `es` instead of a hard-coded `en`.
- No dependency, schema, or API-surface changes.

## Non-Goals

- No auto language detection (not available in realtime API).
- No additional languages beyond English and Spanish in this change.
- No persistence of the selection beyond the session.
- No change to the research pipeline or its language handling.
