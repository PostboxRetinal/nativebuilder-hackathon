## ADDED Requirements

### Requirement: TTS voice consistency via server-side reference_id

The Fish Audio TTS SHALL use a consistent voice across all responses. The voice `reference_id` SHALL be configured as a Supabase Edge Function secret (`FISH_AUDIO_REFERENCE_ID`) and read server-side via `Deno.env.get()`, never from client-side environment variables.

#### Scenario: Voice consistent across responses
- **WHEN** the user receives multiple TTS responses in a session
- **THEN** all responses use the same voice defined by the server-side `FISH_AUDIO_REFERENCE_ID`

#### Scenario: reference_id not exposed to browser
- **WHEN** the client invokes the fish-tts Edge Function
- **THEN** the request body contains only `text` (no `reference_id`), and the Edge Function reads `FISH_AUDIO_REFERENCE_ID` from `Deno.env.get()`

### Requirement: TTS error propagation without fallback

The FishAudioTTSAdapter SHALL NOT fall back to Web Speech API (`speechSynthesis`) when the Edge Function fails. Errors SHALL be thrown and propagated to the UI for display.

#### Scenario: Edge Function fails
- **WHEN** the fish-tts Edge Function returns an error
- **THEN** the adapter throws an error with the message `Fish Audio: <error.message>` and no fallback TTS plays

#### Scenario: Empty audio response
- **WHEN** the Edge Function returns a response without audio data
- **THEN** the adapter throws an error with the message `Fish Audio: Empty response from server`

#### Scenario: TTS timeout
- **WHEN** TTS playback takes longer than 30 seconds
- **THEN** the adapter throws an error with the message `TTS timeout after 30s`
