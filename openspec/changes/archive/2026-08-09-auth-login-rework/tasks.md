## 1. Auth retheme to green accent

- [x] 1.1 Add class-level test asserting the auth submit button uses `bg-accent` (disambiguate from the "Sign In" tab via `querySelector('button[type="submit"]')`); confirm it fails on the current `bg-primary`.
- [x] 1.2 Retheme `AuthScreen.tsx` submit button `bg-primary text-on-primary` -> `bg-accent text-on-accent` (keep hover/active/disabled affordances); active tab `border-primary` -> `border-accent`; wrapper `bg-dotgrid-glow` -> `bg-background`.
- [x] 1.3 Retheme the `SetNewPassword` component the same way (submit button and wrapper) in `AuthScreen.tsx`.
- [x] 1.4 Run `bun run test AuthScreen`, `bun run typecheck`, `bun run lint`; confirm green.

## 2. Waveform brand moment

- [x] 2.1 Add the animated `.waveform`/`.waveform-bar` element above the DevVoice wordmark in both `AuthScreen` and `SetNewPassword` branding blocks, gated with `motion-reduce:hidden`.
- [x] 2.2 Verify reduced-motion guard (add a `prefers-reduced-motion` toggle in `src/index.css` if `motion-reduce` alone is not enough). Tailwind's `motion-reduce:hidden` maps to a `@media (prefers-reduced-motion: reduce)` rule natively - no extra CSS needed.
- [x] 2.3 Run `bun run test AuthScreen`, `bun run typecheck`, `bun run build -- --outDir /tmp/devvoice-dist`; confirm green.

## 3. Form polish and gate

- [x] 3.1 Normalize auth field inputs to consistent `h-11` height to match the composer bar; keep label spacing.
- [x] 3.2 Run the full gate: `bun run typecheck`, `bun run test -- --coverage` (above thresholds 25/65/60/25), `bun run lint`, `bun run build -- --outDir /tmp/devvoice-dist`.
- [x] 3.3 Residue scan: confirm no `bg-primary`/`border-primary`/`on-primary`/`bg-dotgrid-glow` remain in `src/components/AuthScreen.tsx`.
