## Why

DevVoice needs a formalized Software Design Description that captures the current architecture, capabilities, and specifications. This establishes the source of truth for the system and guides remaining implementation work (tasks 6-7).

## What Changes

This change documents the existing system and specifies the remaining capabilities to build:
- Document completed capabilities: Supabase foundation, auth, voice input, Edge Functions
- Specify pending capabilities: conversation management UI, end-to-end research pipeline
- No code changes - documentation only.

## Capabilities

### New Capabilities
- `supabase-foundation`: Database schema, RLS policies, Supabase client setup, database types
- `authentication`: Email/password auth flow, protected routes, session management
- `voice-input`: Microphone capture, PCM streaming, Speechmatics WebSocket, real-time transcription
- `conversation-management`: Conversation CRUD, message history, sidebar UI, message list
- `research-pipeline`: Edge Function orchestration (Bright Data + AI/ML API), source citations, answer generation

### Modified Capabilities
*(none - no existing specs to modify)*

## Impact

- `openspec/specs/` - new spec files created for each capability
- `openspec/changes/devvoice-system/` - proposal, specs, design, tasks
- No code or config changes

## Non-Goals

- Implementing tasks 6-7 (that is a separate change)
- Changing existing API contracts or database schema
- Modifying Edge Function deployment
