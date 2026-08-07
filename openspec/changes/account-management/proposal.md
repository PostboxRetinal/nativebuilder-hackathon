## Why

Authenticated users have no way to manage their own account from the UI: there is no persistent indication of who is signed in and no logout action, and no path at all to delete an account and its data. GDPR-style user-requested deletion and a clear way to end a session are basic account controls a production app should expose.

## What Changes

- Add an account footer to the sidebar showing the signed-in user's email, an avatar initial, and a Sign out button.
- Add a Sign out action that ends the Supabase session and returns the user to the auth screen.
- Add a Delete account action that, on explicit confirmation, deletes the user's conversations (and their messages via the existing CASCADE), then deletes the auth user, then signs out.
- Document that account deletion requires a Supabase Edge Function using the service role key (never in browser code), enforcing that only the authenticated user can delete their own account.

## Capabilities

### New Capabilities
- `account-management`: User-facing account controls — display of the signed-in account, session logout, and permanent account deletion with its data.

### Modified Capabilities
- (none)

## Impact

- Code: `src/components/ConversationSidebar.tsx` (account footer + Sign out, already added); pending a `delete-account` Edge Function and the UI to invoke it with confirmation.
- Backend: new Supabase Edge Function `delete-account` (service role; deletes the caller's conversations first — the only FK is `messages.conversation_id -> conversations` CASCADE, and there is NO FK from `conversations.user_id -> auth.users`, so deleting the auth user does not cascade to their data — then `supabase.auth.admin.deleteUser()`).
- Systems: Supabase Auth + Postgres. No schema change required beyond the existing tables.
- Risk note: the service role key SHALL NOT appear in browser-accessible code (enforced by the existing supabase-foundation spec).

## Non-goals

- No password change or email change flow.
- No "forgot password" rework (already covered elsewhere).
- No admin/user-management dashboard.
- No data export.
