# Better Auth + Neon PostgreSQL Setup

## Overview

This document describes the Better Auth setup with Neon PostgreSQL for JWT-based authentication in the Next.js 16 application.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 16)                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────┐         ┌──────────────────┐           │
│  │  Auth Client   │────────▶│  API Routes      │           │
│  │  (Browser)     │         │  /api/auth/[...] │           │
│  └────────────────┘         └──────────┬───────┘           │
│                                         │                    │
│                             ┌───────────▼─────────┐         │
│                             │  Better Auth Server  │         │
│                             │  (auth.config.ts)    │         │
│                             └───────────┬─────────┘         │
└─────────────────────────────────────────┼───────────────────┘
                                          │
                                          │ SQL Queries
                                          ▼
                              ┌────────────────────┐
                              │  Neon PostgreSQL   │
                              │  (Serverless)      │
                              └────────────────────┘
```

## Database Schema

The following tables are created for Better Auth:

### `user` table
- `id` (TEXT, PRIMARY KEY) - Unique user identifier
- `email` (TEXT, UNIQUE, NOT NULL) - User email address
- `emailVerified` (BOOLEAN) - Email verification status
- `name` (TEXT) - User display name
- `image` (TEXT) - Profile image URL
- `createdAt` (TIMESTAMP) - Account creation time
- `updatedAt` (TIMESTAMP) - Last update time

### `session` table
- `id` (TEXT, PRIMARY KEY) - Session identifier
- `userId` (TEXT, FOREIGN KEY) - References user.id
- `expiresAt` (TIMESTAMP) - Session expiration time
- `token` (TEXT, UNIQUE) - Session token
- `ipAddress` (TEXT) - Client IP address
- `userAgent` (TEXT) - Client user agent
- `createdAt` (TIMESTAMP) - Session creation time
- `updatedAt` (TIMESTAMP) - Last update time

### `account` table
- `id` (TEXT, PRIMARY KEY) - Account identifier
- `userId` (TEXT, FOREIGN KEY) - References user.id
- `accountId` (TEXT) - Provider-specific account ID
- `providerId` (TEXT) - Authentication provider (e.g., "credential")
- `password` (TEXT) - Hashed password (for email/password auth)
- `accessToken` (TEXT) - OAuth access token (for OAuth providers)
- `refreshToken` (TEXT) - OAuth refresh token
- `expiresAt` (TIMESTAMP) - Token expiration time
- `createdAt` (TIMESTAMP) - Account creation time
- `updatedAt` (TIMESTAMP) - Last update time

### `verification` table
- `id` (TEXT, PRIMARY KEY) - Verification token identifier
- `identifier` (TEXT) - Email or phone number
- `value` (TEXT) - Verification token value
- `expiresAt` (TIMESTAMP) - Token expiration time
- `createdAt` (TIMESTAMP) - Token creation time
- `updatedAt` (TIMESTAMP) - Last update time

## Configuration Files

### 1. `auth.config.ts` (Root)
Main Better Auth configuration with database connection and plugins.

```typescript
import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";

export const authConfig = betterAuth({
  database: {
    provider: "postgres",
    url: process.env.DATABASE_URL!,
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: false,
  },
  session: {
    expiresIn: 60 * 60 * 24, // 24 hours
    updateAge: 60 * 60, // 1 hour
  },
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  plugins: [
    jwt({
      expiresIn: 60 * 60 * 24, // 24 hours
      issuer: "better-auth",
    }),
  ],
});
```

### 2. `lib/auth.ts`
Exports the auth instance for use in API routes.

### 3. `lib/auth-client.ts`
Client-side auth utilities for React components.

```typescript
"use client";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
});

export const { signIn, signUp, signOut, useSession } = authClient;
```

### 4. `app/api/auth/[...all]/route.ts`
Next.js API route handler that handles all Better Auth endpoints.

```typescript
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

## Environment Variables

### `.env` (Frontend)
```env
# Better Auth configuration
BETTER_AUTH_SECRET=<your-secret-key>

# Database connection string for Better Auth sessions
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Backend API URL (public, accessible from browser)
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install better-auth @neondatabase/serverless ws dotenv
npm install -D @better-auth/cli @types/ws tsx
```

### 2. Run Database Migration
```bash
npm run migrate
```

This creates the required tables in your Neon PostgreSQL database.

### 3. Start Development Server
```bash
npm run dev
```

### 4. Test Authentication
Visit `http://localhost:3000/test-auth` to test the authentication endpoints.

## API Endpoints

All endpoints are available under `/api/auth/`:

