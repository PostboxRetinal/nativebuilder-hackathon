## ADDED Requirements

### Requirement: Conversation mode toggle

The voice input SHALL provide a toggle that switches between manual recording mode (tap to start, tap to stop) and conversation mode (continuous listening with automatic turn detection).

#### Scenario: Toggle conversation mode on
- **WHEN** the user clicks the conversation mode toggle
- **THEN** the toggle shows an active state and the system enters conversation mode

#### Scenario: Toggle conversation mode off
- **WHEN** the user clicks the toggle while conversation mode is active
- **THEN** the toggle shows an inactive state and the system returns to manual mode

### Requirement: End-of-utterance detection in conversation mode

When conversation mode is active, the system SHALL configure the Speechmatics session with `end_of_utterance_silence_trigger` (default 0.5 seconds) so the server detects when the user pauses.

#### Scenario: Speechmatics session configured for conversation
- **WHEN** the user starts recording in conversation mode
- **THEN** the Speechmatics `transcription_config` includes `conversation_config: { end_of_utterance_silence_trigger: 0.5 }`

#### Scenario: Auto-finalize on utterance end
- **WHEN** the Speechmatics server sends an `EndOfUtterance` event
- **THEN** the recording state transitions to `done` and the final transcript is populated

### Requirement: Live waveform visualization

While recording is active, the system SHALL render a live waveform visualization of the microphone input using the Web Audio API.

#### Scenario: Waveform visible during recording
- **WHEN** recording is active and a `MediaStream` is available
- **THEN** a canvas renders an animated waveform driven by `AnalyserNode` time-domain data

#### Scenario: Waveform hidden when idle
- **WHEN** recording is not active
- **THEN** the waveform canvas is not rendered

### Requirement: Continuous listening without manual stop

In conversation mode, the system SHALL NOT require the user to press a stop button. The transcript finalizes automatically when end-of-utterance is detected.

#### Scenario: User speaks and pauses
- **WHEN** the user speaks and then pauses for 0.5 seconds in conversation mode
- **THEN** the transcript finalizes automatically and becomes available for editing

## MODIFIED Requirements

### Requirement: Single-tap recording control

The user SHALL be able to start and stop microphone recording with a single tap or click on a prominent button. In manual mode, the user must tap to stop. In conversation mode, tapping stop is optional since end-of-utterance detection handles finalization.

#### Scenario: Start recording
- **WHEN** the user taps the microphone button while idle
- **THEN** recording starts and the UI shows a recording indicator with a stop option

#### Scenario: Stop recording
- **WHEN** the user taps the stop control while recording
- **THEN** recording stops, audio is processed, and the transcript becomes available

#### Scenario: Auto-stop on end-of-utterance (conversation mode)
- **WHEN** end-of-utterance is detected while recording in conversation mode
- **THEN** recording stops automatically and the transcript becomes available without user interaction

## ADDED Requirements (v0.5.1 — Conversation Mode Polish)

### Requirement: Conversation Orb CTA
The voice input SHALL provide a visually distinct pulsing orb (speech bubble icon, NOT a mic) as the entry point to conversation mode. The orb SHALL have animated cyan→violet gradient glow.

#### Scenario: Orb visible in composer row
- **WHEN** the composer row is visible
- **THEN** a pulsing orb with speech bubble icon is rendered next to the mic button

#### Scenario: Tap orb enters conversation mode
- **WHEN** the user taps the orb
- **THEN** the app navigates to full-screen ConversationModeView

### Requirement: Model Selector in Conversation Mode
The ConversationModeView SHALL include a model selector that lets the user pick which AI model generates responses.

#### Scenario: Model selector visible
- **WHEN** ConversationModeView is active
- **THEN** a model selector dropdown is visible in the header

#### Scenario: Selected model used for research
- **WHEN** the user selects a model and speaks
- **THEN** the research pipeline receives the selected model ID

### Requirement: Waveform AudioContext resume
The WaveformVisualizer SHALL call `audioContext.resume()` after creating the AudioContext to ensure the waveform animates immediately after mic opens.

