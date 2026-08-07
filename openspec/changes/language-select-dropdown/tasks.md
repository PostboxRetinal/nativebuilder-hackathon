## 1. Replace the segmented control with a native select

- [x] 1.1 Rewrite `LanguageToggle` in `VoiceInput.tsx` as a styled native `<select>` keeping the same `options`, `language`, and `onChange` props
- [x] 1.2 Keep the existing `options` array and `SpeechLanguage` types unchanged
- [x] 1.3 Preserve `"en"` as the default selected value

## 2. Validation

- [x] 2.1 Verify `tsc --noEmit` and ESLint pass
- [ ] 2.2 Verify production build
- [ ] 2.3 E2E: open the dropdown, select each language, confirm the value applies to the Speechmatics session (at minimum English, Español, Español + English)
