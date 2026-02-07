# Feature Specification: Security, Authentication & Data Isolation

**Feature Branch**: `003-jwt-auth-security`
**Created**: 2026-01-12
**Status**: Draft
**Input**: User description: "Spec-3: Security, Authentication & Data Isolation - Better Auth JWT integration, user identity verification, data isolation"

## Overview

This specification defines the security architecture for the Todo Full-Stack Web Application, focusing on three critical areas:

1. **Authentication**: Secure login/signup using Better Auth with JWT token generation
2. **Identity Verification**: Cross-boundary user verification between frontend and backend
3. **Data Isolation**: Strict enforcement that users can only access their own data

## User Scenarios & Testing

### User Story 1 - Secure Login with JWT Token (Priority: P1)

As a registered user, I want to log in with my email and password so that I receive a JWT token that authenticates my subsequent API requests.

**Why this priority**: Authentication is the foundation of all security - without valid tokens, no other features can work securely.

**Independent Test**: Can be tested by logging in and verifying a valid JWT is returned in the response/session.

**Acceptance Scenarios**:

1. **Given** a registered user with valid credentials, **When** they submit login form with correct email/password, **Then** Better Auth creates a session and a JWT token is available for API calls
2. **Given** an unregistered user, **When** they attempt to login, **Then** system returns 401 Unauthorized with "Invalid credentials" message
3. **Given** a registered user with incorrect password, **When** they submit login form, **Then** system returns 401 Unauthorized without revealing which field was wrong
4. **Given** a logged-in user, **When** the session expires (24 hours), **Then** the JWT token becomes invalid and returns 401 on API calls

---

### User Story 2 - JWT Token Attachment to Backend Requests (Priority: P1)

As an authenticated user, I want the frontend to automatically attach my JWT token to all backend API requests so that my identity is verified without manual intervention.

**Why this priority**: Token attachment is critical for the auth flow to work - ties login to API access.

**Independent Test**: Can be tested by making an API call after login and verifying the Authorization header is present with Bearer token.

**Acceptance Scenarios**:

1. **Given** a logged-in user with valid session, **When** the frontend makes any API request to backend, **Then** the request includes `Authorization: Bearer <token>` header
2. **Given** a user without valid session, **When** the frontend attempts an API call, **Then** no Authorization header is attached (or user is redirected to login)
3. **Given** a logged-in user, **When** the session is refreshed (within updateAge window), **Then** the new token is used for subsequent requests

---

### User Story 3 - Backend JWT Verification (Priority: P1)

As a backend system, I want to verify JWT tokens on every protected endpoint so that only authenticated requests are processed.

**Why this priority**: Backend verification is the security gate - without it, anyone could access protected resources.

**Independent Test**: Can be tested by sending requests with valid/invalid/missing tokens and verifying appropriate responses.

**Acceptance Scenarios**:

1. **Given** a request with valid JWT token, **When** the backend receives it, **Then** the token is decoded using the shared JWT_SECRET and the request proceeds
2. **Given** a request with invalid JWT token (wrong secret, malformed), **When** the backend receives it, **Then** system returns HTTP 401 Unauthorized with "Invalid or expired token" message
3. **Given** a request with expired JWT token, **When** the backend receives it, **Then** system returns HTTP 401 Unauthorized
4. **Given** a request with no Authorization header, **When** the backend receives it on a protected endpoint, **Then** system returns HTTP 401 Unauthorized
5. **Given** a request with malformed Authorization header (no Bearer prefix), **When** the backend receives it, **Then** system returns HTTP 401 Unauthorized

---

### User Story 4 - User Identity Extraction from Token (Priority: P1)

As a backend system, I want to extract the authenticated user's identity from the JWT token so that I can filter and associate data with the correct user.

**Why this priority**: User identity extraction is required for data isolation - can't filter by user without knowing who they are.

**Independent Test**: Can be tested by decoding a valid token and verifying user_id, email are present.

**Acceptance Scenarios**:

1. **Given** a valid JWT token with "sub" claim, **When** the backend decodes it, **Then** the user_id is extracted from the "sub" claim
2. **Given** a valid JWT token, **When** decoded, **Then** optional email and name claims are also extracted if present
3. **Given** a token missing the "sub" claim, **When** the backend attempts to decode it, **Then** system returns HTTP 401 with "Invalid token: missing user ID"

---

### User Story 5 - Data Isolation - Task Ownership Enforcement (Priority: P1)

As a system administrator, I want to ensure users can only access, modify, and delete their own tasks so that user data privacy is protected.

**Why this priority**: Data isolation is the core security guarantee - users must never see other users' data.

**Independent Test**: Can be tested by creating tasks with one user and attempting to access them with another user's token.

**Acceptance Scenarios**:

1. **Given** User A is authenticated, **When** User A lists tasks, **Then** only tasks with user_id matching User A are returned
2. **Given** User A is authenticated, **When** User A creates a task, **Then** the task is automatically assigned user_id = User A's ID
3. **Given** User A is authenticated and User B owns task with ID=5, **When** User A requests GET /api/todos/5, **Then** system returns HTTP 403 Forbidden
4. **Given** User A is authenticated and User B owns task with ID=5, **When** User A attempts PUT /api/todos/5, **Then** system returns HTTP 403 Forbidden
5. **Given** User A is authenticated and User B owns task with ID=5, **When** User A attempts DELETE /api/todos/5, **Then** system returns HTTP 403 Forbidden
6. **Given** User A is authenticated and User B owns task with ID=5, **When** User A attempts PATCH /api/todos/5/toggle, **Then** system returns HTTP 403 Forbidden

