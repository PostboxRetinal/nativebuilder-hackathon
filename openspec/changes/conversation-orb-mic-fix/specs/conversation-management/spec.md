## ADDED Requirements

### Requirement: Conversation mode transcript accumulation

The conversation mode SHALL accumulate partial transcript segments into a single user message. Speechmatics emits `AddTranscript` per utterance segment; the system SHALL buffer these into one message and only send to the AI pipeline on final transcript.

#### Scenario: Single sentence split into segments
- **WHEN** the user speaks "Hey, how are you doing today?" and Speechmatics emits AddTranscript 4 times ("Hey", "how are you", "doing", "today?")
- **THEN** the system accumulates into a single user message "Hey how are you doing today?" and sends once to the AI

#### Scenario: Partial transcripts update UI in real-time
- **WHEN** Speechmatics emits `AddPartialTranscript` with partial text
- **THEN** the user message bubble shows the partial text with streaming status and updates in place

### Requirement: Conversation mode maintains listening state across speak cycles

After TTS playback completes, the conversation mode SHALL return to "listening" state (not "idle") so the orb continues showing mic activity and the user can continue speaking or tap to stop.

#### Scenario: User speaks, AI responds, user speaks again
- **WHEN** the user speaks a query, AI responds via TTS, and the user speaks again without tapping the orb
- **THEN** the orb shows listening animation during the entire cycle and the second utterance is captured

#### Scenario: Tap orb after AI response stops the mic
- **WHEN** the AI finishes responding and the user taps the orb
- **THEN** the mic stream closes and state goes to "idle"
