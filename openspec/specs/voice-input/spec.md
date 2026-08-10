# voice-input Specification

## Purpose
Voice recording with real-time Speechmatics transcription via WebSocket, allowing users to capture, review, edit, and submit spoken queries.

## Requirements

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

### Requirement: PCM streaming to Speechmatics

The system SHALL capture microphone audio and stream it as PCM (16kHz, mono, 16-bit little-endian) to the Speechmatics WebSocket API.

#### Scenario: Audio streamed correctly
- **WHEN** recording is active
- **THEN** PCM audio frames are sent continuously to the Speechmatics WebSocket

### Requirement: Token obtained via Edge Function

The Speechmatics session token SHALL be obtained from a Supabase Edge Function before connecting and passed directly to the official Speechmatics real-time SDK (`client.start(jwt, config)`). The Speechmatics API key SHALL never be exposed to the browser, and the JWT SHALL never be embedded in a WebSocket URL or query string.

#### Scenario: Token fetched server-side
- **WHEN** the user initiates recording
- **THEN** the client calls the speechmatics-token Edge Function to get a session token

#### Scenario: JWT not present in WebSocket URL
- **WHEN** the client connects to Speechmatics
- **THEN** the connection is opened via the SDK with the token passed to `client.start()`, never in the WebSocket URL

### Requirement: Partial transcripts displayed in real-time

Partial transcript results from Speechmatics SHALL display in real-time while recording is active, styled as italic and grey to indicate they are provisional.

#### Scenario: Partial transcript visible
- **WHEN** Speechmatics sends a partial transcript event
- **THEN** the text is displayed in italic/grey above the recording button

### Requirement: Final transcript replaces partials

When recording stops and Speechmatics sends a final transcript, it SHALL replace all partial text with the definitive version.

#### Scenario: Final replaces partial
- **WHEN** recording stops and the final transcript arrives
- **THEN** partial text is replaced by the final transcript in normal style

### Requirement: Editable transcript before submit

After recording stops, the final transcript SHALL appear in an editable textarea so the user can correct errors before submitting.

#### Scenario: User edits transcript
- **WHEN** the user modifies text in the edit area
- **THEN** the edited text is preserved for submission

### Requirement: Re-record option

The user SHALL be able to discard the current transcript and start a new recording from the edit view.

#### Scenario: User re-records
- **WHEN** the user clicks re-record
- **THEN** the current transcript is cleared and recording starts fresh

### Requirement: Recording state feedback

The UI SHALL show distinct visual states: idle (tap to record), recording (red pulse, listening), processing (spinner), and done (editable text).

#### Scenario: State transitions visible
- **WHEN** the recording lifecycle progresses from idle to recording to processing to done
- **THEN** each state has a distinct visual representation with appropriate text and controls

### Requirement: WebSocket error fallback

WebSocket connection errors SHALL result in a graceful fallback with a user-visible error message rather than a silent failure.

#### Scenario: WebSocket fails
- **WHEN** the Speechmatics WebSocket connection fails
- **THEN** an error message is shown to the user and recording state resets to idle

### Requirement: Microphone permission handling

The system SHALL handle both granted and denied microphone permissions with appropriate user feedback.

#### Scenario: Permission denied
- **WHEN** the browser denies microphone access
- **THEN** a clear error message instructs the user to allow microphone permissions

### Requirement: User-selectable transcription language

The system SHALL let the user choose the transcription language before recording, and SHALL apply that choice to the real-time Speechmatics session as its input language. Supported options are English, Spanish, Spanish-English bilingual, Portuguese, French, German, Italian, Japanese, and Mandarin.

#### Scenario: Defaults to English
- **WHEN** the user opens the voice input without changing the language
- **THEN** transcription uses English, matching the previous default behavior

#### Scenario: Spanish selected
- **WHEN** the user selects Spanish and records
- **THEN** the speech is transcribed using the Spanish language model

#### Scenario: Spanish-English bilingual selected
- **WHEN** the user selects Español + English and records speech mixing both languages
- **THEN** the session uses the Spanish-English bilingual pack (language `es` with domain `bilingual-en`)

#### Scenario: Selection persists across recordings
- **WHEN** the user records, re-records, or resets within the session
- **THEN** the selected language remains in effect until changed

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
- **WHEN** the user starts recording and a `MediaStream` is available
- **THEN** the canvas renders an animated waveform (not a flat line)

### Requirement: TTS via Supabase Edge Function proxy

The FishAudioTTSAdapter SHALL invoke the `fish-tts` Supabase Edge Function via `supabase.functions.invoke()`. The Edge Function proxies to Fish Audio REST API (`POST https://api.fish.audio/v1/tts`) using the `FISH_AUDIO_API_KEY` secret stored in Supabase. The API key SHALL NEVER be exposed to the client.

- Request body: `{ text, reference_id?, model? }`
- Response: `{ audio: base64 }` (mp3)
- Auth: Supabase anon key (client) + function secret (server)
- Optional voice cloning via `reference_id`

### Requirement: TTS audio playback

The FishAudioTTSAdapter SHALL decode the base64 audio response using `AudioContext.decodeAudioData()` and play it via a `bufferSource` node.

- Stop playback if `isStopped` flag is set before decode
- Emit error event on decode failure

### Requirement: TTS error handling

The FishAudioTTSAdapter SHALL emit error events when the Edge Function returns an error or empty audio.

- Emit `{ message: "Fish Audio: <detail>", code: "TTS_ERROR" }`

### Requirement: Agent TTS playback via Supabase proxy

The ConversationModeView SHALL play agent responses aloud via the `fish-tts` Edge Function proxy. The API key lives exclusively in Supabase secrets.

- Model: `s2.1-pro-free` (free tier)
- Voice cloning via `reference_id` (optional env var)

#### Scenario: Agent speaks response
- **WHEN** the research pipeline returns a response
- **THEN** the text is sent to the fish-tts Edge Function and audio plays via Web Audio API

#### Scenario: TTS error handling
- **WHEN** the Edge Function returns an error or empty response
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
