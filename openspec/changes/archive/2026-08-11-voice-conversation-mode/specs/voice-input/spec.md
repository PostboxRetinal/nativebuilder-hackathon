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

## ADDED Requirements (v0.5.3 — Stability Fixes)

### Requirement: TTS fallback to Web Speech API
When the Fish Audio Edge Function fails (non-2xx response, network error, or empty audio), the FishAudioTTSAdapter SHALL fallback to the browser's Web Speech API (`speechSynthesis`) to ensure the agent's response is still spoken aloud.

#### Scenario: Fish Audio returns 402
- **WHEN** the Edge Function returns a 402 Payment Required response
- **THEN** the adapter catches the error and calls `window.speechSynthesis.speak()` with the same text

#### Scenario: Fish Audio network error
- **WHEN** the Edge Function invocation throws a network error
- **THEN** the adapter catches the error and falls back to Web Speech API

#### Scenario: Empty audio response
- **WHEN** the Edge Function returns success but with empty audio data
- **THEN** the adapter falls back to Web Speech API

### Requirement: TTS speaking lock
The useVoiceAgent hook SHALL prevent concurrent TTS calls by tracking a speaking lock. If a new TTS request arrives while the previous one is still playing, the new request SHALL be dropped.

#### Scenario: Concurrent TTS requests
- **WHEN** the user speaks while the agent is still speaking a previous response
- **THEN** the new TTS request is ignored until the current one completes

### Requirement: Event handler cleanup
The useVoiceAgent hook SHALL register STT and TTS event handlers inside a `useEffect` with a cleanup function that calls `offEvent` to remove handlers on unmount. This prevents duplicate handler registration on re-renders.

#### Scenario: Component re-renders
- **WHEN** the component re-renders due to state changes
- **THEN** event handlers are NOT duplicated (cleanup removes old handlers before re-registering)

#### Scenario: Component unmounts
- **WHEN** the component unmounts
- **THEN** all event handlers are removed via `offEvent`

### Requirement: Transcript length guard
The ConversationView SHALL reject transcripts shorter than 3 characters before calling the research API. This prevents spam from accidental noise or partial words.

#### Scenario: Short transcript rejected
- **WHEN** the Speechmatics final transcript is less than 3 characters
- **THEN** the system returns "I didn't catch that. Could you please repeat?" without calling the research API

### Requirement: Response deduplication
The ConversationModeView SHALL deduplicate consecutive identical responses. If the research pipeline returns the same text twice in a row, the second response SHALL be dropped.

#### Scenario: Duplicate response dropped
- **WHEN** the research API returns the same response as the previous one
- **THEN** the second response is not added to the chat and TTS is not triggered

### Requirement: Fish Audio model header
The fish-tts Edge Function SHALL send the model selection as an HTTP header (`model: s2.1-pro-free`) rather than in the request body. Fish Audio's API ignores the `model` field in the body and defaults to the paid `s2.1-pro` model if the header is absent.

#### Scenario: Free tier model used
- **WHEN** the Edge Function calls `https://api.fish.audio/v1/tts`
- **THEN** the request includes `model: s2.1-pro-free` as an HTTP header

### Requirement: Research retry with backoff
The research Edge Function SHALL implement retry logic with exponential backoff when AI/ML API returns a 429 Too Many Requests response. The retry delays SHALL be 1s, 2s, and 4s (3 attempts total).

#### Scenario: 429 received from AI/ML API
- **WHEN** the AI/ML API returns a 429 response
- **THEN** the Edge Function waits 1s, then 2s, then 4s before retrying (max 3 retries)

#### Scenario: Max retries exceeded
- **WHEN** all 3 retries fail with 429
- **THEN** the Edge Function returns the 429 error to the client

### Requirement: Adapter offEvent contract
The STTAdapter and TTSAdapter interfaces SHALL include an `offEvent` method to remove previously registered handlers. This enables proper cleanup in the useVoiceAgent hook.

#### Scenario: Handler removed
- **WHEN** `offEvent` is called with a type and handler reference
- **THEN** the handler is removed from the internal handler set and will not be called on future events

## ADDED Requirements (v0.5.4 — Orb Interaction Fix)

### Requirement: Orb pointer-events on decorative elements
The ConversationOrb component SHALL apply `pointer-events-none` to all decorative child elements (animated ping spans, blur overlay) so that click events always reach the parent `<button>` element. Decorative elements with `pointer-events: auto` (default) intercept clicks and prevent the button's onClick handler from firing when the click lands on a span that extends outside the button's bounds.

#### Scenario: Click on orb center starts conversation
- **WHEN** the user clicks the center of the orb (where the blur overlay is)
- **THEN** the click passes through to the button and `onClick` fires

#### Scenario: Click on orb edge starts conversation
- **WHEN** the user clicks the edge of the orb (where the animated ping spans extend beyond the button)
- **THEN** the click passes through the span to the button and `onClick` fires

#### Scenario: Orb disabled during processing
- **WHEN** the orb is in `processing` state
- **THEN** the button is disabled and `onClick` does not fire regardless of pointer-events
