## 1. AudioWorklet capture

- [x] 1.1 Create the standalone processor at `public/audio-processor.js` (registers `pcm-capture-processor`, posts `Float32Array` frames to the main thread)
- [x] 1.2 Swap `ScriptProcessorNode` for `AudioWorkletNode` in `src/hooks/useSpeechmatics.ts` (`addModule` + `AudioWorkletNode` with 1 input / 0 outputs, `port.onmessage` converts to PCM16)
- [x] 1.3 Keep cleanup and stop semantics: disconnect worklet node, handle `addModule` failure via the existing `error` state

## 2. Validation

- [x] 2.1 Verify `tsc --noEmit` passes
- [x] 2.2 Verify ESLint passes (worklet globals declared so `no-undef` stays strict)
- [x] 2.3 Verify production build and that `dist/audio-processor.js` is emitted
- [x] 2.4 E2E: record audio in the browser, confirm transcription works and no `ScriptProcessorNode` deprecation warning appears
