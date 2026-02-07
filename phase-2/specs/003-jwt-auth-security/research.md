# Research: Security, Authentication & Data Isolation

**Feature Branch**: `003-jwt-auth-security`
**Created**: 2026-01-13
**Status**: Complete

---

## Technical Decisions

### Decision 1: JWT Token Generation Strategy

**Decision**: Use Better Auth's built-in JWT plugin for token generation on successful login.

**Rationale**:
- Better Auth v1.x includes native JWT support via `jwt` plugin
- Maintains session-JWT hybrid approach (sessions for frontend, JWT for backend API)
- Single source of truth for user authentication

**Alternatives Considered**:
- Manual JWT generation in custom endpoint - rejected: duplicates auth logic
- Session cookie only - rejected: doesn't work for cross-origin API calls
- Third-party JWT library in frontend - rejected: Better Auth already handles this

**Implementation**:
```typescript
// frontend/lib/auth.ts - Add JWT plugin
import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";

export const auth = betterAuth({
  // ... existing config
  plugins: [
    jwt({
      jwt: {
        expirationTime: "7d", // 7 days
      },
    }),
  ],
});
```

---

### Decision 2: JWT Secret Sharing Approach

**Decision**: Share JWT_SECRET via environment variables between frontend (Better Auth) and backend (FastAPI).

**Rationale**:
- Simple configuration via `.env` files
- No network calls needed for secret retrieval
- Standard practice for symmetric JWT signing (HS256)

**Alternatives Considered**:
- Public/private key pairs (RS256) - rejected: added complexity not needed for single-domain app
- Secret management service (Vault) - rejected: over-engineering for hackathon scope
- Database-stored secrets - rejected: unnecessary round-trip

**Implementation**:
```bash
# Frontend .env.local
BETTER_AUTH_SECRET=your-super-secret-key-min-32-chars

# Backend .env
JWT_SECRET=your-super-secret-key-min-32-chars  # Same value!
```

---

### Decision 3: Frontend Token Attachment Pattern

**Decision**: Create a centralized API client that automatically attaches JWT from Better Auth session to Authorization header.

**Rationale**:
- Single point of configuration for all API calls
- Consistent error handling for auth failures
- Better Auth client provides `getSession()` to retrieve current token

**Alternatives Considered**:
- Axios interceptors - rejected: Better Auth client is simpler
- Manual header addition per request - rejected: error-prone, repetitive
- Cookie-based auth - rejected: doesn't work for separate backend domain

**Implementation**:
```typescript
// frontend/lib/api.ts
import { authClient } from "./auth-client";

export async function apiClient<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const session = await authClient.getSession();
  const token = session?.data?.session?.token;

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  });

  if (response.status === 401) {
    // Redirect to login
    window.location.href = "/signin";
  }

  return response.json();
}
```

---

### Decision 4: Backend JWT Verification Pattern

**Decision**: Use FastAPI dependency injection with `HTTPBearer` security scheme for stateless JWT verification.

**Rationale**:
- Already implemented in `backend/app/auth/jwt.py`
- Clean dependency injection pattern
- No database lookups required (stateless)

**Alternatives Considered**:
- Middleware-based verification - rejected: less granular control per route
- Session validation via database - rejected: defeats stateless requirement
- Custom header extraction - rejected: HTTPBearer is standard

**Current Implementation Status**: ✅ Complete
- `backend/app/auth/jwt.py:27-62` - `get_current_user` dependency
- Uses `python-jose` for JWT decode
- Extracts `sub` claim as user_id

---

### Decision 5: Data Isolation Enforcement Pattern

**Decision**: Enforce user_id filtering at the route handler level using the authenticated user from JWT.

**Rationale**:
- Already implemented in `backend/app/routers/todos.py`
- Clear ownership checks before any data operation
- Returns 403 Forbidden for cross-user access attempts

**Alternatives Considered**:
- Database-level row security (PostgreSQL RLS) - rejected: added complexity
- Middleware-level filtering - rejected: less explicit, harder to debug
- Service layer filtering - rejected: our handlers are simple enough

**Current Implementation Status**: ✅ Complete
- All CRUD endpoints filter by `user_id`
- `get_todo_or_404` helper verifies ownership
- HTTP 403 returned for violations

---

### Decision 6: Token Claims Structure

**Decision**: Use standard JWT claims with `sub` (subject) containing user ID, plus optional `email` and `name`.

**Rationale**:
- `sub` is the standard claim for user identification (RFC 7519)
- Email/name useful for display without additional API calls
- Minimal payload keeps token size small

**Token Structure**:
```json
{
  "sub": "user_abc123",
  "email": "user@example.com",
  "name": "John Doe",
  "iat": 1736726400,
  "exp": 1737331200
}
```

---

### Decision 7: Error Response Standardization

**Decision**: Use consistent HTTP status codes and error response format for auth failures.

**Rationale**:
- 401 Unauthorized for authentication failures (missing/invalid/expired token)
- 403 Forbidden for authorization failures (valid token, wrong user)
- WWW-Authenticate header included per RFC 7235

**Error Response Format**:
```json
// 401 Unauthorized
{
  "detail": "Invalid or expired token"
}

// 403 Forbidden
{
  "detail": "Not authorized to access this task"
}
```

---

## Unknowns Resolved

| Unknown | Resolution |
|---------|------------|
| How does Better Auth generate JWT? | Use `jwt` plugin from `better-auth/plugins` |
| How to share secret between services? | Environment variable `BETTER_AUTH_SECRET` = `JWT_SECRET` |
| How to get token in frontend? | `authClient.getSession()` returns session with token |
| What JWT algorithm to use? | HS256 (symmetric) - simple, secure for single-domain |
| How long should tokens last? | 7 days (aligns with session expiry) |

---

## Dependencies

| Dependency | Purpose | Version |
|------------|---------|---------|
| better-auth | Authentication provider | ^1.0.0 |
| better-auth/plugins/jwt | JWT token generation | Included |
| python-jose | Backend JWT verification | ^3.3.0 |
| HTTPBearer (fastapi) | Authorization header extraction | Built-in |

---

## Implementation Status Summary

| Component | Status | Notes |
|-----------|--------|-------|
| Backend JWT verification | ✅ Complete | `backend/app/auth/jwt.py` |
| Backend data isolation | ✅ Complete | `backend/app/routers/todos.py` |
| Frontend Better Auth setup | ✅ Complete | `frontend/lib/auth.ts` |
| Frontend JWT plugin | ⏳ Pending | Needs configuration |
| Frontend API client | ⏳ Pending | Needs creation |
| Shared secret setup | ⏳ Pending | Needs .env alignment |
