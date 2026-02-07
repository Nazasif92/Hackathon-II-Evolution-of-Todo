# Authentication Flow: Todo Full-Stack Web Application

**Date**: 2026-01-12
**Branch**: `1-todo-fullstack-app`
**Purpose**: Document the authentication flow between Better Auth (frontend) and FastAPI (backend)

## Overview

The application uses a **split authentication** architecture:
- **Better Auth** (frontend) handles user management, signup, signin, and JWT issuance
- **FastAPI** (backend) verifies JWTs and extracts user identity for API authorization

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│    Browser      │      │  Next.js +      │      │   FastAPI       │
│    (User)       │      │  Better Auth    │      │   Backend       │
└────────┬────────┘      └────────┬────────┘      └────────┬────────┘
         │                        │                        │
         │  1. Signup/Signin      │                        │
         │───────────────────────►│                        │
         │                        │                        │
         │  2. JWT Token          │                        │
         │◄───────────────────────│                        │
         │                        │                        │
         │  3. API Request + JWT  │                        │
         │────────────────────────┼───────────────────────►│
         │                        │                        │
         │                        │  4. Verify JWT         │
         │                        │  Extract user_id       │
         │                        │                        │
         │  5. Response           │                        │
         │◄───────────────────────┼────────────────────────│
         │                        │                        │
```

## Sequence Diagrams

### User Signup Flow

```
User                    Frontend (Better Auth)         Database (Better Auth)
 │                              │                              │
 │  POST /api/auth/signup       │                              │
 │  {email, password, name}     │                              │
 │─────────────────────────────►│                              │
 │                              │                              │
 │                              │  Validate input              │
 │                              │  Hash password               │
 │                              │                              │
 │                              │  INSERT user                 │
 │                              │─────────────────────────────►│
 │                              │                              │
 │                              │  User created                │
 │                              │◄─────────────────────────────│
 │                              │                              │
 │                              │  Generate JWT                │
 │                              │  (include user_id)           │
 │                              │                              │
 │  Set cookie/return token     │                              │
 │  Redirect to /todos          │                              │
 │◄─────────────────────────────│                              │
```

### User Signin Flow

```
User                    Frontend (Better Auth)         Database (Better Auth)
 │                              │                              │
 │  POST /api/auth/signin       │                              │
 │  {email, password}           │                              │
 │─────────────────────────────►│                              │
 │                              │                              │
 │                              │  SELECT user by email        │
 │                              │─────────────────────────────►│
 │                              │                              │
 │                              │  User record                 │
 │                              │◄─────────────────────────────│
 │                              │                              │
 │                              │  Verify password hash        │
 │                              │  Generate JWT                │
 │                              │                              │
 │  Set cookie/return token     │                              │
 │  Redirect to /todos          │                              │
 │◄─────────────────────────────│                              │
```

### API Request with JWT

```
User                    Frontend                       FastAPI Backend
 │                         │                                │
 │  Click "Create Todo"    │                                │
 │────────────────────────►│                                │
 │                         │                                │
 │                         │  Get JWT from session          │
 │                         │                                │
 │                         │  POST /api/todos               │
 │                         │  Authorization: Bearer <JWT>   │
 │                         │  {title, description}          │
 │                         │───────────────────────────────►│
 │                         │                                │
 │                         │               Verify JWT signature
 │                         │               Decode payload
 │                         │               Extract user_id
 │                         │                                │
 │                         │               Insert todo with user_id
 │                         │                                │
 │                         │  201 Created                   │
 │                         │  {id, title, ...}              │
 │                         │◄───────────────────────────────│
 │                         │                                │
 │  Show new todo          │                                │
 │◄────────────────────────│                                │
```

## JWT Token Structure

### Token Payload (Claims)

```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "name": "John Doe",
  "iat": 1704988800,
  "exp": 1705075200
}
```

| Claim | Description |
|-------|-------------|
| sub | User ID (used as user_id in backend) |
| email | User's email address |
| name | User's display name |
| iat | Issued at timestamp |
| exp | Expiration timestamp |

### Token Verification (Backend)

```python
from jose import jwt, JWTError
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()
JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = "HS256"

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {"user_id": user_id, "email": payload.get("email")}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
```

## Environment Variables

### Frontend (.env.local)

```bash
# Better Auth configuration
BETTER_AUTH_SECRET=your-secret-key-min-32-chars
BETTER_AUTH_URL=http://localhost:3000

# Database for Better Auth (user sessions)
DATABASE_URL=postgresql://user:pass@host/db

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (.env)

```bash
# Must match BETTER_AUTH_SECRET for JWT verification
JWT_SECRET=your-secret-key-min-32-chars

# Database for todos
DATABASE_URL=postgresql://user:pass@host/db

# CORS origin
CORS_ORIGINS=http://localhost:3000
```

**CRITICAL**: `JWT_SECRET` (backend) MUST match `BETTER_AUTH_SECRET` (frontend) for token verification to work.

## Error Scenarios

### 401 Unauthorized

Returned when:
- No Authorization header provided
- Token is malformed
- Token signature is invalid
- Token has expired

```json
{
  "detail": "Invalid or expired token",
  "code": "UNAUTHORIZED"
}
```

### 403 Forbidden

Returned when:
- Token is valid but user doesn't own the requested resource

```json
{
  "detail": "You do not have permission to access this todo",
  "code": "FORBIDDEN"
}
```

## Session Management

### Token Storage (Frontend)

Better Auth handles token storage automatically:
- **HTTP-only cookie**: For server-side requests (more secure)
- **Session context**: Available via `useSession()` hook

### Token Refresh

Better Auth handles token refresh automatically when:
- Token is approaching expiration
- User makes a request with near-expired token

### Signout

```typescript
// Frontend signout
import { signOut } from "@/lib/auth-client";

await signOut();
// Clears session cookie
// Redirects to signin page
```

## Security Considerations

1. **JWT Secret Length**: Minimum 32 characters, randomly generated
2. **HTTPS in Production**: Always use HTTPS to prevent token interception
3. **Token Expiration**: Default 24 hours, configurable in Better Auth
4. **No Token in URL**: Never pass JWT in query parameters
5. **CORS Strict Mode**: Only allow specific frontend origin
