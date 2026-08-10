## Why

The chat UI had structural defects: the composer bar mixed ModelSelector + textarea + voice without a unified row; the sidebar lacked collapsibility and grouped navigation; header/scroll/footer zones were indistinguishable; the model selector had no pricing or categories; and coverage was below 60% in key files.

## What Changes

- Unify the composer bar into a single 44px row: ModelSelector (with prices) + ChatComposer (textarea) + VoiceInput (mic + language).
- Add collapsible sidebar with localStorage persistence, grouped blocks (Logo / Collapse+New / Conversations), and hover tooltips.
- Differentiate zones: header `bg-surface`, message scroll `bg-background`, footer `bg-surface`.
- Center the chat window at `max-w-3xl`.
- Add model chip with IN/OUT pricing and categories (Budget / Latest / Reasoning).
- Add copy toast via sonner.
- Raise coverage from ~58% to ~60%+ with 30+ new tests across TranscriptionPreview, useVoiceComposer, VoiceInput, AuthContext, ConversationsContext, useMessages, ConversationView.
- Exclude type-only files from coverage denominator.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- None (visual layout, component structure, and test coverage only; no behavioral requirement of the `chat`, `auth`, or `research` specs changes, so this change declares `skip_specs: true`).

## Impact

- `src/components/chat/ChatComposer.tsx` — unified composer bar row.
- `src/components/ModelSelector.tsx` — compact inline select with pricing + categories.
- `src/components/VoiceInput.tsx` — slim presentational mic + language trigger.
- `src/components/ConversationView.tsx` — orchestrates STT blocks above composer; centered max-w-3xl.
- `src/components/ConversationSidebar.tsx` — collapsible rail with grouped blocks + tooltips.
- `src/components/chat/ChatMessage.tsx` — copy button inline beside bubble; user messages right-aligned.
- `src/components/chat/ChatBubble.tsx` — assistant bubble no `mr-auto` for copy adjacency.
- `src/hooks/useVoiceComposer.ts` (new) — owns STT + edit state.
- `src/components/chat/TranscriptionPreview.tsx` (new) — live preview above composer.
- `src/components/chat/VoiceTranscriptEditor.tsx` (new) — edit + Submit / Re-record / Close card.
- `src/lib/uiPrefs.ts` (new) — sidebar collapse persistence.
- `src/contexts/ConversationsContext.tsx` — tested.
- `src/hooks/useMessages.ts` — error branches tested.
- Tests: 30+ new tests across 8 files.
- `vitest.config.ts` — type-only files excluded from coverage denominator.
- No dependency or backend changes. UI copy stays English.

## Non-Goals

- No change to Speechmatics audio logic or `useSpeechmatics`.
- No streaming token-by-token rendering.
- No auth flow or research backend changes.
- `useSpeechmatics` and `AuthScreen` coverage deferred to post-hackathon.
