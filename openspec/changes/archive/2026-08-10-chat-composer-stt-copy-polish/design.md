## Context

See proposal.md - Why. The composer bar previously mixed ModelSelector + textarea + voice without a unified row; the sidebar lacked collapsibility; header/scroll/footer zones were indistinguishable; the model selector had no pricing or categories; and coverage was below 60%.

## Goals / Non-Goals

**Goals:**
- Single 44px composer bar row with ModelSelector + ChatComposer + VoiceInput.
- Collapsible sidebar with localStorage persistence and grouped navigation blocks.
- Distinct visual zones (header/footer `bg-surface`, scroll `bg-background`).
- Centered chat window at `max-w-3xl`.
- Model chip with IN/OUT pricing and Budget/Latest/Reasoning categories.
- Copy toast via sonner.
- 60%+ coverage with real tests (no threshold lowering, no c8 ignore).
- Flat UI without borders between zones — background differentiation only.

**Non-Goals:**
- Changing Speechmatics/`useSpeechmatics` audio behavior.
- Streaming token-by-token rendering.
- Backend or auth changes.
- `useSpeechmatics` and `AuthScreen` coverage (deferred to post-hackathon).

## Decisions

- **Unified composer bar (44px row):** ModelSelector (max-w-[9.5rem]) + ChatComposer (min-w-0 flex-1) + VoiceInput (h-11 w-11) in a single `flex items-center gap-2` row. Keeps the input zone compact and prevents layout shifts from STT blocks.
- **Collapsible sidebar with localStorage:** `src/lib/uiPrefs.ts` owns `getSidebarCollapsed`/`setSidebarCollapsed` with try/catch. Collapsed rail shows waveform brand, toggle + "+" tiles, conversation initials with native `title` tooltips.
- **Zones via surface token:** `surface: #0B1120` (one step lighter than `background: #020617`) applied to header, footer, cards, menus. Dark-UI elevation = lighter surfaces, not shadows (validated with Hoverify/daisyUI).
- **Centered chat window:** `mx-auto w-full max-w-3xl` on ConversationView root + empty-state in App.tsx. 768px max width.
- **Model chip with pricing:** Compact inline `<select>` h-11 with IN/OUT prices validated via MCP models_compare. Categories: Budget / Latest / Reasoning (English).
- **Copy toast:** `toast.success("Copied to clipboard")` on success via sonner. Fallback `execCommand` for non-secure contexts.
- **Coverage strategy:** `vi.hoisted` for supabase mocks, `mockResolvedValue` for async calls, TestConsumer wrapped in Provider for context tests. Type-only files excluded from denominator via `coverage.exclude` in vitest.config.ts.
- **No borders between zones:** Header and footer have NO `border-b`/`border-t`. Zones are differentiated solely by `bg-surface` vs `bg-background`. Validated: major dark-theme AI chat UIs (ChatGPT, Claude, Cursor) use flat messages with subtle background differentiation and `dark:border-transparent` — borders create visual noise when surface tokens already separate zones. Follows Tailwind docs pattern (`dark:border-white/10` only when explicit separator is needed; otherwise omit).
- **Editable title via inline input (chosen over rename modal/prompt).** Pattern matches ChatGPT/Claude inline rename (click-to-edit). Avoids modal/dialog DOM complexity. Local state in ConversationView, persistence via existing `updateTitle` from ConversationsContext. Confirms on Enter/blur, cancels on Escape.

- **Pencil icon indicator:** Inline SVG (14px) rendered next to title. `opacity-40` default, `hover:opacity-70` on hover. Uses `inline-flex items-center gap-1.5` for alignment. `aria-hidden` for accessibility (title text is self-describing).

- **Copy button flat design:** Removed `border border-border` from copy button. Relies on `bg-muted` for visual separation from bubble. Matches the flat, borderless aesthetic applied to header/footer zones.

- **Edge Function source in repo:** `supabase/functions/research/index.ts` (418 lines) versioned alongside the frontend. Deployed via `supabase functions deploy research`. Enables code review, local development, and reproducible deploys.

## Risks / Trade-offs

- **Composer bar density** → ModelSelector capped at max-w-[9.5rem] to prevent overflow on narrow screens.
- **Sidebar collapse discovery** → native `title` tooltips require hover; acceptable for desktop-first UX.
- **Coverage denominator reduction** → excluding type-only files is honest (no executable code) but must be audited if logic is later added to those files.
- **Zone separation without borders** → relies entirely on `bg-surface` vs `background` contrast. If the surface token is too similar to background in future theme changes, zones may blend. Mitigation: surface is ~20% lighter than background (measurable difference).
