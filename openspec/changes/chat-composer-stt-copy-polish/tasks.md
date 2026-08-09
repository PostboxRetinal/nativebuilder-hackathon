## 1. Hoist STT presentation out of composer row

- [x] 1.1 Create `useVoiceComposer` hook (src/hooks/useVoiceComposer.ts) owning Speechmatics state, language, edited text, submit/re-record/reset.
- [x] 1.2 Slim `VoiceInput.tsx` to a presentational mic + language trigger (no editor/preview).
- [x] 1.3 Extract `TranscriptionPreview` and `VoiceTranscriptEditor` into src/components/chat/.
- [x] 1.4 In `ConversationView`, render preview/editor above the composer row inside the footer (`space-y-2`), so the 44px row is never stretched.
- [x] 1.5 Add "done" editor regression test in `ConversationView.test.tsx` (editor + Submit/Re-record present above the footer input).

## 2. STT close affordance

- [x] 2.1 Add a Close (X) button to `VoiceTranscriptEditor` with aria-label "Close transcript".
- [x] 2.2 Wire close to `voice.reset()` in `ConversationView` so it fully dismisses and returns to idle.
- [x] 2.3 Add regression test asserting close calls `reset()`.

## 3. Copy button flush to assistant bubble

- [x] 3.1 Move the copy button into the bubble row (`flex items-end gap-2`), inline at the bubble's bottom-right.
- [x] 3.2 Remove `mr-auto` from the assistant bubble in `ChatBubble.tsx` so the button sits flush against the response.
- [x] 3.3 Confirm `ChatMessage` copy tests (clipboard + execCommand fallback + toast + no button on user) still pass.

## 4. Align user messages right

- [x] 4.1 Use `flex-row-reverse` on the user bubble row and `justify-end` on the user meta ("You · Just now") in `ChatMessage.tsx`.
- [x] 4.2 Confirm assistant stays left with its DevVoice meta; user copy button remains absent.

## 5. Full gate

- [x] 5.1 Run `bun run typecheck` (0 errors), `bun run test -- --coverage` (85/85, above thresholds 25/65/60/25), `bun run lint` (0 errors, 1 legacy warning), `bun run build -- --outDir /tmp/devvoice-dist` (OK).
