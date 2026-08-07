# research-pipeline Specification

## Purpose
Orchestrate research queries through Bright Data scraping and AI/ML answer generation with source attribution and rate limiting.
## Requirements
### Requirement: Text query returns researched answer with sources

The system SHALL accept a text query and return a researched answer accompanied by source citations.

#### Scenario: Query returns answer
- **WHEN** a user submits a research query
- **THEN** the response includes an answer and a list of source citations

### Requirement: Bright Data scraping for source discovery

The research Edge Function SHALL use the Bright Data scraping API to find and extract content from relevant web sources.

#### Scenario: Sources scraped from web
- **WHEN** the Edge Function processes a query
- **THEN** it calls the Bright Data API to find and scrape relevant pages

### Requirement: AI/ML API for answer generation

The system SHALL pass scraped content and the original query to an AI/ML API to generate a synthesized answer.

#### Scenario: Answer synthesized from sources
- **WHEN** scraped content is available
- **THEN** it is sent to the AI/ML API together with the query to produce an answer

### Requirement: Source citations in answers

Answers SHALL include source citations, each with a title and URL for the referenced source, rendered as clickable cards that open in a new tab. Where a source has no title, the URL host SHALL be shown as a fallback.

#### Scenario: Citation fields present
- **WHEN** an answer is returned with sources
- **THEN** each source has at least title and url fields, and the card shows a favicon derived from the source URL's hostname alongside the title

#### Scenario: Citation opens externally
- **WHEN** the user clicks a source card
- **THEN** the citation opens in a new browser tab with `noopener` and `noreferrer`

### Requirement: Rate limiting per user

The Edge Function SHALL enforce rate limiting of approximately 5 requests per minute per authenticated user.

#### Scenario: Rate limit enforced
- **WHEN** a user exceeds 5 requests in a minute
- **THEN** subsequent requests are rejected with a rate limit error

### Requirement: External API failure handling

The system SHALL handle Bright Data and AI/ML API failures gracefully with a user-visible error message.

#### Scenario: API failure shown to user
- **WHEN** the Bright Data or AI/ML API returns an error
- **THEN** the user sees a clear error message and the query is not lost

### Requirement: Processing state visible

While the research pipeline is running, the UI SHALL display a loading indicator to the user.

#### Scenario: Loading shown during research
- **WHEN** a query is being processed
- **THEN** a spinner or loading indicator is visible in the message list

### Requirement: Server-side rate limit storage

Rate limit counters SHALL be stored server-side (e.g., in Supabase via PostgREST queries or Edge Function state) and SHALL not rely on client-side tracking.

#### Scenario: Rate limit is server-enforced
- **WHEN** a user attempts to bypass rate limits via the client
- **THEN** the server-side counter still enforces the limit

### Requirement: Query traceability

Every research query SHALL be traceable to its originating conversation and message for audit and history purposes.

#### Scenario: Query linked to conversation
- **WHEN** a research query completes
- **THEN** the resulting message and sources are linked to the correct conversation record

