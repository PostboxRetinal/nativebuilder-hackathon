## MODIFIED Requirements

### Requirement: Sign up with email and password

The system SHALL allow unauthenticated users to create an account with email and password, and SHALL enforce a password policy of at least 8 characters including an uppercase letter, a number, and a special character during signup.

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

The system SHALL allow existing users to authenticate with their email and password, and SHALL rate-limit sign-in attempts to a maximum of 5 attempts per 60-second window.

#### Scenario: Successful sign in
- **WHEN** a user submits correct credentials
- **THEN** the user is authenticated and redirected to the application

#### Scenario: Excess attempts rate limited
- **WHEN** more than 5 sign-in attempts occur within 60 seconds
- **THEN** further attempts are rejected with a friendly rate-limit message until the window resets
