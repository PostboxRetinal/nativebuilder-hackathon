# account-management Specification

## Purpose

Provides user-facing account controls for DevVoice: showing who is signed in, ending the current session, and permanently deleting an account together with all of its data.

## Requirements

### Requirement: Signed-in account visible

The application SHALL show the signed-in user's identity in the persistent sidebar so the user always knows which account is active.

#### Scenario: Email shown in sidebar
- **WHEN** a user is authenticated
- **THEN** the sidebar footer displays the user's email and an avatar initial

#### Scenario: Not shown when unauthenticated
- **WHEN** no user is signed in
- **THEN** the account footer does not show an email (the auth screen is shown instead)

### Requirement: Sign out

The application SHALL allow an authenticated user to end their session from the account footer, returning them to the unauthenticated state.

#### Scenario: Sign out returns to auth screen
- **WHEN** an authenticated user clicks Sign out
- **THEN** the session is ended and the application returns to the sign-in screen

#### Scenario: Session not reused after sign out
- **WHEN** the user signs out and later reloads the page
- **THEN** the application does not restore the previous session

### Requirement: Delete account

The application SHALL allow an authenticated user to permanently delete their account together with all of their conversations and messages, after explicit confirmation.

#### Scenario: Deletion requires confirmation
- **WHEN** a user initiates account deletion
- **THEN** the application asks for explicit confirmation before deleting anything

#### Scenario: User data deleted
- **WHEN** a confirmed user account is deleted
- **THEN** all of that user's conversations and messages are removed, and the auth user no longer exists

#### Scenario: Only own account deletable
- **WHEN** a request to delete an account is received
- **THEN** only the authenticated user's own account can be deleted; no other user's data is affected

#### Scenario: Sign out after deletion
- **WHEN** account deletion succeeds
- **THEN** the application signs the user out and shows the auth screen
