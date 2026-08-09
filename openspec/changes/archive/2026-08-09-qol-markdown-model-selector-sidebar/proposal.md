## Why

Assistant answers arrive as raw AI/ML text containing markdown (`*`, `**`, backticks, headers), which renders as literal characters and is hard to read. Users also cannot choose which AI/ML model answers, and a newly started chat does not appear in the sidebar until a later realtime refetch. These hurt the core pause-free research loop.

## What Changes

- Render assistant answer content as markdown (headers, bold/italic, lists, code blocks, tables, links) instead of raw text. User bubbles stay plain text.
- Add a per-session model selector dropdown so the user can pick which AI/ML model generates the answer; the choice is forwarded to the `research` Edge Function request body.
- Make a new conversation appear in the sidebar immediately on creation (optimistic local state update) instead of waiting for the realtime feed.
- Add/update frontend tests for markdown rendering, model forwarding, and optimistic sidebar creation.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `research-pipeline`: answers are rendered as formatted markdown, and the model used to generate an answer is user-selectable per session and forwarded to the research Edge Function.
- `conversation-management`: a newly created conversation appears in the sidebar immediately upon creation.

## Impact

- `src/components/MessageList.tsx` - render assistant content as markdown.
- `src/hooks/useResearch.ts` - accept and forward an optional `model`.
- `src/components/ModelSelector.tsx` (new) - dropdown UI.
- `src/components/ConversationView.tsx` - hold per-session model state, render selector.
- `src/hooks/useConversations.ts` - optimistic prepend on create.
- Dependency: `react-markdown`, `remark-gfm`.
- New/updated tests in `src/components/__tests__/`, `src/hooks/__tests__/`.
- Note: the `research` Edge Function lives in the Supabase project (not this repo) and must be updated separately to honor the `model` field; frontend forwarding is in scope here, backend EF change is a separate Supabase step.

## Non-goals

- Persisting the selected model to the database (session-scoped only).
- Server-side markdown rendering or sanitization changes beyond react-markdown defaults (no `rehype-raw`).
- Changing the research Edge Function source in this repo (deployed separately in Supabase).
