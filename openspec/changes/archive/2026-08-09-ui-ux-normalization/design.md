## Context

The chat UI currently lives ad-hoc: `MessageList.tsx` renders role-aware bubbles, sources, the researching indicator, and auto-scroll, while `ConversationView.tsx` owns the input + Send composer beside `VoiceInput`. Both are bespoke with duplicated styling and no shared contract. The data layer is custom and working: conversations/messages persist in Supabase, `useResearch` calls the `research` Edge Function returning `{answer, sources}`. The app uses React 19, Vite, Tailwind 3, with CSP/SRI enforced, and must stay dependency-light (memory-limited container).

External frameworks (assistant-ui, NLUX, chatscope) were researched and rejected because they force a runtime/thread state model that conflicts with the existing Supabase schema and a standard composer that fights the custom voice input.

## Goals / Non-Goals

**Goals:**
- One source of truth for bubble look, message-with-sources, the chat scroll/typing container, and the text composer.
- Reuse across the app by extracting the chat into `src/components/chat/` primitives.
- Preserve identical rendered behavior, props, and `data-testid`s so existing tests pass unchanged.
- Zero new dependencies.

**Non-Goals:**
- No external chatbot framework.
- No data-layer, persistence, `research` EF, or `VoiceInput` changes.
- No streaming or generative tool-call UI.

## Decisions

1. **Internal component extraction over a framework.** Four small primitives expose the chat contract without a dependency tree or a foreign state model. Each maps to an isolated unit of UI.
2. **Keep the `MessageList` public name.** Existing consumers and `MessageList.test.tsx` reference `MessageList` and the `message-${role}` testids; the component becomes a thin wrapper over `ChatList` so nothing downstream changes.
3. **`ChatBubble` owns markdown + anchor override.** The `target="_blank" rel="noopener noreferrer"` anchor override moves from `MessageList` into `ChatBubble`; markdown uses `react-markdown` + `remark-gfm`, no `rehype-raw` (XSS-safe).
4. **`ChatComposer` owns the empty guard.** The `trim().length === 0` short-circuit moves from `ConversationView` into the composer, so the row is self-contained and testable. `ChatComposer` does NOT absorb `VoiceInput`.
5. **`ChatList` owns scroll + states.** Auto-scroll (`scrollIntoView` on `[messages, researching]`), empty state, loading state, and the `Researching…` indicator all live here.

## Risks / Trade-offs

- **Wrapper indirection**: `MessageList` delegating to `ChatList` adds one layer; kept intentionally thin to avoid breaking existing imports/tests.
- **Refactor risk**: moving styling/state must preserve pixel-identical output. Mitigation: existing `MessageList.test.tsx` (10 tests) acts as a regression guard; run full suite after rewire.
- **Guard ownership**: moving the empty-input guard changes where submit behavior is enforced. New `ChatComposer.test.tsx` covers it; `ConversationView` keeps its own `trim()` check harmlessly.
- **Voice composer gap**: the mic stays bespoke in `VoiceInput`, so the text and voice paths are normalized separately. Accepted trade-off to preserve hold-to-record UX.
