# Quickstart: Security, Authentication & Data Isolation

**Feature Branch**: `003-jwt-auth-security`
**Created**: 2026-01-13

---

## Prerequisites

- Node.js 18+ (for Next.js frontend)
- Python 3.11+ (for FastAPI backend)
- Neon PostgreSQL database provisioned
- Git repository cloned

---

## Environment Setup

### 1. Generate Shared Secret

Generate a secure random secret (minimum 32 characters) to be shared between frontend and backend:

```bash
# Generate a secure random secret
openssl rand -base64 32
# Example output: K7xP9Qm2Nw4Lf3Hj8Rt5Yd6Vb1Zc0Xa/Wm+Sk=
```

### 2. Frontend Environment

Create `frontend/.env.local`:

```bash
# Database (Better Auth uses this for user/session storage)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Better Auth Secret (MUST match backend JWT_SECRET)
BETTER_AUTH_SECRET=K7xP9Qm2Nw4Lf3Hj8Rt5Yd6Vb1Zc0Xa/Wm+Sk=

# Better Auth URL
BETTER_AUTH_URL=http://localhost:3000

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Backend Environment

Create `backend/.env`:

```bash
# Database
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# JWT Secret (MUST match BETTER_AUTH_SECRET)
JWT_SECRET=K7xP9Qm2Nw4Lf3Hj8Rt5Yd6Vb1Zc0Xa/Wm+Sk=

# JWT Algorithm
JWT_ALGORITHM=HS256

# CORS
CORS_ORIGINS=http://localhost:3000
```

> **CRITICAL**: `BETTER_AUTH_SECRET` and `JWT_SECRET` MUST be identical for JWT verification to work.

---

## Quick Verification

### Step 1: Start Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Step 2: Start Frontend

```bash
cd frontend
npm install
npm run dev
```

### Step 3: Test Authentication Flow

1. **Register a new user**: Navigate to `http://localhost:3000/signup`
2. **Login**: Navigate to `http://localhost:3000/signin`
3. **Create a todo**: Navigate to `http://localhost:3000/todos`
4. **Verify isolation**: Create another user and confirm they cannot see the first user's todos

---

## Testing JWT Flow

### Test 1: Successful Authentication

```bash
# After logging in via frontend, get the session token from browser dev tools
# Then test the backend directly:

curl -X GET http://localhost:8000/api/todos \
  -H "Authorization: Bearer <your-jwt-token>"

# Expected: 200 OK with user's todos
```

### Test 2: Missing Token

```bash
curl -X GET http://localhost:8000/api/todos

# Expected: 401 Unauthorized
# {"detail": "Not authenticated"}
```

### Test 3: Invalid Token

```bash
curl -X GET http://localhost:8000/api/todos \
  -H "Authorization: Bearer invalid.token.here"

# Expected: 401 Unauthorized
# {"detail": "Invalid or expired token"}
```

### Test 4: Cross-User Access

```bash
# Using User A's token, try to access User B's task
curl -X GET http://localhost:8000/api/todos/5 \
  -H "Authorization: Bearer <user-a-token>"

# If task 5 belongs to User B:
# Expected: 403 Forbidden
# {"detail": "Not authorized to access this task"}
```

---

## Common Issues

### Issue: "Invalid or expired token" on all requests

**Cause**: Mismatched secrets between frontend and backend

**Fix**: Ensure `BETTER_AUTH_SECRET` in `frontend/.env.local` exactly matches `JWT_SECRET` in `backend/.env`

### Issue: "Not authenticated" even after login

**Cause**: Frontend not attaching JWT to requests

**Fix**: Verify the API client is using `authClient.getSession()` to get the token

### Issue: CORS errors in browser

**Cause**: Backend not allowing frontend origin

**Fix**: Ensure `CORS_ORIGINS=http://localhost:3000` in `backend/.env`

---

## Security Checklist

- [ ] Secrets are in `.env` files (not committed to git)
- [ ] `.env.example` files exist with placeholder values
- [ ] `BETTER_AUTH_SECRET` and `JWT_SECRET` are identical
- [ ] Secrets are at least 32 characters long
- [ ] CORS is configured for frontend origin only
- [ ] All todo endpoints require authentication
- [ ] Cross-user access returns 403 (not 404)

---

## Next Steps

After completing setup:

1. Run `/sp.tasks` to generate implementation tasks
2. Run `/sp.implement` to execute the tasks
3. Verify all success criteria pass
