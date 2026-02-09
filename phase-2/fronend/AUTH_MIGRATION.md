# Authentication System Migration

## Overview

This document describes the migration from Better Auth to a custom authentication system using the FastAPI backend.

## What Changed

### Removed Better Auth Components

The following Better Auth components have been **deprecated** but not deleted:

1. `frontend/auth.config.ts` - Better Auth configuration with Neon database
2. `frontend/lib/auth-client.ts` - Better Auth client hooks
3. `frontend/app/api/auth/[...all]/route.ts` - Better Auth API routes
4. Better Auth related environment variables:
   - `BETTER_AUTH_SECRET`
   - `DATABASE_URL` (was used for Better Auth sessions)
   - `NEXT_PUBLIC_BETTER_AUTH_URL`

### New Authentication System

The new authentication system uses the FastAPI backend for all authentication operations:

#### 1. Authentication API Client (`frontend/lib/auth-api.ts`)

Core authentication functions that communicate with the FastAPI backend:

- `signup(email, password, name?)` - Register new user account
- `signin(email, password)` - Sign in and receive JWT token
- `signout()` - Sign out and clear token
- `getCurrentUser()` - Get current authenticated user profile
- `isAuthenticated()` - Check if user has valid token

Token management:
- `getAuthToken()` - Retrieve JWT from localStorage
- `setAuthToken(token)` - Store JWT in localStorage
- `clearAuthToken()` - Remove JWT from localStorage

#### 2. Authentication Context (`frontend/lib/auth-context.tsx`)

React Context Provider that manages authentication state:

```typescript
interface AuthContextState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signup: (email, password, name?) => Promise<AuthResult<User>>;
  signin: (email, password) => Promise<AuthResult<User>>;
  signout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}
```

Usage:
```typescript
import { useAuth } from '@/lib/auth-context';

function MyComponent() {
  const { user, isAuthenticated, signin, signout } = useAuth();
  // ...
}
```

#### 3. Updated Components

All authentication components now use the new auth context:

- `components/auth/signup-form.tsx` - Uses `useAuth()` hook
- `components/auth/signin-form.tsx` - Uses `useAuth()` hook
- `components/auth/signout-button.tsx` - Uses `useAuth()` hook

#### 4. Updated Pages

- `app/page.tsx` - Client component that redirects based on auth status
- `app/(dashboard)/layout.tsx` - Protected layout using `useAuth()` hook
- `app/layout.tsx` - Wraps app with `<AuthProvider>`

#### 5. Updated API Client (`frontend/lib/api.ts`)

The API client now:
- Gets JWT token from localStorage via `getAuthToken()`
- Automatically attaches token to all API requests
- Clears token and redirects on 401 responses

## Authentication Flow

### Sign Up Flow

1. User fills signup form
2. Frontend calls `signup(email, password, name)`
3. Backend creates user account (`POST /api/auth/signup`)
4. Frontend automatically signs in the user
5. Backend returns JWT token (`POST /api/auth/signin`)
6. Token is stored in localStorage
7. User profile is fetched (`GET /api/auth/me`)
8. User is redirected to `/todos`

### Sign In Flow

1. User fills signin form
2. Frontend calls `signin(email, password)`
3. Backend validates credentials (`POST /api/auth/signin`)
4. Backend returns JWT token
5. Token is stored in localStorage
6. User profile is fetched (`GET /api/auth/me`)
7. User is redirected to `/todos`

### Sign Out Flow

1. User clicks sign out button
2. Frontend calls `signout()`
3. Token is removed from localStorage
4. Optional backend notification (`POST /api/auth/signout`)
5. User is redirected to `/signin`

### Protected Routes

Protected pages use the `useAuth()` hook:

```typescript
const { isAuthenticated, isLoading } = useAuth();

useEffect(() => {
  if (!isLoading && !isAuthenticated) {
    router.replace('/signin');
  }
}, [isAuthenticated, isLoading, router]);
```

### API Requests

All API requests automatically include the JWT token:

```typescript
const token = getAuthToken();
if (token) {
  headers['Authorization'] = `Bearer ${token}`;
}
```

If a request returns 401:
- Token is cleared from localStorage
- User is redirected to `/signin`

## Environment Variables

### Frontend (`.env`)

```bash
# Backend API URL (public, accessible from browser)
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (`.env`)

```bash
# Database connection
DATABASE_URL=postgresql://user:pass@host/db

# JWT configuration
JWT_SECRET=your-secret-key-here
JWT_ALGORITHM=HS256
TOKEN_EXPIRE_MINUTES=1440

# CORS
CORS_ORIGINS=http://localhost:3000
```

## Backend API Endpoints

All authentication endpoints are prefixed with `/api/auth`:

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/signup` | Register new user | No |
| POST | `/api/auth/signin` | Login and get JWT | No |
| POST | `/api/auth/signout` | Logout (optional) | No |
| GET | `/api/auth/me` | Get current user | Yes |

## Token Storage

JWT tokens are stored in localStorage with the key `auth_token`.

**Security Considerations:**
- Tokens are httpOnly: No (localStorage is accessible by JavaScript)
- Tokens expire after 24 hours (configurable in backend)
- Tokens are cleared on 401 responses
- Tokens are removed on sign out

**Note:** For production, consider using httpOnly cookies for enhanced security.

## Migration Steps for Developers

If you're migrating existing code:

1. Replace `signUp.email()` with `signup()`
2. Replace `signIn.email()` with `signin()`
3. Replace `signOut()` with `signout()`
4. Replace `useSession()` with `useAuth()`
5. Update `session?.user` to `user`
6. Remove imports from `@/lib/auth-client`
7. Add imports from `@/lib/auth-context`

Example:

```typescript
// Before (Better Auth)
import { useSession, signIn } from '@/lib/auth-client';

const { data: session } = useSession();
await signIn.email({ email, password });

// After (Custom Auth)
import { useAuth } from '@/lib/auth-context';

const { user, signin } = useAuth();
await signin(email, password);
```

## Testing

To test the authentication system:

1. Start the backend: `cd backend && uvicorn app.main:app --reload`
2. Start the frontend: `cd frontend && npm run dev`
3. Navigate to `http://localhost:3000`
4. Try signing up with a new account
5. Try signing in with existing credentials
6. Verify that todos are user-specific
7. Try signing out and signing back in

## Cleanup (Optional)

To completely remove Better Auth dependencies:

```bash
cd frontend

# Remove Better Auth packages
npm uninstall better-auth @better-auth/cli

# Remove Better Auth related packages (if no longer needed)
npm uninstall @neondatabase/serverless ws @types/ws pg @types/pg

# Delete Better Auth files
rm auth.config.ts
rm lib/auth-client.ts
rm -rf app/api/auth
rm -rf scripts/migrate.ts
rm -rf scripts/test-auth.ts
rm -rf migrations
```

**Note:** Only remove these packages if they're not used elsewhere in your application.
