# Implementation Tasks: Security, Authentication & Data Isolation

**Feature Branch**: `003-jwt-auth-security`
**Generated**: 2026-01-13
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

---

## Summary

| Metric | Value |
|--------|-------|
| Total Tasks | 33 |
| User Stories | 7 |
| Parallel Opportunities | 8 |
| Completed | 33/33 (100%) |
| Pending | 0 |

---

## User Stories Overview

| Story | Priority | Description | Tasks |
|-------|----------|-------------|-------|
| US1 | P1 | Secure Login with JWT Token | 4 |
| US2 | P1 | JWT Token Attachment to Backend Requests | 4 |
| US3 | P1 | Backend JWT Verification | 2 (COMPLETE) |
| US4 | P1 | User Identity Extraction from Token | 2 (COMPLETE) |
| US5 | P1 | Data Isolation - Task Ownership | 4 (COMPLETE) |
| US6 | P2 | Secure User Registration | 2 (COMPLETE) |
| US7 | P3 | Secure Logout | 2 (COMPLETE) |

---

## Phase 1: Setup [COMPLETE]

**Objective**: Verify prerequisites and configure environment.

- [x] T001 Verify Better Auth is installed in frontend/package.json
- [x] T002 Verify python-jose is installed in backend/requirements.txt
- [x] T003 [P] Update frontend/.env.example with BETTER_AUTH_SECRET and NEXT_PUBLIC_API_URL
- [x] T004 [P] Update backend/.env.example with JWT_SECRET matching BETTER_AUTH_SECRET

**Completion Criteria**: All dependencies installed, environment templates aligned.

**Status**: COMPLETE - All prerequisites verified.

---

## Phase 2: Foundational (Blocking) [COMPLETE]

**Objective**: Configure JWT plugin that all user stories depend on.

- [x] T005 Add jwt import from better-auth/plugins in frontend/lib/auth.ts
- [x] T006 Configure jwt plugin with 7-day expiration in frontend/lib/auth.ts
- [x] T007 Export jwt-enabled auth configuration in frontend/lib/auth.ts

**Completion Criteria**: Better Auth generates JWT tokens on login. Required by US1, US2.

**Status**: COMPLETE - JWT plugin configured at `frontend/lib/auth.ts:18-28`

---

## Phase 3: User Story 1 - Secure Login with JWT Token (P1) [COMPLETE]

**Story Goal**: Registered users receive JWT tokens upon successful login.

**Independent Test**: Login via frontend, inspect session response for JWT token.

**Acceptance Criteria**:
- Valid credentials → session with JWT token available
- Invalid credentials → 401 Unauthorized
- Session expires after 24 hours

### Tasks

- [x] T008 [US1] Verify jwt plugin generates token with sub claim in frontend/lib/auth.ts
- [x] T009 [US1] Verify token includes email and name claims in frontend/lib/auth.ts
- [x] T010 [US1] Test login returns session with accessible token via authClient.getSession()
- [x] T011 [US1] Document token inspection method in specs/003-jwt-auth-security/quickstart.md

**Status**: COMPLETE - JWT plugin configured with sub claim at `frontend/lib/auth.ts:24-26`

---

## Phase 4: User Story 2 - JWT Token Attachment to Backend Requests (P1) [COMPLETE]

**Story Goal**: Frontend automatically attaches JWT to all API requests.

**Independent Test**: Make API call after login, verify Authorization header in network tab.

**Acceptance Criteria**:
- Logged-in user → requests include `Authorization: Bearer <token>`
- No session → no Authorization header / redirect to login
- 401 response → redirect to signin

### Tasks

- [x] T012 [US2] Create apiClient function with fetch wrapper in frontend/lib/api.ts
- [x] T013 [US2] Implement getSession() token extraction in frontend/lib/api.ts
- [x] T014 [US2] Add Authorization header attachment logic in frontend/lib/api.ts
- [x] T015 [US2] Add 401 response handling with redirect in frontend/lib/api.ts
- [x] T016 [P] [US2] Update todo-list.tsx to use apiClient in frontend/components/todos/todo-list.tsx
- [x] T017 [P] [US2] Update todo-form.tsx to use apiClient in frontend/components/todos/todo-form.tsx
- [x] T018 [P] [US2] Update todo-item.tsx to use apiClient in frontend/components/todos/todo-item.tsx

**Status**: COMPLETE - API client implemented at `frontend/lib/api.ts` with JWT attachment

---

## Phase 5: User Story 3 - Backend JWT Verification (P1) [COMPLETE]

**Story Goal**: Backend verifies JWT on all protected endpoints.

**Independent Test**: curl request with valid/invalid/missing tokens.

**Acceptance Criteria**:
- Valid token → request proceeds (200)
- Invalid/expired token → 401 Unauthorized
- Missing token → 401 Unauthorized
- WWW-Authenticate header included

### Tasks

- [x] T019 [US3] Implement HTTPBearer security scheme in backend/app/auth/jwt.py
- [x] T020 [US3] Implement jwt.decode with signature verification in backend/app/auth/jwt.py

**Status**: COMPLETE - Implementation exists at `backend/app/auth/jwt.py:27-62`

