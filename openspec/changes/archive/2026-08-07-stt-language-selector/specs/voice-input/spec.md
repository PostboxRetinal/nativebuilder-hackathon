## ADDED Requirements

### Requirement: User-selectable transcription language

The system SHALL let the user choose the transcription language before recording, and SHALL apply that choice to the real-time Speechmatics session as its input language. Supported options are English, Spanish, Spanish-English bilingual, Portuguese, French, German, Italian, Japanese, and Mandarin.

#### Scenario: Defaults to English

- **WHEN** the user opens the voice input without changing the language
- **THEN** transcription uses English, matching the previous default behavior

#### Scenario: Spanish selected

- **WHEN** the user selects Spanish and records
- **THEN** the speech is transcribed using the Spanish language model

#### Scenario: Spanish-English bilingual selected

- **WHEN** the user selects Español + English and records speech mixing both languages
- **THEN** the session uses the Spanish-English bilingual pack (language `es` with domain `bilingual-en`)

#### Scenario: Selection persists across recordings

- **WHEN** the user records, re-records, or resets within the session
- **THEN** the selected language remains in effect until changed
