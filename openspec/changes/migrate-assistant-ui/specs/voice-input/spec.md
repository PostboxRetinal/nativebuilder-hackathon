## MODIFIED Requirements

### Requirement: Voice input via assistant-ui DictationAdapter
The system SHALL use assistant-ui's DictationAdapter interface for speech-to-text. SpeechmaticsDictationAdapter wraps the Speechmatics WebSocket connection and emits partial/final transcripts via the onSpeech/onSpeechEnd callbacks. `disableInputDuringDictation` is set to `true` to prevent keyboard/dictation conflicts.

#### Scenario: Speechmatics emits partial transcript
- **WHEN** Speechmatics sends AddTranscript event with partial text
- **THEN** SpeechmaticsDictationAdapter emits onSpeech with isFinal: false

#### Scenario: Speechmatics emits final transcript
- **WHEN** Speechmatics sends AddTranscript event with final text
- **THEN** SpeechmaticsDictationAdapter emits onSpeechEnd with the full text

#### Scenario: Input disabled during dictation
- **WHEN** user starts voice dictation
- **THEN** text input is disabled to prevent conflicts

### Requirement: TTS via assistant-ui SpeechSynthesisAdapter
The system SHALL use assistant-ui's SpeechSynthesisAdapter for text-to-speech. FishAudioSpeechAdapter calls the fish-tts Edge Function and plays the returned audio via HTMLAudioElement with reactive status updates.

#### Scenario: Assistant message is spoken
- **WHEN** a new assistant message arrives and speech adapter is configured
- **THEN** FishAudioSpeechAdapter.speak() is called and audio plays

#### Scenario: Speech is cancelled
- **WHEN** user interrupts TTS playback
- **THEN** FishAudioSpeechAdapter utterance.cancel() stops audio and sets ended status

#### Scenario: TTS error handling
- **WHEN** fish-tts EF returns an error
- **THEN** utterance status is set to { type: "ended", reason: "error" }

### Requirement: Streaming responses via async generator
The system SHALL use `async * generator` in ChatModelAdapter.run to support streaming responses. The generator yields cumulative content on each iteration. `abortSignal` is passed to fetch/SDK calls for cancellation support.

#### Scenario: Research pipeline streams response
- **WHEN** user sends a message
- **THEN** runtime yields response content via generator

#### Scenario: User cancels mid-stream
- **WHEN** user clicks stop during generation
- **THEN** abortSignal is triggered and generator exits cleanly

#### Scenario: Research pipeline error
- **WHEN** research pipeline throws an error
- **THEN** runtime yields error message "Sorry, I encountered an error. Please try again."

### Requirement: Error boundary for graceful error handling
The system SHALL wrap assistant-ui components in a React ErrorBoundary that catches rendering errors and displays a fallback UI with a "Try again" button.

#### Scenario: Component throws during render
- **WHEN** assistant-ui component throws (e.g., ResizeObserver missing)
- **THEN** ErrorBoundary catches error and shows fallback with retry button

#### Scenario: User retries after error
- **WHEN** user clicks "Try again" in error fallback
- **THEN** ErrorBoundary resets and re-renders children

### Requirement: Accessibility compliance (WCAG 2.1 AA)
The system SHALL implement accessibility best practices: aria-live regions for streaming content, visible focus indicators, keyboard navigation, and semantic roles.

#### Scenario: Screen reader announces new messages
- **WHEN** new assistant message streams in
- **THEN** aria-live="polite" region announces content to screen readers

#### Scenario: Keyboard user navigates chat
- **WHEN** user tabs through interactive elements
- **THEN** focus-visible:ring-2 indicator is visible on all elements (WCAG 2.4.7)

#### Scenario: Voice dictation labeled for screen readers
- **WHEN** user focuses the dictate button
- **THEN** aria-label="Start voice dictation" is announced
