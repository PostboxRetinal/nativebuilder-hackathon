## Context

See proposal.md - Why.

The current custom components (ChatList, ChatMessage, ConversationModeView, useVoiceAgent) work but lack production features (streaming, retries, branching, accessibility, error handling). assistant-ui provides these as composable primitives with TypeScript end-to-end, WCAG 2.1 AA compliant, and with built-in streaming and adapter support.

## Goals / Non-Goals

**Goals:**
- Replace custom chat components with assistant-ui ThreadPrimitive/ComposerPrimitive
- Create FishAudioSpeechAdapter (TTS) implementing SpeechSynthesisAdapter
- Create SpeechmaticsDictationAdapter (STT) implementing DictationAdapter
- Use useLocalRuntime with async generator for streaming responses
- Add ErrorBoundary for graceful error handling
- Add accessibility: aria-live, focus-visible, keyboard navigation
- Maintain Speechmatics + Fish Audio as voice providers

**Non-Goals:**
- Migrating sidebar (keeps custom design)
- Changing Supabase backend
- Replacing research pipeline

## Decisions

**1. useLocalRuntime over useChatRuntime**

`useLocalRuntime` is correct because DevVoice doesn't use Vercel AI SDK. We implement a single `ChatModelAdapter.run` as async generator that calls the research pipeline and yields cumulative content.

**2. SpeechmaticsDictationAdapter wraps SpeechmaticsAdapter**

The existing SpeechmaticsAdapter handles WebSocket connection, audio capture, and PCM streaming. SpeechmaticsDictationAdapter wraps it and translates events to assistant-ui's DictationAdapter interface (onSpeech, onSpeechEnd). `disableInputDuringDictation: true` prevents keyboard/dictation conflicts.

**3. FishAudioSpeechAdapter uses HTMLAudioElement**

The adapter calls the fish-tts EF, receives a blob, creates an object URL, and plays via Audio. Status getter enables reactive re-renders. Follows assistant-ui's documented pattern.

**4. ThreadPrimitive components**

assistant-ui exports `ThreadPrimitive.Root`, `ThreadPrimitive.Viewport`, `ThreadPrimitive.Messages`, `ThreadPrimitive.ScrollToBottom` as composable, unstyled primitives. We style them with Tailwind via `className` prop. `MessagePrimitive.Parts` renders message content.

**5. ErrorBoundary for graceful errors**

React error boundary catches rendering errors from assistant-ui components (e.g., ResizeObserver missing in jsdom) and shows a "Try again" fallback. Preserves partial UI state.

**6. Accessibility-first**

- `aria-live="polite"` on viewport for screen reader announcements
- `role="log"` on viewport for semantic meaning
- `focus-visible:ring-2` on all interactive elements (WCAG 2.4.7)
- Keyboard navigation via assistant-ui's built-in Radix primitives
- `aria-label` on Dictate/Send buttons

**7. Test mocks for jsdom gaps**

- ResizeObserver mock (assistant-ui Radix-based viewport uses it)
- HTMLAudioElement mock (FishAudioSpeechAdapter uses Audio)
- URL.createObjectURL mock (blob audio playback)

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| assistant-ui API changes | Pin version in package.json |
| Speechmatics WebSocket reconnection | Handled by existing SpeechmaticsAdapter |
| Fish Audio EF response format | EF already returns audio blob |
| Bundle size | assistant-ui is tree-shakeable |
| jsdom test environment gaps | Mocks in vitest.setup.ts |
| ErrorBoundary catches too aggressively | Only catches render errors, preserves state |

## Migration Plan

1. Install assistant-ui
2. Create adapters (FishAudioSpeechAdapter, SpeechmaticsDictationAdapter)
3. Create runtime with streaming (useLocalRuntime + async generator)
4. Create AssistantThread + ErrorBoundary components
5. Update ConversationView to use AssistantThread
6. Update VoiceConversation with accessibility
7. Update tests + vitest.setup.ts mocks
8. Validate SDD + coverage
9. Remove old components (ChatList, ChatMessage, ChatComposer, etc.)

**Rollback:** Revert to previous commit. All old components remain in git history.

## Open Questions

None.
