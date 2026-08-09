## Context

DevVoice renders assistant answers as raw text in MessageList.tsx (whitespace-pre-wrap), so AI/ML markdown leaks as literal characters. Research is invoked from useResearch.ts with body `{ query, context }` with no model choice. New conversations are created in useConversations.ts but the local `conversations` array is only updated by the realtime feed, causing a sidebar latency window. The `research` Edge Function is deployed in Supabase, not versioned in this repo.

## Goals / Non-Goals

**Goals:**
- Render assistant answer content as markdown client-side without weakening the CSP or XSS posture.
- Let the user choose the AI/ML model per session and forward it to the research Edge Function.
- Show a newly created conversation in the sidebar immediately.

**Non-Goals:**
- Persisting model choice to the database (session-scoped only).
- Modifying the `research` Edge Function source in this repo (deployed separately in Supabase; must be updated there to honor `model`).
- Adding server-side markdown rendering or sanitization beyond react-markdown defaults.

## Decisions

1. **react-markdown + remark-gfm for markdown.** react-markdown renders markdown to React elements (not HTML), so no CSP SRI hashing or `unsafe-inline` issues, and its default behavior escapes raw HTML - XSS-safe without `rehype-raw`. remark-gfm adds tables, strikethrough, and task lists. Applied only to assistant bubbles in MessageList.tsx; user bubbles stay plain text. Links rendered with `target="_blank" rel="noopener noreferrer"` via a components override to match SourceCitation.

2. **Session-scoped model state in ConversationView.** A `useState<string | null>` holds the selected model. useResearch gains an optional `model` param that is appended to the invoke body only when set, keeping the no-model case wire-compatible with the current EF. A ModelSelector component mirrors the existing LanguageToggle `<select>` pattern in VoiceInput.tsx. No schema change.

3. **Optimistic prepend in createConversation.** change `.select("id")` to select the inserted row and prepend it to local `conversations` state on success. The realtime subscriber later refetches and reconciles, so ordering stays correct without UI jank. This is the minimal fix for the latency window.

## Risks / Trade-offs

- **Model selector is cosmetic until the EF is updated.** The frontend forwards `model`, but the deployed `research` Edge Function must accept it to take effect. Flagged as separate Supabase work; the frontend remains backward compatible (omits `model` when unset). Candidate model IDs (gpt-5, deepseek-r1, gemini-2.5-flash, gpt-4o-mini) must be validated against what the EF/AI/ML API support.
- **Bundle size.** react-markdown + remark-gfm add a few hundred KB (dev). Acceptable; AGENTS.md OOM notes concern the build sandbox, not runtime bundle.
- **Whitespace behavior.** Switching assistant bubbles from whitespace-pre-wrap to markdown rendering changes multi-line formatting; verified via tests and visual check.
- **Sidebar ordering jitter.** Realtime refetch may momentarily reorder the optimistic entry; acceptable. Dedupe by id before prepend if jitter becomes visible.
