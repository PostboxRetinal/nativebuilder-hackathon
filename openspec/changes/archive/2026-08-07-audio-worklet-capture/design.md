## Context

The current capture path in `src/hooks/useSpeechmatics.ts` uses `ScriptProcessorNode` (buffer 4096) to convert microphone `Float32Array` to PCM16 and stream to Speechmatics. That API is deprecated and runs on the main thread. Snapshot: the outgoing contract is `audio_format: { type: "raw", encoding: "pcm_s16le", sample_rate: 16000 }`. See proposal.md - Why for motivation.

## Goals / Non-Goals

**Goals:**
- Move capture off the main thread and off the deprecated API.
- Preserve the exact PCM16/Speechmatics byte stream.
- Keep cleanup, stop, and error semantics identical.

**Non-Goals:**
- No changes to transcription, partials, or session flow.
- No `?url`/hashed-asset migration (see decisions).

## Decisions

- **AudioWorklet over ScriptProcessorNode.** The worklet runs on the dedicated audio rendering thread, removing the deprecation and the main-thread processing cost, and lowers latency via the ~128-sample default buffer.
- **Standalone processor in `public/` loaded by path.** AudioWorklet processors must be served as their own module and loaded with `audioContext.audioWorklet.addModule(url)`. `public/audio-processor.js` is copied verbatim to `dist/` and served at `/audio-processor.js` in both dev and production, which guarantees identical path resolution. The processor copies each input channel and posts the `Float32Array` to the main thread; PCM16 conversion stays on the main thread where the existing `float32ToPcm16()` helper lives.
  - Alternatives considered: `import workletUrl from './x?url'` (hashed asset) and `new URL('./x', import.meta.url)`. Both add build-path risk for worklets (known Vite issue) for marginal benefit on a ~20-line static file. Declined for robustness.
- **No destination connection.** ScriptProcessor required closing the graph to `destination`; an AudioWorkletNode with 0 outputs does not. `source.connect(workletNode)` suffices.
- **Global declarations in the worklet.** `AudioWorkletProcessor` and `registerProcessor` are globals of the worklet scope, not the DOM. Declared via `/* global */` comment so ESLint's `no-undef` stays strict elsewhere.

## Risks / Trade-offs

- [Worklet file not served on some deploy target] -> `public/` is copied verbatim by Vite; path is root-absolute and CSP allows `self`. Verify `dist/audio-processor.js` after build.
- [Copy per frame adds allocation] -> Acceptable at 16kHz/128 samples (~8ms); negligible vs. the deprecated path.
- [`addModule` is async and can fail] -> If it throws, the existing outer `try/catch` in `startRecording` sets state to `error`, so the user sees a message instead of a silent hang.

## Migration Plan

Additive: add `public/audio-processor.js`, swap the node creation in `startRecording`, keep all other logic. Rollback is a one-line revert of the node creation block; no data or schema migration.