---

### User Story 6 - Secure User Registration (Priority: P2)

As a new user, I want to create an account with email and password so that I can securely access the todo application.

**Why this priority**: Registration is required for new users but login/auth flow is more critical for existing users.

**Independent Test**: Can be tested by submitting signup form and verifying account creation with session.

**Acceptance Scenarios**:

1. **Given** a new user with valid email format and password >= 8 chars, **When** they submit signup form, **Then** account is created and user is logged in with session
2. **Given** an email that already exists, **When** new user attempts signup, **Then** system returns error "Email already in use"
3. **Given** a password less than 8 characters, **When** user attempts signup, **Then** system returns validation error
4. **Given** invalid email format, **When** user attempts signup, **Then** system returns validation error

---

### User Story 7 - Secure Logout (Priority: P3)

As a logged-in user, I want to log out so that my session is terminated and token is invalidated.

**Why this priority**: Logout is important but lower priority than core auth and data isolation.

**Independent Test**: Can be tested by logging out and verifying API calls fail with 401.

**Acceptance Scenarios**:

1. **Given** a logged-in user, **When** they click logout, **Then** the session is terminated and local auth state is cleared
2. **Given** a user has just logged out, **When** they attempt an API call with old token, **Then** system returns HTTP 401 (token may still be valid until expiry in stateless JWT)

---

### Edge Cases

- What happens when JWT secret is rotated? All existing tokens become invalid (401 on all requests)
- How does system handle concurrent login from multiple devices? Each device gets its own valid token
- What happens when database is unavailable during login? Better Auth returns appropriate error
- How does system handle token with future-dated expiry claim? Token should be rejected as suspicious
- What happens if user is deleted while they have valid token? Token remains valid until expiry (stateless)

## Requirements

### Functional Requirements

#### Authentication (Better Auth)

- **FR-001**: System MUST support user registration via email and password
- **FR-002**: System MUST enforce minimum password length of 8 characters
- **FR-003**: System MUST prevent duplicate email registration
- **FR-004**: System MUST support user login via email and password
- **FR-005**: System MUST generate session-based JWT tokens on successful login
- **FR-006**: System MUST support user logout that terminates the session
- **FR-007**: Sessions MUST expire after 24 hours of inactivity

#### JWT Token Management

- **FR-008**: JWT tokens MUST contain "sub" claim with user ID
- **FR-009**: JWT tokens MAY contain "email" and "name" claims
- **FR-010**: JWT tokens MUST be signed using a shared secret (JWT_SECRET)
- **FR-011**: JWT tokens MUST use a configurable algorithm (default: HS256)
- **FR-012**: Frontend MUST attach JWT token in Authorization header for all API requests

#### Backend Verification

- **FR-013**: Backend MUST verify JWT signature on all protected endpoints
- **FR-014**: Backend MUST return HTTP 401 for missing, invalid, or expired tokens
- **FR-015**: Backend MUST extract user_id from verified token's "sub" claim
- **FR-016**: Backend MUST include WWW-Authenticate header in 401 responses

#### Data Isolation

- **FR-017**: Backend MUST filter list queries by authenticated user_id
- **FR-018**: Backend MUST assign user_id to newly created tasks from token
- **FR-019**: Backend MUST verify task ownership before read/update/delete operations
- **FR-020**: Backend MUST return HTTP 403 Forbidden for ownership violations

### Key Entities

- **User**: Managed by Better Auth - id, email, password (hashed), name
- **Session**: Better Auth session - id, user_id, token, expires_at
- **Todo**: Task entity - includes user_id foreign key for ownership

## Success Criteria

### Measurable Outcomes

- **SC-001**: JWT tokens are generated upon successful login (verifiable via session inspection)
- **SC-002**: All API requests from logged-in users include Authorization header with Bearer token
- **SC-003**: Backend returns HTTP 401 for requests with invalid/missing/expired tokens
- **SC-004**: User identity (user_id) is correctly extracted from valid JWT tokens
- **SC-005**: Users can only see tasks they created (list filtering works correctly)
- **SC-006**: Users cannot access, modify, or delete other users' tasks (403 returned)
- **SC-007**: New task creation automatically assigns the authenticated user's ID
- **SC-008**: Password hashing prevents plaintext password storage

## Assumptions

- Better Auth manages user table and sessions in the same PostgreSQL database
- JWT_SECRET is shared between Better Auth (frontend) and FastAPI (backend) via environment variables
- Stateless JWT verification - backend does not query session table for validation
- HTTPS will be used in production to protect tokens in transit (out of scope for development)

## Constraints

- **Authentication Provider**: Better Auth (specified in constitution)
- **Token Format**: JWT with "sub" claim containing user ID
- **Shared Secret**: JWT_SECRET environment variable shared between frontend and backend
- **Stateless Auth**: Backend verifies token signature only, no session database lookups
- **No Manual Coding**: All implementation via Claude Code agent delegation

## Out of Scope

- OAuth/social login providers
- Multi-factor authentication (MFA)
- Password reset functionality
- Email verification
- Role-based access control (RBAC)
- Rate limiting on auth endpoints
- Token refresh mechanism (sessions handle this)
- Audit logging of auth events
