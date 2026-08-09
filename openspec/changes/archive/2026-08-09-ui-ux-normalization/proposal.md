## Why

The chat interface is hand-rolled and duplicated across `MessageList.tsx` and `ConversationView.tsx`, so bubble styling, the typing indicator, auto-scroll, and the composer are maintained in two places with no shared contract. This makes UX iteration fragile and prevents reuse. External chatbot frameworks (assistant-ui, NLUX, chatscope) were evaluated and rejected: they pull a large dependency tree and force a runtime/state model that conflicts with the existing Supabase-driven conversations/messages and the custom voice composer.

## What Changes

- Extract the chat UI into reusable internal primitives under `src/components/chat/`: `ChatBubble`, `ChatMessage`, `ChatList`, `ChatComposer`, plus a barrel `index.ts`.
- `ChatBubble` owns the role-aware bubble look (user right/blue, assistant left/grey + markdown) and the markdown anchor override.
- `ChatMessage` composes a `ChatBubble` with the assistant source-citation list.
- `ChatList` owns the scroll container, empty/loading states, and the `Researching…` typing indicator.
- `ChatComposer` owns the controlled text input + Send row with the empty/whitespace guard.
- `MessageList.tsx` becomes a thin pass-through to `ChatList`, preserving its props and `message-user`/`message-assistant` testids.
- `ConversationView.tsx` uses `ChatComposer` next to `VoiceInput`, preserving the current `items-center` alignment.
- No behavior change to data hooks (`useMessages`, `useResearch`, `useConversations`), Supabase schema, the `research` Edge Function, or `VoiceInput` internals. No new dependencies.

## Capabilities

### New Capabilities

None. This is a pure refactor: behavior of the rendered chat is unchanged (bubbles, typing indicator, composer, sources render identically). `skip_specs: true` is set in `.openspec.yaml` per the spec-driven schema.

### Modified Capabilities

None. No spec-level behavior changes.

## Non-Goals

- Not adopting any external chatbot framework.
- Not changing the data layer, persistence, or the `research` Edge Function.
- Not absorbing `VoiceInput` (hold-to-record + language toggle) into the composer.
- Not adding streaming or generative tool call UI.

## Impact

- **Code**: `src/components/chat/` (new), `src/components/MessageList.tsx` (shrinks to wrapper), `src/components/ConversationView.tsx` (uses `ChatComposer`).
- **Tests**: new unit tests per primitive; existing `MessageList.test.tsx` and all current suites stay green.
- **Dependencies**: none added or removed.
- **Systems**: no backend, Supabase, or Edge Function changes.
