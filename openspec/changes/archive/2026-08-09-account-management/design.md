## Context

DevVoice authenticates with Supabase (email/password) and the sidebar already gained an account footer with Sign out in a prior change. Account deletion is the remaining capability. Supabase exposes `admin.deleteUser()` only through the service role key, which must never be shipped to the browser (enforced by the supabase-foundation spec). The public schema has a single FK, `messages.conversation_id -> conversations` (CASCADE), and no FK from `conversations.user_id` into `auth.users`, so deleting the auth user does not cascade to the user's data automatically.

## Goals / Non-Goals

**Goals:**
- Expose the signed-in account in the persistent sidebar.
- End the session via a visible Sign out action.
- Let a user permanently delete their own account and all their data, with explicit confirmation.
- Keep secrets server-side: the service role key is used only inside an Edge Function.

**Non-Goals:**
- Password/e-mail change, password reset rework, admin dashboard, data export.

## Decisions

1. **Account footer lives in the sidebar.** It is the persistent chrome visible on every conversation screen, so the identity and Sign out are always reachable. Reuses the existing `useAuth` context (`user`, `signOut`).
2. **Sign out is a client-side `supabase.auth.signOut()`.** Already available in AuthContext; resets `session`/`user` to null so `App` renders `AuthScreen`.
3. **Delete account goes through an Edge Function `delete-account`, not the client SDK.** `admin.deleteUser()` requires the service role, which must not be in browser code. The function authenticates the caller from the request JWT, verifies it is an authenticated user (rejects anon), deletes the user's conversations (cascading to messages), then deletes the auth user, then the client signs itself out.
4. **Data cleanup is explicit, not by cascade from auth.users.** Since `conversations.user_id` has no FK to `auth.users`, deleting the auth user leaves orphaned conversations. The function must delete the user's conversations first.
5. **Deletion is guarded by explicit confirmation.** Destructive and irreversible, so the client prompts before invoking the function.

## Risks / Trade-offs

- **Edge Function not yet deployed.** There is no `supabase/` directory in this repo and no visibility into where the existing `research` function lives (other repo / CLI / dashboard). Implementing the delete call requires that backend home. The spec and design are ready; the function deployment and the client wiring to invoke it are the pending implementation.
- **Service role exposure.** If the function is misconfigured (accessible with anon key), anyone could delete arbitrary users. Mitigation: verify the JWT subject matches the target user and reject requests without a valid authenticated user.
- **Irreversibility.** Deletion is permanent with no recovery path; the explicit confirmation step is the primary guard.
