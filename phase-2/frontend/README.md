# Todo App - Frontend

Next.js 16+ frontend for the Todo Full-Stack Web Application with Better Auth.

## Prerequisites

- Node.js 18+
- npm or yarn

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your values
```

Required environment variables:
- `BETTER_AUTH_SECRET`: Secret for Better Auth sessions
- `DATABASE_URL`: PostgreSQL connection string for Better Auth
- `BETTER_AUTH_URL`: URL of the auth server (usually same as app URL)
- `NEXT_PUBLIC_API_URL`: Backend API URL (e.g., http://localhost:8000)
- `NEXT_PUBLIC_BETTER_AUTH_URL`: Public auth URL for client

## Running

Development server:
```bash
npm run dev
```

The app will be available at http://localhost:3000

## Features

- User registration and authentication
- Create, view, edit, and delete todos
- Toggle todo completion status
- User data isolation (each user sees only their todos)
- Responsive design for mobile and desktop

## Project Structure

```
frontend/
├── app/
│   ├── (auth)/
│   │   ├── signin/        # Sign in page
│   │   └── signup/        # Sign up page
│   ├── (dashboard)/
│   │   └── todos/         # Todos page
│   ├── api/auth/          # Better Auth API routes
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/
│   ├── auth/              # Auth components
│   ├── todos/             # Todo components
│   └── ui/                # Reusable UI components
├── lib/
│   ├── api.ts             # API client
│   ├── auth.ts            # Better Auth config
│   └── auth-client.ts     # Auth client
└── types/
    └── index.ts           # TypeScript types
```

## Pages

- `/` - Landing page (redirects to /todos or /signin)
- `/signin` - Sign in page
- `/signup` - Sign up page
- `/todos` - Todo dashboard (requires authentication)
