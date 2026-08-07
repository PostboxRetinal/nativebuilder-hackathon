## 1. Account footer

- [x] 1.1 Show signed-in user's email and avatar initial in the sidebar footer
- [x] 1.2 Add Sign out button in the account footer calling `signOut()` from useAuth
- [x] 1.3 Verify sign out returns the user to the auth screen (typecheck, lint, tests, build green)

## 2. Delete account backend

- [ ] 2.1 Locate where the `research` Edge Function and Supabase functions live (repo / CLI / dashboard)
- [ ] 2.2 Implement `delete-account` Edge Function: authenticate caller from JWT, reject anon, delete the user's conversations (cascades to messages), then `supabase.auth.admin.deleteUser()`
- [ ] 2.3 Deploy the function to the project Supabase and verify it rejects anon-key callers

## 3. Delete account UI

- [ ] 3.1 Add a Delete account action to the account footer with explicit confirmation dialog
- [ ] 3.2 Wire the action to invoke the `delete-account` Edge Function, then `signOut()`
- [ ] 3.3 Verify a test user can delete their own account and is returned to the auth screen
