## MODIFIED Requirements

### Requirement: Chat UI via assistant-ui Thread/Message
The system SHALL use assistant-ui's ThreadPrimitive and MessagePrimitive for rendering conversations. The runtime manages message state (streaming, retries, cancellation) via useLocalRuntime.

#### Scenario: New message streams in
- **WHEN** the assistant produces a streaming response
- **THEN** ThreadPrimitive renders MessagePrimitive with streaming status and auto-scrolls

#### Scenario: User edits a message
- **WHEN** the user clicks edit on a sent message
- **THEN** Message enters editing mode and submission regenerates from that point

#### Scenario: User cancels generation
- **WHEN** user clicks stop during assistant response
- **THEN** runtime cancels via abortSignal and preserves partial content

#### Scenario: Error during generation
- **WHEN** research pipeline fails
- **THEN** error message is displayed and user can retry

### Requirement: Composer with dictation support
The system SHALL use assistant-ui's ComposerPrimitive with DictationAdapter for voice input. The composer includes a text input, dictate button, and send button.

#### Scenario: User types a message
- **WHEN** user types in the composer input and presses Enter
- **THEN** message is sent to the research pipeline

#### Scenario: User dictates a message
- **WHEN** user clicks the dictate button and speaks
- **THEN** Speechmatics transcribes speech to text and populates the composer input

#### Scenario: Dictation in progress
- **WHEN** dictation is active
- **THEN** dictate button shows stop state and text input is disabled
