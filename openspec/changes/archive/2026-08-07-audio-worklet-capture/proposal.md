## Why

The microphone capture path uses the deprecated `ScriptProcessorNode` API, which emits a deprecation warning and runs audio processing on the main thread. Migrating to the `AudioWorklet` API removes the deprecation, lowers capture latency, and moves PCM conversion off the main thread.

## What Changes

- Replace the `ScriptProcessorNode` capture in `src/hooks/useSpeechmatics.ts` with an `AudioWorkletNode`.
- Add a dedicated `AudioWorkletProcessor` as a standalone served asset (`public/audio-processor.js`) that forwards raw `Float32Array` input to the main thread via `MessagePort`.
- Convert captured frames to PCM16 on the main thread as before; the outgoing audio format and Speechmatics stream contract are unchanged.
- Keep the existing cleanup, stop, and error-handling semantics.

## Capabilities

### New Capabilities

None. No new externally observable behavior is introduced.

### Modified Capabilities

None. The `voice-input` contract (PCM 16kHz, mono, 16-bit little-endian streaming to Speechmatics) is unchanged. This is a pure implementation refactor, so the change declares `skip_specs: true`.

## Impact

- `src/hooks/useSpeechmatics.ts`: switched from `ScriptProcessorNode` to `AudioWorkletNode`.
- `public/audio-processor.js`: new static asset loaded via `AudioContext.audioWorklet.addModule()`.
- No dependency, API, or schema changes. Build and lint behavior unchanged.

## Non-Goals

- No change to the PCM format, sample rate, or Speechmatics session flow.
- No change to transcription behavior, partials, or error handling.
- No migration to the `?url` import pattern (kept `public/` for dev/prod path robustness).
