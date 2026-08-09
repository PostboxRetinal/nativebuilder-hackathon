## MODIFIED Requirements

### Requirement: AI/ML API for answer generation

The system SHALL pass scraped content and the original query to an AI/ML API to generate a synthesized answer. The system SHALL use a user-selected model when one is provided, and SHALL render the returned answer as formatted markdown.

#### Scenario: Answer synthesized from sources
- **WHEN** scraped content is available
- **THEN** it is sent to the AI/ML API together with the query to produce an answer

#### Scenario: User-selected model forwarded
- **WHEN** the user selects a model from the research model selector
- **THEN** the selected model identifier is forwarded to the research Edge Function and used to generate the answer

#### Scenario: Default model when none selected
- **WHEN** the user has not selected a model
- **THEN** the request is made without a model override and the server default model is used

### Requirement: Answer rendered as markdown

Assistant answer content SHALL be rendered as formatted markdown (headers, bold/italic, lists, code blocks, tables, and links) rather than raw text.

#### Scenario: Markdown formatted in assistant bubble
- **WHEN** an assistant answer containing markdown is displayed
- **THEN** the answer renders as formatted markdown with the appropriate typographic elements

#### Scenario: User message stays plain text
- **WHEN** a user message is displayed
- **THEN** it renders as plain text without markdown interpretation
