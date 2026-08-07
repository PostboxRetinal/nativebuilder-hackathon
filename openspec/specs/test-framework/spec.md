# test-framework Specification

## Purpose
Provides automated quality assurance for DevVoice through a unit test suite run in CI and an on-demand end-to-end test of the core research loop, backed by stable DOM hooks for assertions.
## Requirements
### Requirement: Unit test runner available
The project SHALL provide a unit test runner (Vitest with a jsdom environment) configured independently from the production build so that build-time plugins and memory-constrained build settings do not affect test execution.

#### Scenario: Unit tests run offline
- **WHEN** the developer runs the `test` script
- **THEN** all unit tests execute in a jsdom environment and external services are mocked, so the suite completes without network access

#### Scenario: Failure exits non-zero
- **WHEN** one or more unit tests fail
- **THEN** the test runner exits with a non-zero code so CI can detect the failure

### Requirement: Unit tests cover the research pipeline
The project SHALL maintain unit tests that exercise the research hook and its downstream UI (source citations and message list) with mocked Supabase calls.

#### Scenario: Research success propagates
- **WHEN** the research edge function resolves successfully
- **THEN** the hook returns the answer and sources and clears the researching state

#### Scenario: Research error surfaces
- **WHEN** the research edge function returns an error or throws
- **THEN** the hook returns no result, sets an error message, and clears the researching state

#### Scenario: Source citation renders
- **WHEN** an assistant message contains a source with a title and URL
- **THEN** the citation renders the title, the hostname, and a link that opens in a new tab with noopener

#### Scenario: Malformed source ignored
- **WHEN** a message carries a source without a URL
- **THEN** the source is not rendered as a citation

### Requirement: Stable DOM hooks for E2E
The project SHALL expose stable `data-testid` attributes on message bubbles and source citations so end-to-end assertions do not depend on presentational text or class names.

#### Scenario: Assistant bubble identifiable
- **WHEN** an assistant message is rendered
- **THEN** its bubble carries a `data-testid` identifying it as an assistant message

#### Scenario: Source citation identifiable
- **WHEN** a source citation is rendered
- **THEN** it carries a `data-testid` marking it as a source citation

### Requirement: End-to-end test of the research loop
The project SHALL provide an end-to-end test that drives the research loop in a real browser against the live environment, skipping cleanly when test credentials are absent.

#### Scenario: Full loop produces one answer
- **WHEN** test credentials are available and the app is running
- **THEN** the test signs in, creates a conversation, submits a query, waits for the researching indicator, and asserts exactly one assistant answer bubble with at least one source citation

#### Scenario: Skips without credentials
- **WHEN** end-to-end test credentials are not configured
- **THEN** the E2E suite skips rather than failing, so CI can pass without a live backend

### Requirement: Continuous integration runs unit tests
The project SHALL run lint and the unit test suite on every push and pull request to main so regressions surface before merge.

#### Scenario: CI fails on failed tests
- **WHEN** a change breaks a unit test or fails lint
- **THEN** the CI job fails and blocks the merge