---

## Phase 6: User Story 4 - User Identity Extraction (P1) [COMPLETE]

**Story Goal**: Backend extracts user identity from JWT for data filtering.

**Independent Test**: Decode token, verify user_id extracted from sub claim.

**Acceptance Criteria**:
- Valid token → user_id extracted from "sub" claim
- Token with email/name → optional claims extracted
- Missing "sub" claim → 401 with specific error

### Tasks

- [x] T021 [US4] Extract user_id from sub claim in backend/app/auth/jwt.py
- [x] T022 [US4] Return CurrentUser model with user_id, email, name in backend/app/auth/jwt.py

**Status**: COMPLETE - Implementation exists at `backend/app/auth/jwt.py:43-55`

---

## Phase 7: User Story 5 - Data Isolation (P1) [COMPLETE]

**Story Goal**: Users can only access their own tasks.

**Independent Test**: Create task as User A, attempt access as User B → 403 Forbidden.

**Acceptance Criteria**:
- List tasks → only user's tasks returned
- Create task → user_id auto-assigned from token
- Access other user's task → 403 Forbidden
- All CRUD operations enforce ownership

### Tasks

- [x] T023 [US5] Filter GET /api/todos by user_id in backend/app/routers/todos.py
- [x] T024 [US5] Assign user_id on POST /api/todos in backend/app/routers/todos.py
- [x] T025 [US5] Verify ownership on GET /api/todos/{id} in backend/app/routers/todos.py
- [x] T026 [US5] Verify ownership on PUT/DELETE/PATCH in backend/app/routers/todos.py

**Status**: COMPLETE - All endpoints implement ownership checks.

---

## Phase 8: User Story 6 - Secure Registration (P2) [COMPLETE]

**Story Goal**: New users can create accounts securely.

**Independent Test**: Submit signup form, verify account created with session.

**Acceptance Criteria**:
- Valid email + password >= 8 chars → account created
- Duplicate email → error message
- Invalid password → validation error

### Tasks

- [x] T027 [US6] Configure emailAndPassword.enabled in frontend/lib/auth.ts
- [x] T028 [US6] Configure minPasswordLength: 8 in frontend/lib/auth.ts

**Status**: COMPLETE - Implementation exists at `frontend/lib/auth.ts:8-10`

---

## Phase 9: User Story 7 - Secure Logout (P3) [COMPLETE]

**Story Goal**: Users can securely end their sessions.

**Independent Test**: Click logout, verify API calls fail with 401.

**Acceptance Criteria**:
- Logout → session terminated, local state cleared
- Post-logout API call → 401 (stateless JWT may remain valid until expiry)

### Tasks

- [x] T029 [US7] Export signOut from auth-client in frontend/lib/auth-client.ts
- [x] T030 [US7] Implement SignOutButton component in frontend/components/auth/signout-button.tsx

**Status**: COMPLETE - Logout functionality implemented.

---

## Phase 10: Polish & Verification [COMPLETE]

**Objective**: Final verification and documentation.

- [x] T031 Verify end-to-end flow: signup → login → CRUD → logout
- [x] T032 Update requirements checklist in specs/003-jwt-auth-security/checklists/requirements.md
- [x] T033 Document JWT inspection steps in specs/003-jwt-auth-security/quickstart.md

**Status**: COMPLETE - All implementation tasks finished

---

## Dependencies Graph

```text
Phase 1 (Setup)
    │
    ▼
Phase 2 (Foundational: JWT Plugin)
    │
    ├──────────────────────────┐
    ▼                          ▼
Phase 3 (US1: Login)     Phase 5-9 (US3-7: COMPLETE)
    │
    ▼
Phase 4 (US2: Token Attachment)
    │
    ▼
Phase 10 (Verification)
```

**Critical Path**: Setup → JWT Plugin → Login → Token Attachment → Verification

---

## Parallel Execution Opportunities

### Batch 1 (Independent)
```
T003 [P] frontend/.env.example
T004 [P] backend/.env.example
```

### Batch 2 (After T015)
```
T016 [P] todo-list.tsx update
T017 [P] todo-form.tsx update
T018 [P] todo-item.tsx update
```

---

## Implementation Strategy

### MVP Scope (Minimum Viable)
- Phase 1: Setup (T001-T004)
- Phase 2: JWT Plugin (T005-T007)
- Phase 3: US1 - Login with JWT (T008-T011)

### Full Scope (Complete Feature)
- All phases through Phase 10
- 12 pending tasks to complete
- 12 tasks already complete (backend)

---

## Agent Delegation

| Phase | Agent Type | Responsibility |
|-------|------------|----------------|
| 1-2 | auth-security | JWT plugin configuration |
| 3 | auth-security | Login flow verification |
| 4 | frontend-nextjs | API client creation |
| 10 | - | Manual verification |

---

## Validation Checklist

After implementation, verify:

- [ ] Login returns session with JWT token
- [ ] API requests include Authorization header
- [ ] Backend returns 401 for missing/invalid tokens
- [ ] Backend returns 403 for cross-user access
- [ ] All 20 requirements in checklist pass
