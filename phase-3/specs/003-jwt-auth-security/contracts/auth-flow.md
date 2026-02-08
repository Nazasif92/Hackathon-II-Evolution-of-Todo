# Authentication Flow Contract

**Feature Branch**: `003-jwt-auth-security`
**Created**: 2026-01-13

---

## Overview

This document defines the authentication flow contracts between Frontend (Next.js + Better Auth) and Backend (FastAPI).

---

## Flow 1: User Registration

```
┌─────────────┐    ┌─────────────────┐    ┌──────────────┐    ┌────────────┐
│   Browser   │    │   Frontend      │    │  Better Auth │    │  Database  │
│             │    │   (Next.js)     │    │   (Plugin)   │    │  (Neon)    │
└──────┬──────┘    └────────┬────────┘    └──────┬───────┘    └─────┬──────┘
       │                    │                    │                   │
       │ POST /api/auth/    │                    │                   │
       │ sign-up/email      │                    │                   │
       │ {email, password,  │                    │                   │
       │  name}             │                    │                   │
       │───────────────────>│                    │                   │
       │                    │                    │                   │
       │                    │ Validate input     │                   │
       │                    │ Hash password      │                   │
       │                    │──────────────────> │                   │
       │                    │                    │                   │
       │                    │                    │ INSERT user       │
       │                    │                    │ INSERT account    │
       │                    │                    │──────────────────>│
       │                    │                    │                   │
       │                    │                    │ INSERT session    │
       │                    │                    │──────────────────>│
       │                    │                    │                   │
       │                    │ Session + JWT      │                   │
       │                    │<──────────────────│                   │
       │                    │                    │                   │
       │ 200 OK             │                    │                   │
       │ Set-Cookie: session│                    │                   │
       │ {user, session}    │                    │                   │
       │<───────────────────│                    │                   │
       │                    │                    │                   │
```

### Request
```http
POST /api/auth/sign-up/email
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

### Response (Success - 200)
```json
{
  "user": {
    "id": "usr_abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": false,
    "createdAt": "2026-01-13T10:00:00Z"
  },
  "session": {
    "id": "ses_xyz789",
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expiresAt": "2026-01-20T10:00:00Z"
  }
}
```

### Response (Email Exists - 400)
```json
{
  "error": "Email already in use"
}
```

---

## Flow 2: User Login

```
┌─────────────┐    ┌─────────────────┐    ┌──────────────┐    ┌────────────┐
│   Browser   │    │   Frontend      │    │  Better Auth │    │  Database  │
│             │    │   (Next.js)     │    │   (Plugin)   │    │  (Neon)    │
└──────┬──────┘    └────────┬────────┘    └──────┬───────┘    └─────┬──────┘
       │                    │                    │                   │
       │ POST /api/auth/    │                    │                   │
       │ sign-in/email      │                    │                   │
       │ {email, password}  │                    │                   │
       │───────────────────>│                    │                   │
       │                    │                    │                   │
       │                    │ Forward to         │                   │
       │                    │ Better Auth        │                   │
       │                    │──────────────────> │                   │
       │                    │                    │                   │
       │                    │                    │ SELECT user       │
       │                    │                    │ by email          │
       │                    │                    │──────────────────>│
       │                    │                    │                   │
       │                    │                    │ Verify password   │
       │                    │                    │ bcrypt.compare()  │
       │                    │                    │                   │
       │                    │                    │ INSERT session    │
       │                    │                    │ Generate JWT      │
       │                    │                    │──────────────────>│
       │                    │                    │                   │
       │                    │ Session + JWT      │                   │
       │                    │<──────────────────│                   │
       │                    │                    │                   │
       │ 200 OK             │                    │                   │
       │ Set-Cookie: session│                    │                   │
       │ {user, session}    │                    │                   │
       │<───────────────────│                    │                   │
       │                    │                    │                   │
```

### Request
```http
POST /api/auth/sign-in/email
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

### Response (Success - 200)
```json
{
  "user": {
    "id": "usr_abc123",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "session": {
    "id": "ses_xyz789",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": "2026-01-20T10:00:00Z"
  }
}
```

### Response (Invalid Credentials - 401)
```json
{
  "error": "Invalid credentials"
}
```

---

## Flow 3: Authenticated API Request

