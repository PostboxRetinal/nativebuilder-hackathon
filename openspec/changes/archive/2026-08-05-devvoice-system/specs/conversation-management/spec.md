## Purpose

Organize research sessions into conversations with persistent message history, sidebar navigation, and source citation display.

## ADDED Requirements

### Requirement: Auto-create conversation on first submission

The system SHALL create a new conversation when the user submits their first voice query.

#### Scenario: First submission creates conversation
- **WHEN** an authenticated user submits a voice query with no active conversation
- **THEN** a new conversation is created and the query becomes its first message

### Requirement: Reuse conversation for follow-ups

The system SHALL append follow-up questions to the current active conversation rather than creating new ones.

#### Scenario: Follow-up adds to existing
- **WHEN** a user submits a second query while a conversation is active
- **THEN** the new message is appended to the existing conversation

### Requirement: Explicit new conversation

The user SHALL be able to create a new conversation explicitly via a dedicated button.

#### Scenario: User starts new conversation
- **WHEN** the user clicks the new conversation button
- **THEN** a fresh conversation is created and becomes active

### Requirement: Messages saved with role and order

Every message SHALL be persisted with role (user or assistant), content, and order_index for sequencing.

#### Scenario: Message persisted correctly
- **WHEN** a message is sent
- **THEN** it is saved to the database with correct role, content, and sequential order_index

### Requirement: Sidebar lists conversations by recency

The sidebar SHALL display all user conversations sorted by updated_at descending.

#### Scenario: Sidebar shows recent first
- **WHEN** the sidebar loads
- **THEN** conversations appear with the most recently updated at the top

### Requirement: Sidebar selection loads history

Clicking a conversation in the sidebar SHALL load its full message history in the main view.

#### Scenario: Conversation loaded from sidebar
- **WHEN** the user clicks a conversation in the sidebar
- **THEN** that conversation's messages display in the main view

### Requirement: Message list with distinct styling

The message list SHALL display user messages right-aligned with a distinct style, and assistant messages left-aligned.

#### Scenario: Messages styled by role
- **WHEN** the message list renders
- **THEN** user and assistant messages are visually distinguishable by alignment and style

### Requirement: Source citations with links

Assistant messages SHALL display source citations with clickable links to original sources.

#### Scenario: Citation link works
- **WHEN** the user clicks a source citation
- **THEN** the original source URL opens in a new tab

### Requirement: Source citation display format

Source citations SHALL show title, favicon, and a content snippet.

#### Scenario: Citation shows full info
- **WHEN** a source citation is rendered
- **THEN** it displays the source title, favicon image, and a text snippet

### Requirement: Auto-title from first message

Conversations SHALL auto-generate a title based on the first user message, with "Untitled" as fallback.

#### Scenario: Title derived from first query
- **WHEN** a conversation is created with a user query
- **THEN** the conversation title is derived from that query text

### Requirement: Empty state with instructions

When no conversation is active, the UI SHALL show a welcome message with instructions on how to start.

#### Scenario: Welcome shown on load
- **WHEN** the user opens the app with no conversations
- **THEN** a welcome message with get-started instructions is displayed

### Requirement: Conversation deletion with confirmation

The system SHALL support deleting conversations after explicit user confirmation.

#### Scenario: User deletes conversation
- **WHEN** the user confirms deletion of a conversation
- **THEN** the conversation and all its data are removed
