# Implementation Plan: Backend REST API

**Feature Branch**: `002-backend-api`
**Spec**: [spec.md](./spec.md)
**Created**: 2026-01-12
**Status**: Ready for Tasks

## Technical Context

| Aspect | Value | Source |
|--------|-------|--------|
| Backend Framework | Python FastAPI | Constitution requirement |
| ORM | SQLModel | Constitution requirement |
| Database | Neon Serverless PostgreSQL | Constitution requirement |
| Authentication | JWT verification (tokens from Better Auth) | Spec assumption |
| API Style | RESTful with JSON | Constitution requirement |
| Request Handling | Async only | Spec constraint |

### Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| fastapi | latest | Web framework |
| uvicorn | latest | ASGI server |
| sqlmodel | latest | ORM with type safety |
| sqlalchemy[asyncio] | latest | Async database support |
| asyncpg | latest | PostgreSQL async driver |
| python-jose[cryptography] | latest | JWT verification |
| pydantic-settings | latest | Environment configuration |

## Constitution Check

### Principle Alignment

| Principle | Status | Implementation Notes |
|-----------|--------|---------------------|
| I. Functionality | PASS | All CRUD + toggle endpoints defined |
| II. Security | PASS | JWT verification on all routes, user isolation via user_id filtering |
| III. Modularity | PASS | Clean separation: routers, models, schemas, auth |
| IV. Reproducibility | PASS | requirements.txt, .env.example, quickstart.md provided |
| V. Usability | N/A | Backend-only scope (no UI) |

### Gate Checks

- [x] No hardcoded secrets (environment variables used)
- [x] Parameterized queries (SQLModel/SQLAlchemy handles)
- [x] Proper HTTP status codes defined
- [x] Error responses include descriptive messages
- [x] User data filtered by authenticated user_id

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry, lifespan, CORS
│   ├── config.py            # Settings from environment variables
│   ├── database.py          # Async engine, session factory
│   ├── auth/
│   │   ├── __init__.py
│   │   └── jwt.py           # get_current_user dependency
│   ├── models/
│   │   ├── __init__.py
│   │   └── todo.py          # Todo SQLModel table
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── todo.py          # CreateTodoInput, UpdateTodoInput, TodoResponse
│   └── routers/
│       ├── __init__.py
│       └── todos.py         # GET, POST, PUT, PATCH, DELETE endpoints
├── tests/
│   └── __init__.py
├── requirements.txt
├── .env.example
└── README.md
```

## Implementation Phases

### Phase 1: Backend Initialization

**Goal**: Create FastAPI application scaffold with configuration

**Tasks**:
1. Create `requirements.txt` with all dependencies
2. Create `app/config.py` with pydantic-settings for environment variables
3. Create `app/main.py` with FastAPI app, lifespan handler, CORS middleware
4. Create `.env.example` with required environment variables
5. Verify application starts without errors

**Validation**: `uvicorn app.main:app --reload` starts successfully

### Phase 2: Database & ORM Setup

**Goal**: Configure async SQLModel with Neon PostgreSQL

**Tasks**:
1. Create `app/database.py` with async engine and session factory
2. Configure connection pooling (pool_size=5, max_overflow=10)
3. Add lifespan startup to initialize database tables
4. Create `app/models/__init__.py` for model exports

**Validation**: Application connects to database on startup

### Phase 3: Schema & Models

**Goal**: Define Todo model and API schemas

**Tasks**:
1. Create `app/models/todo.py` with Todo SQLModel table
2. Create `app/schemas/todo.py` with input/output Pydantic models
3. Configure field validations (title max 200, description max 1000)
4. Add timestamp fields with auto-generation

**Validation**: Models import without errors

### Phase 4: JWT Authentication

**Goal**: Implement JWT verification dependency

**Tasks**:
1. Create `app/auth/jwt.py` with get_current_user dependency
2. Extract user_id from JWT "sub" claim
3. Return CurrentUser object with user_id, email, name
4. Handle invalid/expired tokens with 401 response

**Validation**: Protected endpoint returns 401 without token

### Phase 5: API Routes Implementation

**Goal**: Implement all CRUD + toggle endpoints

**Tasks**:
1. Create `app/routers/todos.py` with APIRouter
2. Implement GET `/api/todos` - list user's todos
3. Implement POST `/api/todos` - create new todo
4. Implement GET `/api/todos/{id}` - get single todo
5. Implement PUT `/api/todos/{id}` - update todo
6. Implement PATCH `/api/todos/{id}/toggle` - toggle completion
7. Implement DELETE `/api/todos/{id}` - delete todo
8. Register router in main.py

**Validation**: All endpoints respond correctly per OpenAPI spec

### Phase 6: Error Handling & Polish

**Goal**: Standardize error responses and add documentation

**Tasks**:
1. Add global exception handler for unhandled errors
2. Add ownership check helper (403 for other users' todos)
3. Add health check endpoint
4. Create `README.md` with setup instructions
5. Verify all HTTP status codes match spec

**Validation**: Error responses match ErrorResponse schema

## API Endpoints Summary

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /health | Health check | No |
| GET | /api/todos | List user's todos | Yes |
| POST | /api/todos | Create todo | Yes |
| GET | /api/todos/{id} | Get single todo | Yes |
| PUT | /api/todos/{id} | Update todo | Yes |
| PATCH | /api/todos/{id}/toggle | Toggle completion | Yes |
| DELETE | /api/todos/{id} | Delete todo | Yes |

## Success Criteria Mapping

| Spec Criteria | Implementation |
|--------------|----------------|
| SC-001: All 6 endpoints respond | Phase 5 tasks |
| SC-002: Correct HTTP status codes | Phase 5 + 6 |
| SC-003: Data persists | Phase 2 database setup |
| SC-004: User isolation | Phase 4 JWT + Phase 5 filtering |
| SC-005: Input validation | Phase 3 Pydantic schemas |
| SC-006: Consistent JSON | Phase 3 response schemas |
| SC-007: Edge case handling | Phase 6 error handling |
| SC-008: Toggle inverts status | Phase 5 PATCH endpoint |

## References

- [Specification](./spec.md)
- [Research Decisions](./research.md)
- [Data Model](./data-model.md)
- [OpenAPI Contract](./contracts/openapi.yaml)
- [Quickstart Guide](./quickstart.md)
