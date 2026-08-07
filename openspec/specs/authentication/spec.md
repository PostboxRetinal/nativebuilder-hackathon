# authentication Specification

## Purpose
User identity management with email and password authentication via Supabase Auth, driving protected access to all application features.
## Requirements
### Requirement: Sign up with email and password

The system SHALL allow unauthenticated users to create an account with email and password, enforcing a password policy of at least 8 characters including an uppercase letter, a number, and a special character during signup.

#### Scenario: Successful sign up
- **WHEN** a user submits valid email and password
- **THEN** a new account is created and the user is authenticated

#### Scenario: Weak password rejected on signup
- **WHEN** a signup password is shorter than 8 characters or lacks an uppercase letter, number, or special character
- **THEN** the signup is blocked with a descriptive error and no account is created

#### Scenario: Strong password accepted on signup
- **WHEN** a signup password is at least 8 characters and contains an uppercase letter, a number, and a special character
- **THEN** the signup proceeds and an account creation request is sent

### Requirement: Sign in with email and password

The system SHALL allow existing users to authenticate with their email and password, rate-limiting attempts to a maximum of 5 per 60-second window.

#### Scenario: Successful sign in
- **WHEN** a user submits correct credentials
- **THEN** the user is authenticated and redirected to the application

#### Scenario: Excess attempts rate limited
- **WHEN** more than 5 sign-in attempts occur within 60 seconds
- **THEN** further attempts are rejected with a friendly rate-limit message until the window resets

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

