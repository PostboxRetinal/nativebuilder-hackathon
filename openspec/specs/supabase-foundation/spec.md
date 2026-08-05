# supabase-foundation Specification

## Purpose
Persistent storage and row-level security for user conversations, messages, and sources, ensuring data isolation between users.
## Requirements
### Requirement: Conversations table exists

The database SHALL have a conversations table with columns: id (UUID, primary key), user_id (UUID, references auth.users), title (text), created_at (timestamp), updated_at (timestamp).

#### Scenario: Conversation row created
- **WHEN** a new conversation is inserted
- **THEN** the row has a generated UUID, the authenticated user's ID, and server-generated timestamps

### Requirement: Messages table exists

The database SHALL have a messages table with columns: id (UUID, primary key), conversation_id (UUID, FK to conversations), role (text: 'user' or 'assistant'), content (text), created_at (timestamp), order_index (integer).

#### Scenario: Message saved with ordering
- **WHEN** a message is inserted into a conversation
- **THEN** it has an order_index that preserves the sequence of messages within that conversation

### Requirement: Sources table exists

The database SHALL have a sources table with columns: id (UUID, primary key), message_id (UUID, FK to messages), url (text), title (text), content (text), favicon_url (text), created_at (timestamp).

#### Scenario: Source linked to message
- **WHEN** a source is inserted with a message_id
- **THEN** it is queryable as a citation for that specific message

### Requirement: Row-level security enabled on all tables

All tables SHALL have RLS enabled. Policies SHALL restrict access so users can only SELECT, INSERT, UPDATE, and DELETE rows where user_id matches auth.uid().

#### Scenario: User cannot access another user's data
- **WHEN** user A queries conversations owned by user B
- **THEN** the query returns zero rows

### Requirement: Supabase client uses anon key

The browser-side Supabase client SHALL be initialized with the anon/public key only. The service role key SHALL never be present in browser-accessible code.

#### Scenario: Client initialized safely
- **WHEN** the application loads
- **THEN** the Supabase client uses the anon key for all browser-side operations

### Requirement: Database types generated and type-safe

Database types SHALL be generated from the Supabase schema and used throughout the codebase for type safety on queries and inserts.

#### Scenario: Type error caught at compile time
- **WHEN** code references a non-existent column on a typed table
- **THEN** TypeScript raises a compile-time error

### Requirement: Foreign key constraints enforced

The messages table SHALL have a foreign key from conversation_id to conversations.id. The sources table SHALL have a foreign key from message_id to messages.id.

#### Scenario: Orphan message rejected
- **WHEN** a message is inserted with a non-existent conversation_id
- **THEN** the database rejects the insert with a foreign key violation

### Requirement: Cascade deletes on conversation removal

Deleting a conversation SHALL cascade to delete all its messages. Deleting a message SHALL cascade to delete all its sources.

#### Scenario: Conversation delete cascades
- **WHEN** a conversation is deleted
- **THEN** all associated messages and their sources are also deleted

