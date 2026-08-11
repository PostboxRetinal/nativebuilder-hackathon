## ADDED Requirements

### Requirement: Conversation mode message persistence

When the user is in conversation mode, every user message and assistant response SHALL be persisted to the database via `useMessages().addMessage()` before and after the research call, respectively.

#### Scenario: User message persisted
- **WHEN** the user speaks a query in conversation mode and the transcript finalizes
- **THEN** the user message is persisted to the database before the research call executes

#### Scenario: Assistant response persisted
- **WHEN** the research call returns a response in conversation mode
- **THEN** the assistant message is persisted to the database before TTS playback begins

### Requirement: Conversation mode history seeding

When entering conversation mode, the system SHALL seed the local message state with existing messages from the database so the user sees the full conversation history.

#### Scenario: Existing messages loaded
- **WHEN** the user enters conversation mode for a conversation that already has messages
- **THEN** the message list displays all previously persisted messages
