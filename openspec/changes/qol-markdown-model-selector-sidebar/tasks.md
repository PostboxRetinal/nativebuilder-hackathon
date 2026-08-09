## 1. Dependencies

- [ ] 1.1 Add `react-markdown` and `remark-gfm` via `bun add react-markdown remark-gfm`

## 2. Markdown rendering

- [ ] 2.1 Modify `src/components/MessageList.tsx` to render assistant content with `<Markdown remarkPlugins={[remarkGfm]}>` and keep user bubbles plain text
- [ ] 2.2 Add a `components` override so assistant markdown links open in a new tab with `rel="noopener noreferrer"`
- [ ] 2.3 Adjust assistant bubble whitespace and add minimal dark-theme markdown styling in `src/index.css`
- [ ] 2.4 Update `src/components/__tests__/MessageList.test.tsx` to assert markdown is interpreted (e.g. `**bold**` renders as `<strong>`) and user content stays plain

## 3. Model selector

- [ ] 3.1 Add optional `model` param to `runResearch` in `src/hooks/useResearch.ts` and append it to the invoke body only when set
- [ ] 3.2 Update `src/hooks/__tests__/useResearch.test.ts` to cover model forwarding and the no-model case
- [ ] 3.3 Create `src/components/ModelSelector.tsx` with a `<select>` of candidate AI/ML models mirroring LanguageToggle
- [ ] 3.4 Add per-session model state to `src/components/ConversationView.tsx`, pass it to `runResearch`, and render `<ModelSelector>`

## 4. Optimistic sidebar

- [ ] 4.1 Modify `createConversation` in `src/hooks/useConversations.ts` to select the inserted row and prepend it to local `conversations` state
- [ ] 4.2 Create `src/hooks/__tests__/useConversations.test.ts` asserting the new item appears immediately after create

## 5. Verification

- [ ] 5.1 Run `bun run typecheck`, `bun run lint`, `bun run test` and confirm all pass
