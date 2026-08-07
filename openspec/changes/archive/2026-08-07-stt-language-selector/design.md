## Context

`useSpeechmatics` currently starts the session with a hard-coded `transcription_config.language: "en"` (see `useSpeechmatics.ts:197-200`). `VoiceInput.tsx` renders the recording UI and owns no language state. The speech-to-text pipeline and PCM format stay fixed; only the language model selection changes.

## Goals / Non-Goals

**Goals:**
- Expose a visible English/Spanish toggle in the voice UI.
- Propagate the choice through `useSpeechmatics` into `client.start()`.
- Keep default behavior identical (English) so nothing regresses.

**Non-Goals:**
- No auto-detection, no extra languages, no persistence across sessions.

## Decisions

- **Language as hook input, state owned by `VoiceInput`.** `useSpeechmatics(language: "en" | "es")` takes the language as an argument; the hook uses it in `startRecording`'s `transcription_config`. The `VoiceInput` component holds a `useState` and renders a small toggle.
  - Alternative: lift the selector into `ConversationView` or a global context. Rejected: the language only affects recording, which is local to the voice input; no other component needs it, so local state keeps the change minimal.
- **Hard-coded `"en"` default in the hook signature.** Declaring the hook parameter as `useSpeechmatics(language: SpeechLanguage = "en")` preserves the current behavior for any caller that doesn't pass it, keeping the change non-breaking.
- **Two-option segmented control matching existing styling.** Reuses the Tailwind tokens already used across the UI (`bg-muted`, `border-border`, `text-foreground`), consistent with the dark/AMOLED theme.
- **Selection applies on the next recording start.** The language is read when `startRecording` runs, so a mid-session change takes effect on the following recording. No live-switching of an active session (Speechmatics rejects changing `language` after start; validated in the realtime API reference).

## Risks / Trade-offs

- [Label/design mismatch with dark theme] -> Reuse existing muted/border/foreground tokens; matches RecordButton styling.
- [User changes language mid-recording expecting it to apply live] -> The switch is visible and the effective value is latched at record start; labeled so the toggle sits at record time.
- [Spanish model latency slightly different] -> Negligible; no action needed.

## Migration Plan

Additive UI + hook change; rollback is reverting the hook signature and the toggle. No data or schema migration.
