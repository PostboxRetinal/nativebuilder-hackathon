## Context

`VoiceInput.tsx` renders `LanguageToggle` as a segmented button group for the nine `SpeechLanguage` options. With nine items the group overflows beside the record button and reads as cluttered. The project has no dropdown dependency (verified in `package.json`), and the codebase prefers zero external UI libraries. The user chose a native `<select>` over a custom dropdown.

## Decisions

**Use a native `<select>` styled with Tailwind.**

- A native select ships keyboard navigation, screen-reader labels, and mobile support at zero dependency cost.
- It needs no click-outside handler, focus trap, or ARIA wiring that a custom button-plus-list dropdown would require.
- The tradeoff is limited control over the opened list styling (the closed control can be styled fully; the popup is browser-rendered). For a nine-item language list this is acceptable and the closed state is the dominant visible surface.

**Keep `SpeechLanguage` and `LANGUAGE_CONFIG` untouched.**

- They live in `useSpeechmatics.ts` and are consumed by both the toggle and the transcription session. The dropdown only swaps how a value is chosen, not the values or their mapping.

**Wiring.**

- `LanguageToggle` keeps its props (`language`, `onChange`) so the call site in `VoiceInput` is unchanged.
- The `<select>` maps the same `options` array; `onChange` parses `e.target.value` back to `SpeechLanguage` and calls `onChange`.
- Default value `"en"` matches the existing initial state, preserving behavior.

## Risks and Trade-offs

- Native select appearance varies slightly per browser/OS, but Tailwind styling on the element itself normalizes the closed state.
- The `role="group"`/`aria-pressed` semantics of the current buttons are replaced by the select's own native semantics (`aria-label` kept).
