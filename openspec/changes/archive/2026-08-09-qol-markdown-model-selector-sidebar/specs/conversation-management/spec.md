## MODIFIED Requirements

### Requirement: Explicit new conversation

The user SHALL be able to create a new conversation explicitly via a dedicated button, and the new conversation SHALL appear in the sidebar immediately upon creation.

#### Scenario: User starts new conversation
- **WHEN** the user clicks the new conversation button
- **THEN** a fresh conversation is created, becomes active, and appears at the top of the sidebar immediately

#### Scenario: New conversation reflected before polling
- **WHEN** a new conversation is created
- **THEN** its sidebar entry is added without waiting for the realtime feed
