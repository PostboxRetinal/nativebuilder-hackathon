## Context

The app now uses a unified green-accent design system: `accent` #22C55E as the sole identity color, `accent-muted`, `on-accent` (near-black #02140B), `background`, `foreground`, `muted`, `border`, `destructive`. The animated `.waveform`/`.waveform-bar` classes in `src/index.css` are the signature for waiting/idle states. `AuthScreen.tsx` (three modes: signin/signup/forgot) and the `SetNewPassword` component are the only screens still on the legacy slate palette (`bg-dotgrid-glow`, `primary`, `on-primary`, `ring`). See proposal.md - Why.

## Goals / Non-Goals

**Goals:**
- Bring auth screens onto the green-accent token set so they read as part of the same product.
- Give auth a distinct, memorable brand moment (the waveform) without hurting form usability.
- Keep the change TDD-gated with class-level assertions.

**Non-Goals:**
- No change to auth flow, password policy, rate limiting, or validation logic (behavior covered by the `authentication` spec, unchanged).
- No new dependencies, no icon library, no OAuth.
- No redesign of the DevVoice wordmark itself.

## Decisions

- **Retheme rather than rebuild the card.** The existing card layout (tabs, fields, footer links) already works; we swap token classes only. Lower risk than restructuring. Alternative (full redesign) rejected for scope.
- **`bg-dotgrid-glow` -> `bg-background`.** For consistency with the rest of the app (user-selected "consistencia"). The dot-grid texture is removed; a `bg-background` wrapper matches the app shell. Alternative (keep texture) rejected for consistency.
- **Submit button `bg-primary text-on-primary` -> `bg-accent text-on-accent`.** Matches the composer/footer CTA. Keep `hover:opacity-90 active:scale-[0.97]` affordances.
- **Active tab `border-primary` -> `border-accent`** so the selected tab uses the identity color.
- **Waveform as brand moment.** Reuse `.waveform`/`.waveform-bar` above the wordmark. Respect reduced motion: add a `motion-reduce:hidden` guard (or a `prefers-reduced-motion` media query toggle in index.css) so the animation doesn't play for users who disable motion.
- **Contrast risk on `on-accent`.** `on-accent` is near-black; on green it may read as lower contrast than white-on-slate. Default decision: keep `on-accent`. Verify visually; if contrast is poor, flip submit text to `text-background` (near-black, already on the palette) rather than introducing a new color.
- **Consistent control height.** Fields to `h-11` to match the footer composer bar; keep label spacing.

## Risks / Trade-offs

- [Reduced contrast on green button] -> Verify in the browser; fall back to `text-background` if `on-accent` reads too dark on `accent`.
- [Removing dot-grid may flatten the auth screen] -> Acceptable; consistency wins and the waveform restores visual interest.
- [Waveform animation on auth] -> Gate behind `motion-reduce:hidden` to respect reduced-motion preferences.
- [Test assertions on class strings are brittle] -> Scope assertions to the presence of the token substring (`bg-accent`, not the full class list) and disambiguate the "Sign In" tab from the submit button by `querySelector('button[type="submit"]')`.
