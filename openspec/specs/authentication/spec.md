# authentication Specification

## Purpose
User identity management with email and password authentication via Supabase Auth, driving protected access to all application features.
## Requirements
### Requirement: Sign up with email and password

The system SHALL allow unauthenticated users to create an account with email and password.

#### Scenario: Successful sign up
- **WHEN** a user submits valid email and password
- **THEN** a new account is created and the user is authenticated

### Requirement: Sign in with email and password

The system SHALL allow existing users to authenticate with their email and password.

#### Scenario: Successful sign in
- **WHEN** a user submits correct credentials
- **THEN** the user is authenticated and redirected to the application

### Requirement: Sign out

The system SHALL allow authenticated users to end their session.

#### Scenario: User signs out
- **WHEN** an authenticated user clicks sign out
- **THEN** the session is cleared and the user is redirected to the login screen

### Requirement: Password reset via email

The system SHALL allow users to request a password reset link sent to their email.

#### Scenario: Password reset requested
- **WHEN** a user enters their email on the forgot password screen
- **THEN** a reset link is sent to that email address

### Requirement: Auth state persistence

Authenticated sessions SHALL persist across page reloads via Supabase session storage.

#### Scenario: Reload preserves auth
- **WHEN** an authenticated user reloads the page
- **THEN** the user remains authenticated without re-entering credentials

### Requirement: Protected routes redirect unauthenticated users

Accessing any authenticated route while unauthenticated SHALL redirect to the login page.

#### Scenario: Unauthenticated access blocked
- **WHEN** an unauthenticated user navigates to a protected route
- **THEN** they are redirected to the login page

### Requirement: Auth state drives UI

The application UI SHALL react to three auth states: loading, authenticated, and unauthenticated.

#### Scenario: Loading state shown
- **WHEN** the app is checking auth status on load
- **THEN** a loading indicator is displayed instead of application content

### Requirement: User ID available via context

The authenticated user's ID SHALL be available to all components through React context.

#### Scenario: Component reads user ID
- **WHEN** an authenticated component accesses auth context
- **THEN** it receives the current user's UUID

