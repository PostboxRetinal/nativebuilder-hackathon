## Why

The login and signup screens are the first thing a user sees, but they use a leftover slate/"primary" palette (`bg-dotgrid-glow`, `bg-primary`, `border-primary`) that is inconsistent with the green-accent design system now used across the whole app. The auth screens look like they belong to a different product and undercut the cohesive brand moment.

## What Changes

- Retheme `AuthScreen.tsx` and the `SetNewPassword` component off the slate `primary` palette onto the green-accent token set (`accent`, `on-accent`, `border-accent`, `bg-background`).
- Add the animated voice waveform (the app's signature for waiting states) as a brand moment above the DevVoice wordmark on both auth screens.
- Tighten form controls to consistent 44px heights matching the composer bar, and normalize focus affordances to the accent ring.
- No auth flow, validation, or rate-limit behavior changes.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- None (visual presentation only; the `authentication` spec's behavioral requirements are unchanged, so this change declares `skip_specs: true`).

## Impact

- `src/components/AuthScreen.tsx` - retheme submit button, active tabs, wrapper background; add waveform brand element to the branding block (both `AuthScreen` and `SetNewPassword`).
- `src/components/__tests__/AuthScreen.test.tsx` - add class-level assertions so the retheme is TDD-gated.
- Possibly `src/index.css` (reuse existing `.waveform`/`.waveform-bar`. If carried over the auth card, ensure reduced-motion respect).
- No dependency or backend changes. UI copy stays English.