### Signup
- **Endpoint**: `POST /api/auth/sign-up/email`
- **Body**: `{ email, password, name }`
- **Returns**: User object and session token

### Signin
- **Endpoint**: `POST /api/auth/sign-in/email`
- **Body**: `{ email, password }`
- **Returns**: User object and session token (JWT)

### Signout
- **Endpoint**: `POST /api/auth/sign-out`
- **Headers**: Session cookie
- **Returns**: Success message

### Get Session
- **Endpoint**: `GET /api/auth/get-session`
- **Headers**: Session cookie
- **Returns**: Current session data or null

## Client Usage

### Using React Hooks

```tsx
"use client";
import { authClient } from "@/lib/auth-client";

export default function MyComponent() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) return <div>Loading...</div>;

  if (!session) {
    return <div>Not authenticated</div>;
  }

  return <div>Welcome, {session.user.name}!</div>;
}
```

### Signup

```tsx
import { authClient } from "@/lib/auth-client";

async function handleSignup(email: string, password: string, name: string) {
  try {
    const response = await authClient.signUp.email({
      email,
      password,
      name,
    });
    console.log("Signup successful:", response.data?.user);
  } catch (error) {
    console.error("Signup failed:", error);
  }
}
```

### Signin

```tsx
import { authClient } from "@/lib/auth-client";

async function handleSignin(email: string, password: string) {
  try {
    const response = await authClient.signIn.email({
      email,
      password,
    });
    console.log("Signin successful:", response.data?.user);
  } catch (error) {
    console.error("Signin failed:", error);
  }
}
```

### Signout

```tsx
import { authClient } from "@/lib/auth-client";

async function handleSignout() {
  try {
    await authClient.signOut();
    console.log("Signout successful");
  } catch (error) {
    console.error("Signout failed:", error);
  }
}
```

## Backend Integration (FastAPI)

To verify JWT tokens from the backend, extract the token from the `Authorization` header:

```python
from fastapi import Header, HTTPException
import jwt

async def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = authorization.split(" ")[1]

    try:
        # Verify JWT token
        payload = jwt.decode(
            token,
            JWT_SECRET,  # Same secret as BETTER_AUTH_SECRET
            algorithms=["HS256"]
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

## Security Features

1. **Password Hashing**: Passwords are hashed using bcrypt before storage
2. **JWT Tokens**: Stateless authentication with signed tokens
3. **Session Management**: Server-side session tracking with expiration
4. **CSRF Protection**: Built-in CSRF token validation
5. **Rate Limiting**: Configurable rate limiting on auth endpoints
6. **Secure Cookies**: httpOnly, secure, sameSite cookies for session tokens

## Troubleshooting

### 404 Error on Auth Endpoints

**Issue**: `/api/auth/*` returns 404

**Solution**:
1. Verify the route handler exists at `app/api/auth/[...all]/route.ts`
2. Ensure auth instance is properly exported from `lib/auth.ts`
3. Check that `DATABASE_URL` and `BETTER_AUTH_SECRET` are set in `.env`
4. Restart the development server

### Database Connection Error

**Issue**: "Failed to initialize database adapter"

**Solution**:
1. Verify `DATABASE_URL` is correct and accessible
2. Run the migration script: `npm run migrate`
3. Check that the database tables exist
4. Ensure Neon database is active (not paused)

### JWT Token Invalid

**Issue**: Backend rejects JWT token

**Solution**:
1. Ensure `JWT_SECRET` in backend matches `BETTER_AUTH_SECRET` in frontend
2. Verify token is being sent in `Authorization: Bearer <token>` header
3. Check token expiration time
4. Validate token format and signature

## Testing

Use the test page at `/test-auth` to verify:
- Signup functionality
- Signin functionality
- Signout functionality
- Session persistence
- JWT token generation

## Scripts

- `npm run migrate` - Create Better Auth database tables
- `npm run dev` - Start development server
- `npm run test:auth` - Test auth endpoints (requires running server)

## Files Structure

```
frontend/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...all]/
│   │           └── route.ts          # Auth API handler
│   └── test-auth/
│       └── page.tsx                  # Test page
├── lib/
│   ├── auth.ts                       # Server auth instance
│   └── auth-client.ts                # Client auth utilities
├── migrations/
│   └── 001_better_auth_schema.sql   # Database schema
├── scripts/
│   └── migrate.ts                    # Migration script
├── auth.config.ts                    # Auth configuration
└── .env                             # Environment variables
```

## Additional Resources

- [Better Auth Documentation](https://www.better-auth.com)
- [Neon PostgreSQL Documentation](https://neon.tech/docs)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [JWT Specification](https://jwt.io)
