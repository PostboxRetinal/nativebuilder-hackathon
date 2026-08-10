## 1. Enable Speechmatics end-of-utterance

- [ ] 1.1 Add `conversation_config: { end_of_utterance_silence_trigger: 0.5 }` to `transcription_config` in `src/hooks/useSpeechmatics.ts:228-239`
- [ ] 1.2 Handle `EndOfUtterance` event in the `receiveMessage` listener at `src/hooks/useSpeechmatics.ts:241-261` to transition state to `done`

## 2. Add conversation mode to composer

- [ ] 2.1 Add `conversationMode` state and auto-populate effect in `src/hooks/useVoiceComposer.ts`
- [ ] 2.2 Expose `conversationMode` and `setConversationMode` in the return object

## 3. Create waveform visualizer

- [ ] 3.1 Create `src/components/WaveformVisualizer.tsx` with `AnalyserNode` + Canvas animation
- [ ] 3.2 Create `src/components/WaveformVisualizer.test.tsx` with render tests

## 4. Expose MediaStream from useSpeechmatics

- [ ] 4.1 Add `stream` to `UseSpeechmaticsReturn` interface and component state in `src/hooks/useSpeechmatics.ts`
- [ ] 4.2 Set stream on capture, clear on cleanup, expose in return object

## 5. Wire UI components

- [ ] 5.1 Add conversation mode toggle button to `src/components/VoiceInput.tsx`
- [ ] 5.2 Render `WaveformVisualizer` in `src/components/ConversationView.tsx` when recording
- [ ] 5.3 Pass `conversationMode` and toggle handler from `useVoiceComposer` to `VoiceInput`

## 6. Tests + gate

- [ ] 6.1 Add conversation mode tests to `src/hooks/useVoiceComposer.test.tsx`
- [ ] 6.2 Run full gate: `bun run typecheck && bun run lint && bun run test --coverage && bun run build && ./scripts/verify-build.sh`
