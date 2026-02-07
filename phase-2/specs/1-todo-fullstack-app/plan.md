# Implementation Plan: Todo Full-Stack Web Application

**Branch**: `1-todo-fullstack-app` | **Date**: 2026-01-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/1-todo-fullstack-app/spec.md`

## Summary

Transform a console-based todo application into a modern multi-user web application with:
- **Frontend**: Next.js 16+ App Router with Better Auth for authentication
- **Backend**: Python FastAPI with SQLModel ORM for RESTful API
- **Database**: Neon Serverless PostgreSQL for persistent storage
- **Security**: JWT-based authentication with user data isolation

The application will support 5 core operations: Create, Read, Update Status, Edit, and Delete todos, all scoped to the authenticated user.

## Technical Context

**Language/Version**:
- Frontend: TypeScript 5.x, Node.js 20+
- Backend: Python 3.11+

**Primary Dependencies**:
- Frontend: Next.js 16+, Better Auth, Tailwind CSS
- Backend: FastAPI, SQLModel, python-jose (JWT), uvicorn

**Storage**: Neon Serverless PostgreSQL (via SQLModel ORM)

**Testing**:
- Frontend: Jest, React Testing Library
- Backend: pytest, httpx (async test client)

**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge)

**Project Type**: Web application (frontend + backend separation)

**Performance Goals**:
- Page load < 2 seconds
- API response < 500ms p95
- Support 100 concurrent users

**Constraints**:
- No offline support
- No real-time updates
- Single region deployment

**Scale/Scope**:
- 2 entities (User, Todo)
- 5 API endpoints
- 6 frontend pages/views

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Requirement | Status | Notes |
|-----------|-------------|--------|-------|
| I. Functionality | All 5 basic features implemented | PASS | Spec covers Create, Read, Update, Edit, Delete |
| II. Security | JWT auth + user isolation | PASS | Better Auth + FastAPI JWT middleware planned |
| III. Modularity | Frontend/Backend/DB separation | PASS | Three-tier architecture defined |
| IV. Reproducibility | Deployable via documentation | PASS | quickstart.md will be generated |
| V. Usability | Responsive UI + clear UX | PASS | Tailwind CSS + loading states specified |

**Gate Status**: PASSED - All constitution principles satisfied

## Project Structure

### Documentation (this feature)

```text
specs/1-todo-fullstack-app/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── openapi.yaml     # Backend API contract
│   └── auth-flow.md     # Authentication flow documentation
├── checklists/          # Quality validation
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (/sp.tasks command)
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Environment configuration
│   ├── database.py          # Neon connection setup
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py          # User SQLModel
│   │   └── todo.py          # Todo SQLModel
│   ├── routers/
│   │   ├── __init__.py
│   │   └── todos.py         # Todo CRUD endpoints
│   ├── auth/
│   │   ├── __init__.py
│   │   └── jwt.py           # JWT verification middleware
│   └── schemas/
│       ├── __init__.py
│       └── todo.py          # Pydantic request/response schemas
├── tests/
│   ├── __init__.py
│   ├── conftest.py          # Test fixtures
│   ├── test_todos.py        # Todo endpoint tests
│   └── test_auth.py         # Auth middleware tests
├── requirements.txt
├── .env.example
└── README.md

frontend/
├── app/
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Landing/redirect page
│   ├── (auth)/
│   │   ├── layout.tsx       # Auth layout (no nav)
│   │   ├── signin/
│   │   │   └── page.tsx     # Sign in page
│   │   └── signup/
│   │       └── page.tsx     # Sign up page
│   ├── (dashboard)/
│   │   ├── layout.tsx       # Dashboard layout (with nav)
│   │   └── todos/
│   │       └── page.tsx     # Todo list page
│   └── api/
│       └── auth/
│           └── [...all]/
│               └── route.ts # Better Auth API handler
├── components/
│   ├── ui/                  # Reusable UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── loading.tsx
│   ├── auth/
│   │   ├── signin-form.tsx
│   │   └── signup-form.tsx
│   └── todos/
│       ├── todo-list.tsx
│       ├── todo-item.tsx
│       ├── todo-form.tsx
│       └── delete-dialog.tsx
├── lib/
│   ├── auth.ts              # Better Auth client config
│   ├── auth-client.ts       # Auth client instance
│   └── api.ts               # API client with JWT
├── types/
│   └── index.ts             # TypeScript type definitions
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── .env.example
└── README.md
```

**Structure Decision**: Web application structure selected (Option 2) with clear frontend/backend separation per Constitution Principle III (Modularity).

## Complexity Tracking

> No complexity violations. Architecture follows standard three-tier web application pattern.

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| Monorepo vs Polyrepo | Monorepo (single repo) | Simpler for hackathon; easier to review |
| State Management | React hooks + fetch | No Redux needed for simple CRUD |
| API Client | Native fetch with wrapper | No axios needed; reduces dependencies |

## Implementation Phases

### Phase 1: Foundation Setup

**Goal**: Project scaffolding with database and auth configuration

1. Initialize Next.js frontend with App Router
2. Initialize FastAPI backend with SQLModel
3. Configure Neon PostgreSQL connection
4. Set up Better Auth in frontend
5. Create JWT verification middleware in backend

**Checkpoint**: Auth flow works (signup → JWT issued)

### Phase 2: Backend API

**Goal**: Complete CRUD API with user isolation

1. Create User and Todo SQLModel models
2. Implement todo CRUD endpoints
3. Add JWT verification to all routes
4. Implement user_id filtering on all queries
5. Add proper HTTP status codes and error responses

**Checkpoint**: API tests pass; curl commands work

### Phase 3: Frontend UI

**Goal**: Responsive todo management interface

1. Build auth pages (signin, signup)
2. Create todo dashboard layout
3. Implement todo list with CRUD operations
4. Add loading states and error handling
5. Apply responsive design with Tailwind

**Checkpoint**: End-to-end flow works in browser

### Phase 4: Integration & Polish

**Goal**: Complete, deployable application

1. Connect frontend to backend API
2. Test cross-origin requests (CORS)
3. Verify user isolation (multi-user testing)
4. Write quickstart documentation
5. Final security review

**Checkpoint**: All success criteria pass

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Better Auth + FastAPI JWT mismatch | Use shared secret; test token verification early |
| Neon connection pooling issues | Use SQLAlchemy async engine with pool size limits |
| CORS blocking API requests | Configure FastAPI CORS middleware explicitly |
| Session expiration UX | Implement auth state check on app load |

## Dependencies Between Phases

```
Phase 1 (Foundation)
    │
    ├──► Phase 2 (Backend API)
    │         │
    │         └──► Phase 4 (Integration)
    │                    ▲
    └──► Phase 3 (Frontend UI) ──────┘
```

- Phase 2 and Phase 3 can proceed in parallel after Phase 1
- Phase 4 requires both Phase 2 and Phase 3 complete
