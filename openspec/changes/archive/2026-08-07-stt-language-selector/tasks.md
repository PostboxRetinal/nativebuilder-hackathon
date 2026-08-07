## 1. Hook language support

- [x] 1.1 Add a `SpeechLanguage` type and `language` param (default `"en"`) to `useSpeechmatics`
- [x] 1.2 Use the language in the `transcription_config` passed to `client.start()`

## 2. UI selector

- [x] 2.1 Add an English/Spanish segmented control to `VoiceInput` with `useState`
- [x] 2.2 Wire the selected value into the `useSpeechmatics` call
- [x] 2.3 Style the toggle with existing `bg-muted`/`border-border`/`text-foreground` tokens
- [x] 2.4 Expand `SpeechLanguage` union and `LANGUAGE_CONFIG` map to 9 options incl. the Spanish-English bilingual pack (`es` + domain `bilingual-en`)
- [x] 2.5 Add the 9 language buttons to the `VoiceInput` toggle (English, Español, Español + English, Português, Français, Deutsch, Italiano, 日本語, 普通话)

## 3. Validation

- [x] 3.1 Verify `tsc --noEmit` and ESLint pass
- [x] 3.2 Use Speechmatics `model: "enhanced"` for higher accuracy on single-language audio (validated against official Models doc)
- [x] 3.3 Verify production build
- [x] 3.4 E2E: select Spanish / English / Español + English, record, confirm transcription quality; language selector renders all options
