# Implementation Plan: Security, Authentication & Data Isolation

**Branch**: `003-jwt-auth-security` | **Date**: 2026-01-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-jwt-auth-security/spec.md`

---

## Summary

Implement end-to-end JWT authentication flow between Next.js frontend (Better Auth) and FastAPI backend, ensuring all API requests are authenticated and user data is strictly isolated. Focus on the 6 pending requirements identified in the spec.

---

## Technical Context

**Language/Version**: TypeScript (Next.js 16+), Python 3.11+
**Primary Dependencies**: Better Auth, python-jose, FastAPI
**Storage**: Neon Serverless PostgreSQL (user/session tables managed by Better Auth)
**Testing**: Manual verification via curl, browser dev tools
**Target Platform**: Web application (localhost development)
**Project Type**: Web (frontend + backend)
**Performance Goals**: N/A (security feature)
**Constraints**: Stateless JWT verification, shared secret via env vars
**Scale/Scope**: Single-user to multi-user isolation

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Functionality | PASS | Authentication enables all 5 basic features with user isolation |
| II. Security | PASS | JWT-based auth, user isolation, secrets in env vars |
| III. Modularity | PASS | Frontend handles auth UI, backend verifies JWT |
| IV. Reproducibility | PASS | .env.example files, quickstart.md documentation |
| V. Usability | PASS | Better Auth provides standard login/signup UX |

**Gate Status**: PASS - All principles satisfied, proceeding to implementation.

---

## Project Structure

### Documentation (this feature)

```text
specs/003-jwt-auth-security/
├── plan.md              # This file
├── research.md          # Technical decisions (7 decisions documented)
├── data-model.md        # Security entities (User, Session, Todo)
├── quickstart.md        # Setup and verification guide
├── contracts/
│   └── auth-flow.md     # Authentication flow diagrams
└── checklists/
    └── requirements.md  # 20 requirements (14 PASS, 6 PENDING)
```

### Source Code (repository root)

```text
frontend/
├── lib/
│   ├── auth.ts          # Better Auth server config (EXISTS - needs JWT plugin)
│   ├── auth-client.ts   # Better Auth client (EXISTS)
│   └── api.ts           # API client with JWT (PENDING)
├── app/
│   ├── (auth)/          # Auth pages (EXISTS)
│   └── (dashboard)/     # Protected pages (EXISTS)
└── components/          # Auth components (EXISTS)

backend/
├── app/
│   ├── auth/
│   │   └── jwt.py       # JWT verification (EXISTS - COMPLETE)
│   ├── routers/
│   │   └── todos.py     # CRUD with isolation (EXISTS - COMPLETE)
│   ├── config.py        # Settings (EXISTS)
│   └── main.py          # FastAPI app (EXISTS)
└── .env.example         # Environment template (PENDING)
```

**Structure Decision**: Web application with existing frontend/backend separation. No new directories needed, only modifications to existing files.

---

## Implementation Phases

### Phase 1: Better Auth JWT Plugin Configuration (Frontend)

**Objective**: Enable JWT token generation on successful login.

**Tasks**:
1. Add JWT plugin to Better Auth configuration in `frontend/lib/auth.ts`
2. Configure token expiration (7 days)
3. Ensure token includes `sub` claim with user ID
4. Verify token is available in session response

**Files Modified**:
- `frontend/lib/auth.ts`

**Success Criteria**:
- FR-005: JWT tokens generated on successful login
- FR-008: JWT contains `sub` claim with user ID
- FR-009: JWT contains optional `email` and `name` claims

---

### Phase 2: Frontend API Client with JWT Attachment

**Objective**: Create centralized API client that attaches JWT to all backend requests.

**Tasks**:
1. Create `frontend/lib/api.ts` with fetch wrapper
2. Get session token from `authClient.getSession()`
3. Attach `Authorization: Bearer <token>` header
4. Handle 401 responses by redirecting to login

**Files Created**:
- `frontend/lib/api.ts`

**Files Modified**:
- `frontend/components/todos/todo-list.tsx` (use new API client)
- `frontend/components/todos/todo-form.tsx` (use new API client)
- `frontend/components/todos/todo-item.tsx` (use new API client)

**Success Criteria**:
- FR-012: Frontend attaches JWT in Authorization header for all API requests
- SC-002: All API requests include Authorization header with Bearer token

---

### Phase 3: Environment Variable Alignment

**Objective**: Ensure shared secret is configured correctly in both services.

**Tasks**:
1. Create/update `frontend/.env.example` with all required variables
2. Create/update `backend/.env.example` with all required variables
3. Document that `BETTER_AUTH_SECRET` must equal `JWT_SECRET`
4. Add validation or warning if secrets mismatch

**Files Modified**:
- `frontend/.env.example`
- `backend/.env.example`

**Success Criteria**:
- FR-010: JWT tokens signed using shared secret (JWT_SECRET)
- Constitution IV: Environment variable templates provided

---

### Phase 4: Integration Testing

**Objective**: Verify end-to-end authentication flow works correctly.

**Tasks**:
1. Test user registration → JWT generation
2. Test user login → JWT in session
3. Test API request with valid JWT → 200 OK
4. Test API request without JWT → 401 Unauthorized
5. Test API request with invalid JWT → 401 Unauthorized
6. Test cross-user access → 403 Forbidden

**Success Criteria**:
- SC-001: JWT tokens generated upon successful login
- SC-002: API requests include Authorization header
- SC-003: Backend returns 401 for invalid/missing tokens
- SC-004: User identity extracted from valid JWT
- SC-005: Users only see their own tasks
- SC-006: Cross-user access returns 403

---

### Phase 5: Security Hardening (Optional)

**Objective**: Additional security measures if time permits.

**Tasks**:
1. Add rate limiting to auth endpoints (optional)
2. Add request logging for auth failures (optional)
3. Add token refresh handling (optional - sessions handle this)

**Status**: OUT OF SCOPE for initial implementation per spec constraints.

---

## Complexity Tracking

> No constitution violations to justify. Implementation uses existing patterns and minimal new code.

| Aspect | Complexity | Justification |
|--------|------------|---------------|
| JWT plugin | Low | Built-in Better Auth feature |
| API client | Low | Simple fetch wrapper |
| Env alignment | Low | Documentation only |

---

## Risk Analysis

| Risk | Impact | Mitigation |
|------|--------|------------|
| Secret mismatch between services | High - all auth fails | Documentation + clear naming |
| Better Auth JWT plugin API changes | Medium | Pin to specific version |
| Token expiry handling | Low | Sessions auto-refresh |

---

## Dependencies

| From | To | Blocked Until |
|------|-----|---------------|
| Phase 2 | Phase 1 | JWT tokens must be generated first |
| Phase 4 | Phases 1-3 | All implementation must be complete |

---

## Estimated Task Count

| Phase | Tasks | Complexity |
|-------|-------|------------|
| Phase 1 | 4 | Low |
| Phase 2 | 6 | Medium |
| Phase 3 | 3 | Low |
| Phase 4 | 6 | Low |
| **Total** | **19** | - |

---

## Next Steps

1. Run `/sp.tasks` to generate detailed implementation tasks
2. Run `/sp.implement` to execute tasks via agent delegation
3. Verify all 20 requirements pass in `checklists/requirements.md`
