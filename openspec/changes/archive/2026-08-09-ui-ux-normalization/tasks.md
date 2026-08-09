## 1. Chat primitives scaffold

- [x] 1.1 Create `src/components/chat/index.ts` barrel re-exporting ChatBubble, ChatMessage, ChatList, ChatComposer.
- [x] 1.2 Add `src/components/chat/__tests__/` dir to hold primitive unit tests.

## 2. ChatBubble

- [x] 2.1 Write failing test `src/components/chat/__tests__/ChatBubble.test.tsx`: assistant content renders as markdown; user content renders plain text; keeps `message-user`/`message-assistant` testids; run it to confirm FAIL.
- [x] 2.2 Implement `src/components/chat/ChatBubble.tsx`: props `{ role, content }`; user → `ml-auto bg-blue-600 text-white rounded-br-sm whitespace-pre-wrap`; assistant → `mr-auto bg-zinc-800 text-zinc-100 rounded-bl-sm assistant-markdown` + `<Markdown>` with `remark-gfm` and the `target="_blank" rel="noopener noreferrer"` anchor override (no `rehype-raw`).
- [x] 2.3 Run `bun run test src/components/chat/__tests__/ChatBubble.test.tsx -v` → PASS.

## 3. ChatMessage

- [x] 3.1 Write failing test `src/components/chat/__tests__/ChatMessage.test.tsx`: assistant with sources renders `SourceCitation` cards; user renders none; run to confirm FAIL.
- [x] 3.2 Implement `src/components/chat/ChatMessage.tsx`: composes `ChatBubble` + optional `SourceCitation` list; move `normalizeSources` here; props `{ role, content, sources? }`.
- [x] 3.3 Run the test → PASS.

## 4. ChatList

- [x] 4.1 Write failing test `src/components/chat/__tests__/ChatList.test.tsx`: renders messages, shows `Researching…` indicator when `researching=true`, renders empty and loading states; run to confirm FAIL.
- [x] 4.2 Implement `src/components/chat/ChatList.tsx`: props `{ messages, researching?, loading }`; scroll container with `scrollRef` + `scrollIntoView` on `[messages, researching]`; maps `messages` to `ChatMessage`; empty/loading blocks; `Researching…` indicator.
- [x] 4.3 Run the test → PASS.

## 5. ChatComposer

- [x] 5.1 Write failing test `src/components/chat/__tests__/ChatComposer.test.tsx`: no submit on empty/whitespace; submit fires with trimmed text; run to confirm FAIL.
- [x] 5.2 Implement `src/components/chat/ChatComposer.tsx`: props `{ value, onChange, onSubmit }`; controlled input + Send row; `trim().length === 0` short-circuit before calling `onSubmit`.
- [x] 5.3 Run the test → PASS.

## 6. Rewire existing components

- [x] 6.1 Shrink `src/components/MessageList.tsx` to a thin pass-through: keep exported `MessageList`, `MessageListProps`, and `data-testid="message-${role}"`, delegate rendering to `ChatList`.
- [x] 6.2 Update `src/components/ConversationView.tsx` to use `ChatComposer` for the text row; keep `VoiceInput` beside it and the `items-center` alignment; keep `key="message-input"`.
- [x] 6.3 Run full suite `bun run test` → all pass (existing `MessageList.test.tsx` 10 tests included); `bun run typecheck` → 0 errors.

## 7. Polish UX

- [x] 7.1 Confirm composer/mic alignment (`items-center`) is stable after rewire in `src/components/ConversationView.tsx`.
- [x] 7.2 Confirm `ChatList` auto-scroll anchors to newest message and stays pinned while `researching`.
- [x] 7.3 Final gate: `bun run typecheck` (0), `bun run test` (all pass), `bun run lint` (no new warnings), coverage at/above threshold.
