## MODIFIED Requirements

### Requirement: Token obtained via Edge Function

The Speechmatics session token SHALL be obtained from a Supabase Edge Function before connecting and passed directly to the official Speechmatics real-time SDK (`client.start(jwt, config)`). The Speechmatics API key SHALL never be exposed to the browser, and the JWT SHALL never be embedded in a WebSocket URL or query string.

#### Scenario: Token fetched server-side
- **WHEN** the user initiates recording
- **THEN** the client calls the speechmatics-token Edge Function to get a session token

#### Scenario: JWT not present in WebSocket URL
- **WHEN** the client connects to Speechmatics
- **THEN** the connection is opened via the SDK with the token passed to `client.start()`, never in the WebSocket URL
