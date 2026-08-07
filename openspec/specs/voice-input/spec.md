# voice-input Specification

## Purpose
Voice recording with real-time Speechmatics transcription via WebSocket, allowing users to capture, review, edit, and submit spoken queries.
## Requirements
### Requirement: Single-tap recording control

The user SHALL be able to start and stop microphone recording with a single tap or click on a prominent button.

#### Scenario: Start recording
- **WHEN** the user taps the microphone button while idle
- **THEN** recording starts and the UI shows a recording indicator with a stop option

#### Scenario: Stop recording
- **WHEN** the user taps the stop control while recording
- **THEN** recording stops, audio is processed, and the transcript becomes available

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