#### Scenario: Waveform animates after mic opens
- **WHEN** the user starts recording and a MediaStream is available
- **THEN** the canvas renders an animated waveform (not a flat line)

## ADDED Requirements (v0.5.2 — Voice Agent TTS + UI)

### Requirement: Agent TTS playback via Fish Audio
The ConversationModeView SHALL play agent responses aloud using Fish Audio S2.1 Pro TTS via HTTP streaming and Web Audio API playback.
- Model: `s2.1-pro-free` (free tier)
- Auth: `Authorization: Bearer VITE_FISH_AUDIO_API_KEY`
- Optional voice cloning via `reference_id`

#### Scenario: Agent speaks response
- **WHEN** the research pipeline returns a response
- **THEN** the text is sent to Fish Audio TTS and audio plays via Web Audio API

#### Scenario: TTS error handling
- **WHEN** Fish Audio API returns an error
- **THEN** the error is displayed in the conversation UI and the agent continues in text-only mode

### Requirement: RTVI-style event architecture
The voice agent SHALL use a modular event system with the following contracts:
- STT adapter emits `user-transcript-partial` and `user-transcript-final`
- TTS adapter emits `bot-tts-text` before synthesis
- Orchestrator emits `agent-state` on every state change
- Each utterance creates a new ChatMessage (no concatenation)

#### Scenario: Modular STT swap
- **WHEN** the STT provider needs to change
- **THEN** only the STTAdapter implementation changes; UI and orchestrator remain unchanged

#### Scenario: Independent messages
- **WHEN** the user speaks multiple utterances
- **THEN** each utterance creates a separate ChatMessage with unique ID

### Requirement: Chat bubble UI
The ConversationModeView SHALL display messages as independent chat bubbles:
- User bubbles: right-aligned, cyan background
- Agent bubbles: left-aligned, dark slate background with Markdown rendering
- Streaming bubbles: pulse animation while transcription is incomplete
- Each message is a separate entity (no concatenation)

#### Scenario: User message appears on right
- **WHEN** the user speaks and transcription finalizes
- **THEN** a cyan bubble appears on the right side with the transcribed text

#### Scenario: Agent message appears on left with Markdown
- **WHEN** the research response contains Markdown formatting
- **THEN** a slate bubble appears on the left with rendered Markdown (bold, code, lists)

#### Scenario: Streaming indicator
- **WHEN** transcription is in progress (partial results)
- **THEN** the user bubble shows a pulse animation

### Requirement: AudioWorklet for PCM capture
The SpeechmaticsAdapter SHALL use `AudioWorkletNode` instead of the deprecated `ScriptProcessorNode` for audio capture and PCM16 conversion.
- Worklet file: `public/pcm-capture-worklet.js`
- Processor name: `pcm-capture-processor`
- Worklet receives Float32 audio frames, converts to PCM16 (Int16Array), posts to main thread

#### Scenario: No deprecation warning
- **WHEN** the user starts recording in conversation mode
- **THEN** the console shows no ScriptProcessorNode deprecation warning

### Requirement: Speechmatics WebSocket authentication
The SpeechmaticsAdapter SHALL authenticate using a temporary JWT passed as a query parameter in the WebSocket URL.
- Endpoint: `wss://eu.rt.speechmatics.com/v2/{language}?jwt={token}`
- Token obtained from Supabase edge function `speechmatics-token`
- JWT is NOT sent in the StartRecognition message body

#### Scenario: Connection authorized
- **WHEN** the adapter connects to Speechmatics with a valid JWT in the URL
- **THEN** the WebSocket connects successfully (no "Not Authorized" error)

### Requirement: Microphone toggle
The user SHALL stop the recording stream by pressing the mic button again:
- First press: starts recording (state → listening)
- Second press while recording: stops (state → idle)
- Visual indicator: mic icon ↔ stop icon toggle

#### Scenario: Toggle mic off
- **WHEN** the user presses the mic button while recording
- **THEN** recording stops and the button shows the mic icon again

#### Scenario: Visual state change
- **WHEN** recording is active
- **THEN** the button shows a stop icon and destructive color; otherwise shows mic icon and cyan color
