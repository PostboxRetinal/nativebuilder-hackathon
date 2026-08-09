## 1. Account footer

- [x] 1.1 Show signed-in user's email and avatar initial in the sidebar footer
- [x] 1.2 Add Sign out button in the account footer calling `signOut()` from useAuth
- [x] 1.3 Verify sign out returns the user to the auth screen (typecheck, lint, tests, build green)

## 2. Delete account backend

- [x] 2.1 Locate where the `research` Edge Function and Supabase functions live (repo / CLI / dashboard): not tracked in this repo (supabase/ kept empty by design); functions are deployed natively. `supabase/functions/delete-account/index.ts` added here for versioning/deploy.
- [x] 2.2 Implement `delete-account` Edge Function: authenticate caller from JWT, reject anon, delete the user's conversations (cascades to messages), then `supabase.auth.admin.deleteUser()`. Source at `supabase/functions/delete-account/index.ts`.
- [x] 2.3 Deploy the function to the project Supabase and verify it rejects anon-key callers. Deployed via Supabase MCP (slug `delete-account`, version 1, ACTIVE, verify_jwt=true). Verified live 2026-08-08: no auth -> HTTP 401 `UNAUTHORIZED_NO_AUTH_HEADER`; anon key -> HTTP 401 `{"error":"Unauthorized"}`.

## 3. Delete account UI

- [x] 3.1 Add a Delete account action to the account footer with explicit confirmation dialog
- [x] 3.2 Wire the action to invoke the `delete-account` Edge Function, then `signOut()`
- [x] 3.3 Verify a test user can delete their own account and is returned to the auth screen (blocked on 2.3 being deployed). Confirmed 2026-08-09 by Sebas in the browser: account + conversations deleted, sign-out back to auth screen, success toast shown. Also deployed v2 with explicit CORS preflight (OPTIONS 204) which fixed a browser "Failed to send a request" CORS error blocking the invoke.
