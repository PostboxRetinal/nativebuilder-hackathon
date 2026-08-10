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
