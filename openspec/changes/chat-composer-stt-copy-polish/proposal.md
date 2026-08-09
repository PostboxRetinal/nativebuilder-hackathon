## Why

The voice-to-text flow and the chat read layout had structural UI/UX defects that broke the composed display and fought the brand design. Using STT stretched the bottom bar out of shape because the live preview and the post-finalize editor were rendered inside the 44px composer row; the copy button sat far below the assistant response; user bubbles and their meta were not visually separated from the assistant side; and the finished transcript window could not be dismissed except by re-toggling the mic, which just reopened it.

## What Changes

- Hoist STT presentation out of the composer row: `VoiceInput` becomes a compact mic + language trigger; the live `TranscriptionPreview` and the post-finalize `VoiceTranscriptEditor` render above the composer bar inside the footer, so they can never stretch the bottom bar.
- Add a close (X) affordance to the transcript editor that fully dismisses it and returns voice to idle.
- Move the assistant copy button inline next to the bubble (aligned to the bubble's right edge at the bottom), instead of a full-width trailing row.
- Align user messages (bubble and "You · Just now" meta) to the right, mirroring the assistant on the left.
- Introduce `useVoiceComposer` hook to own shared STT + edit state across the new split components.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- None (visual layout and component structure only; no behavioral requirement of the `chat`, `auth`, or `research` specs changes, so this change declares `skip_specs: true`).

## Impact

- `src/hooks/useVoiceComposer.ts` (new) - owns STT state, language, edited text, submit/re-record/close.
- `src/components/VoiceInput.tsx` - slimmed to the inline mic + language selector trigger.
- `src/components/chat/TranscriptionPreview.tsx` (new) - live preview, rendered above the composer row.
- `src/components/chat/VoiceTranscriptEditor.tsx` (new) - edit + Submit / Re-record / Close card, rendered above the composer row.
- `src/components/ConversationView.tsx` - orchestrate the STT blocks above the composer bar; wire close to reset.
- `src/components/chat/ChatMessage.tsx` - copy button inline beside bubble (bottom-right); user meta + bubble aligned right.
- `src/components/chat/ChatBubble.tsx` - drop `mr-auto` on assistant bubble so copy sits flush against it.
- Tests: `ConversationView.test.tsx` (done editor + close button), `ChatMessage.test.tsx` (copy behavior unchanged).
- No dependency or backend changes. UI copy stays English.

## Non-Goals

- No change to Speechmatics audio logic or `useSpeechmatics`.
- No streaming token-by-token rendering.
- No auth flow or research backend changes.
