## 1. Unified composer bar

- [x] 1.1 Create `src/hooks/useVoiceComposer.ts` owning Speechmatics state, language, edited text, submit/re-record/reset.
- [x] 1.2 Slim `VoiceInput.tsx` to a presentational mic + language trigger (h-11 w-11).
- [x] 1.3 Unify `ChatComposer.tsx` into a single 44px row: ModelSelector + textarea + VoiceInput.
- [x] 1.4 Compact `ModelSelector.tsx` as inline `<select>` h-11 max-w-[9.5rem] with pricing.

## 2. STT blocks above composer

- [x] 2.1 Extract `TranscriptionPreview.tsx` (live preview) rendered above composer in footer.
- [x] 2.2 Extract `VoiceTranscriptEditor.tsx` (edit + Submit / Re-record / Close card).
- [x] 2.3 Render STT blocks above composer row inside footer (`space-y-2`) in `ConversationView.tsx`.
- [x] 2.4 Add Close (X) affordance to `VoiceTranscriptEditor` wired to `voice.reset()`.

## 3. Sidebar collapsible

- [x] 3.1 Create `src/lib/uiPrefs.ts` for sidebar collapse persistence (localStorage + try/catch).
- [x] 3.2 Restructure `ConversationSidebar.tsx` into 3 grouped blocks with border-t dividers.
- [x] 3.3 Add collapsed rail (w-[3.25rem]) with waveform brand, toggle + "+" tiles, initials + tooltips.

## 4. Visual zones + centering

- [x] 4.1 Add `surface: #0B1120` token to tailwind.config.js.
- [x] 4.2 Apply header `bg-surface`, message scroll `bg-background`, footer `bg-surface`.
- [x] 4.3 Center chat window with `mx-auto w-full max-w-3xl` on ConversationView + empty-state.

## 5. Model chip + categories

- [x] 5.1 Add IN/OUT pricing via MCP models_compare to `ModelSelector.tsx`.
- [x] 5.2 Categorize models into Budget / Latest / Reasoning (English labels).

## 6. Copy UX

- [x] 6.1 Move copy button inline beside bubble (bottom-right, `items-end gap-2`) in `ChatMessage.tsx`.
- [x] 6.2 Remove `mr-auto` from assistant bubble in `ChatBubble.tsx` for copy adjacency.
- [x] 6.3 Align user messages right (`flex-row-reverse` + `justify-end` meta).
- [x] 6.4 Add copy toast via sonner with `execCommand` fallback.

## 7. Coverage (Fase 1)

- [x] 7.1 Create `TranscriptionPreview.test.tsx` (5 tests: null, final-only, partial-only, both, listening).
- [x] 7.2 Create `useVoiceComposer.test.tsx` (6 tests: idle/recording/done/reset/submitEdit/reRecord).
- [x] 7.3 Add `VoiceInput.test.tsx` (6 tests: idle/start/stop/processing/error/retry).
- [x] 7.4 Create `AuthContext.test.tsx` (5 tests: initial/signIn-success/signIn-error/signOut/PASSWORD_RECOVERY).
- [x] 7.5 Exclude type-only files from coverage denominator in `vitest.config.ts`.

## 8. Coverage (Fase 2)

- [x] 8.1 Create `ConversationsContext.test.tsx` (4 tests: initial/optimistic-create/delete/updateTitle).
- [x] 8.2 Add useMessages error-branch tests (2 tests: read-fail no-insert, insert-fail no-append).
- [x] 8.3 Add ConversationView recording preview test.

## 9. Flat zones (no borders)

- [x] 9.1 Remove `border-b border-border` from header in `ConversationView.tsx:69`.
- [x] 9.2 Remove `border-t border-border` from footer in `ConversationView.tsx:95`.
- [x] 9.3 Verify ConversationView test passes (no border assertions).

## 9. Gate final

- [x] 9.1 Run `bun run typecheck` (0 errors), `bun run test -- --coverage` (above 25/65/60/25), `bun run lint` (0 errors, 1 legacy warning), `bun run build` (OK).

## 10. Editable conversation title

- [x] 10.1 Add `editingTitle` + `draftTitle` state to `ConversationView.tsx`.
- [x] 10.2 Replace static `<h1>` with click-to-edit input (autoFocus, Enter to save, Escape to cancel, blur to save).
- [x] 10.3 Wire save to `updateTitle(conversationId, trimmedTitle)` from ConversationsContext.
- [x] 10.4 Create `ConversationView.title.test.tsx` with 6 tests: initial h1, click-to-edit, Enter-save, Escape-cancel, blur-save, empty-fallback.

## 11. Pencil icon indicator

- [x] 11.1 Add `PencilIcon` SVG component to `ConversationView.tsx` (14px, inline, `aria-hidden`).
- [x] 11.2 Render icon next to title with `opacity-40 hover:opacity-70` and `shrink-0`.
- [x] 11.3 Use `inline-flex items-center gap-1.5` alignment on title row.

## 12. Copy button flat design

- [x] 12.1 Remove `border border-border` from copy button in `ChatMessage.tsx:109`.
- [x] 12.2 Verify copy functionality still works (visual regression only, no behavioral change).

## 13. Edge Function source in repo

- [x] 13.1 Save `research` Edge Function source to `supabase/functions/research/index.ts` (418 lines).
- [x] 13.2 Document deployment command in README.

## 14. Gate final

- [x] 14.1 Run `bun run typecheck` (0 errors), `bun run test` (122 tests passing), `bun run lint` (0 errors, 1 legacy warning), `bun run build` (OK).