```
┌─────────────┐    ┌─────────────────┐    ┌──────────────┐    ┌────────────┐
│   Browser   │    │   Frontend      │    │   Backend    │    │  Database  │
│             │    │   (Next.js)     │    │  (FastAPI)   │    │  (Neon)    │
└──────┬──────┘    └────────┬────────┘    └──────┬───────┘    └─────┬──────┘
       │                    │                    │                   │
       │ User action        │                    │                   │
       │ (e.g., list todos) │                    │                   │
       │───────────────────>│                    │                   │
       │                    │                    │                   │
       │                    │ Get session token  │                   │
       │                    │ from auth client   │                   │
       │                    │                    │                   │
       │                    │ GET /api/todos     │                   │
       │                    │ Authorization:     │                   │
       │                    │ Bearer <JWT>       │                   │
       │                    │──────────────────> │                   │
       │                    │                    │                   │
       │                    │                    │ Verify JWT        │
       │                    │                    │ Extract user_id   │
       │                    │                    │                   │
       │                    │                    │ SELECT * FROM     │
       │                    │                    │ todos WHERE       │
       │                    │                    │ user_id = ?       │
       │                    │                    │──────────────────>│
       │                    │                    │                   │
       │                    │                    │<──────────────────│
       │                    │                    │                   │
       │                    │ 200 OK             │                   │
       │                    │ [todos...]         │                   │
       │                    │<──────────────────│                   │
       │                    │                    │                   │
       │ Display todos      │                    │                   │
       │<───────────────────│                    │                   │
       │                    │                    │                   │
```

### Request
```http
GET /api/todos
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response (Success - 200)
```json
[
  {
    "id": 1,
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "completed": false,
    "user_id": "usr_abc123",
    "created_at": "2026-01-13T10:00:00Z"
  }
]
```

### Response (No Token - 401)
```json
{
  "detail": "Not authenticated"
}
```

### Response (Invalid Token - 401)
```json
{
  "detail": "Invalid or expired token"
}
```

---

## Flow 4: Cross-User Access Attempt (Blocked)

```
┌─────────────┐    ┌─────────────────┐    ┌──────────────┐    ┌────────────┐
│ User A      │    │   Frontend      │    │   Backend    │    │  Database  │
│ (Attacker)  │    │   (Next.js)     │    │  (FastAPI)   │    │  (Neon)    │
└──────┬──────┘    └────────┬────────┘    └──────┬───────┘    └─────┬──────┘
       │                    │                    │                   │
       │ GET /api/todos/5   │                    │                   │
       │ (Task owned by B)  │                    │                   │
       │───────────────────>│                    │                   │
       │                    │                    │                   │
       │                    │ GET /api/todos/5   │                   │
       │                    │ Authorization:     │                   │
       │                    │ Bearer <A's JWT>   │                   │
       │                    │──────────────────> │                   │
       │                    │                    │                   │
       │                    │                    │ Verify JWT        │
       │                    │                    │ user_id = A       │
       │                    │                    │                   │
       │                    │                    │ SELECT * FROM     │
       │                    │                    │ todos WHERE       │
       │                    │                    │ id = 5            │
       │                    │                    │──────────────────>│
       │                    │                    │                   │
       │                    │                    │ Task found,       │
       │                    │                    │ user_id = B       │
       │                    │                    │                   │
       │                    │                    │ A ≠ B → DENY      │
       │                    │                    │                   │
       │                    │ 403 Forbidden      │                   │
       │                    │<──────────────────│                   │
       │                    │                    │                   │
       │ Error: Forbidden   │                    │                   │
       │<───────────────────│                    │                   │
       │                    │                    │                   │
```

### Request
```http
GET /api/todos/5
Authorization: Bearer <User A's JWT>
```

### Response (Ownership Violation - 403)
```json
{
  "detail": "Not authorized to access this task"
}
```

---

## JWT Token Contract

### Token Structure
```
Header.Payload.Signature

Header:
{
  "alg": "HS256",
  "typ": "JWT"
}

Payload:
{
  "sub": "usr_abc123",      // Required: User ID
  "email": "user@example.com", // Optional
  "name": "John Doe",       // Optional
  "iat": 1736726400,        // Issued at
  "exp": 1737331200         // Expires at
}

Signature:
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  JWT_SECRET
)
```

### Verification Algorithm
```python
# Backend verification (FastAPI)
def verify_jwt(token: str) -> dict:
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret,  # Must match BETTER_AUTH_SECRET
            algorithms=["HS256"]
        )

        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(401, "Missing user ID")

        return {
            "user_id": user_id,
            "email": payload.get("email"),
            "name": payload.get("name")
        }

    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except jwt.JWTError:
        raise HTTPException(401, "Invalid token")
```

---

## Error Response Contract

| Scenario | HTTP Status | Response Body |
|----------|-------------|---------------|
| Missing Authorization header | 401 | `{"detail": "Not authenticated"}` |
| Invalid token format | 401 | `{"detail": "Invalid or expired token"}` |
| Expired token | 401 | `{"detail": "Invalid or expired token"}` |
| Wrong signature | 401 | `{"detail": "Invalid or expired token"}` |
| Missing `sub` claim | 401 | `{"detail": "Invalid token: missing user ID"}` |
| Ownership violation | 403 | `{"detail": "Not authorized to access this task"}` |
| Resource not found | 404 | `{"detail": "Task not found"}` |

All 401 responses MUST include:
```
WWW-Authenticate: Bearer
```
