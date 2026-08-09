## Why

The transcription language selector in `VoiceInput.tsx` is a segmented control with nine buttons. With nine options it overflows its container and reads as cluttered. The set of languages is expected to stay at nine, which pushes the segmented pattern past its comfortable limit (roughly 4-5 options). It also wastes horizontal space beside the record button.

## What Changes

Replace the `LanguageToggle` segmented button group with a native styled `<select>` element. The option set, the `SpeechLanguage` values, and the `LANGUAGE_CONFIG` mapping in `useSpeechmatics.ts` stay exactly the same; only the presentation control changes. The default remains English.

## Capabilities

- voice-input: unchanged. The "User-selectable transcription language" requirement and its four scenarios already exist in the main spec and remain satisfied. This is a pure UI mechanism change, so the spec is skipped.

## Impact

No dependency is added: the project currently has no dropdown component (no headlessui, no radix), and a native `<select>` needs none. A native select is keyboard- and screen-reader-accessible by default, works on mobile, and requires no click-outside or focus management. It is the robust, minimal option for this stack, consistent with the project's zero-external-UI philosophy.

## Non-goals

- No TTS/voice selection. DevVoice is STT-only; there are no voices to choose.
- No change to the language list or the `SpeechLanguage`/`LANGUAGE_CONFIG` types.
- No custom dropdown component (button + list layer), which would add focus/outside-click/keyboard handling the native element already provides.
- No persistence of the selected language across sessions.
