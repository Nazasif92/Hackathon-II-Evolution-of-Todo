# Implementation Tasks: Backend REST API

**Feature Branch**: `002-backend-api`
**Plan**: [plan.md](./plan.md)
**Spec**: [spec.md](./spec.md)
**Created**: 2026-01-12
**Status**: COMPLETE

---

## Task Summary

| Phase | Description | Task Count | Status |
|-------|-------------|------------|--------|
| Phase 1 | Setup | 5 | COMPLETE |
| Phase 2 | Foundational (Database & Auth) | 8 | COMPLETE |
| Phase 3 | US1: List Tasks + US2: Create Task | 6 | COMPLETE |
| Phase 4 | US3: Toggle Task Completion | 3 | COMPLETE |
| Phase 5 | US4: Update Task Details | 3 | COMPLETE |
| Phase 6 | US5: Delete Task | 3 | COMPLETE |
| Phase 7 | US6: Get Single Task | 2 | COMPLETE |
| Phase 8 | Polish & Cross-Cutting | 5 | COMPLETE |
| **Total** | | **35** | **35/35** |

---

## Phase 1: Setup

**Goal**: Initialize backend project structure with dependencies

**Validation**: Project structure created, dependencies listed

- [x] T001 Create backend directory structure per plan in backend/app/
- [x] T002 Create requirements.txt with all dependencies (fastapi, uvicorn, sqlmodel, sqlalchemy[asyncio], asyncpg, python-jose[cryptography], pydantic-settings) in backend/requirements.txt
- [x] T003 Create .env.example with DATABASE_URL, JWT_SECRET, JWT_ALGORITHM, CORS_ORIGINS in backend/.env.example
- [x] T004 [P] Create app/__init__.py with package initialization in backend/app/__init__.py
- [x] T005 [P] Create tests/__init__.py for test package in backend/tests/__init__.py

**Checkpoint**: Directory structure matches plan.md project structure - VERIFIED

---

## Phase 2: Foundational (Database & Auth)

**Goal**: Set up database connection and JWT authentication - blocks all user stories

**Validation**: Database connects on startup, JWT verification returns 401 for invalid tokens

### Configuration

- [x] T006 Create config.py with Settings class using pydantic-settings (database_url, jwt_secret, jwt_algorithm, cors_origins) in backend/app/config.py
- [x] T007 Create database.py with async SQLModel engine, connection pooling (pool_size=5, max_overflow=10), session factory in backend/app/database.py

### Models & Schemas (Shared by all stories)

- [x] T008 Create Todo SQLModel table with all fields (id, user_id, title, description, completed, created_at, updated_at) in backend/app/models/todo.py
- [x] T009 [P] Create models/__init__.py exporting Todo model in backend/app/models/__init__.py
- [x] T010 Create todo.py schemas (CreateTodoInput, UpdateTodoInput, TodoResponse) with validations in backend/app/schemas/todo.py
- [x] T011 [P] Create schemas/__init__.py exporting all schemas in backend/app/schemas/__init__.py

### Authentication

- [x] T012 Create jwt.py with get_current_user dependency, CurrentUser dataclass, token extraction from Bearer header in backend/app/auth/jwt.py
- [x] T013 [P] Create auth/__init__.py exporting get_current_user in backend/app/auth/__init__.py

**Checkpoint**: `from app.models import Todo` and `from app.auth import get_current_user` work without errors - VERIFIED

---

## Phase 3: User Story 1 & 2 - List and Create Tasks (Priority: P1)

**Goal**: Authenticated users can list their tasks and create new ones

**Independent Test**:
- US1: GET /api/todos returns user's tasks (empty array if none)
- US2: POST /api/todos creates task and returns it with generated ID

**Acceptance Criteria**:
- GET /api/todos returns HTTP 200 with JSON array
- POST /api/todos returns HTTP 201 with created task
- Both endpoints return HTTP 401 without valid JWT
- POST validates title (required, max 200 chars)

### Implementation

- [x] T014 [US1] [US2] Create routers/__init__.py with todos_router export in backend/app/routers/__init__.py
- [x] T015 [US1] [US2] Create todos.py router with APIRouter(prefix="/api/todos") in backend/app/routers/todos.py
- [x] T016 [US1] Implement GET /api/todos endpoint with user_id filtering in backend/app/routers/todos.py
- [x] T017 [US2] Implement POST /api/todos endpoint with user_id assignment from JWT in backend/app/routers/todos.py
- [x] T018 [US1] [US2] Create main.py with FastAPI app, lifespan (init_db), CORS middleware, router registration in backend/app/main.py
- [x] T019 [US1] [US2] Add health check endpoint GET /health in backend/app/main.py

**Checkpoint**: User Story 1 & 2 complete - list returns tasks, create persists new task - VERIFIED

---

## Phase 4: User Story 3 - Toggle Task Completion (Priority: P1)

**Goal**: Users can toggle task completion status

**Independent Test**: PATCH /api/todos/{id}/toggle inverts completed status

**Acceptance Criteria**:
- PATCH returns HTTP 200 with toggled task
- Returns HTTP 404 for non-existent task
- Returns HTTP 403 for another user's task

### Implementation

- [x] T020 [US3] Create get_todo_or_404 helper with ownership check in backend/app/routers/todos.py
- [x] T021 [US3] Implement PATCH /api/todos/{id}/toggle endpoint in backend/app/routers/todos.py
- [x] T022 [US3] Add 403 Forbidden response for unauthorized access in backend/app/routers/todos.py

**Checkpoint**: User Story 3 complete - toggle inverts completion status - VERIFIED

---

## Phase 5: User Story 4 - Update Task Details (Priority: P2)

**Goal**: Users can update task title and description

**Independent Test**: PUT /api/todos/{id} updates task and returns updated object

**Acceptance Criteria**:
- PUT returns HTTP 200 with updated task
- Returns HTTP 404 for non-existent task
- Returns HTTP 403 for another user's task
- Validates title if provided (non-empty, max 200)

### Implementation

- [x] T023 [US4] Implement PUT /api/todos/{id} endpoint with partial updates in backend/app/routers/todos.py
- [x] T024 [US4] Add updated_at timestamp update on modification in backend/app/routers/todos.py
- [x] T025 [US4] Add validation for title field on update in backend/app/routers/todos.py

**Checkpoint**: User Story 4 complete - update modifies task details - VERIFIED

---

## Phase 6: User Story 5 - Delete Task (Priority: P2)

**Goal**: Users can delete their tasks

**Independent Test**: DELETE /api/todos/{id} removes task permanently

**Acceptance Criteria**:
- DELETE returns HTTP 204 No Content
- Returns HTTP 404 for non-existent task
- Returns HTTP 403 for another user's task
- Deleted task no longer appears in list

### Implementation

- [x] T026 [US5] Implement DELETE /api/todos/{id} endpoint in backend/app/routers/todos.py
- [x] T027 [US5] Ensure ownership check before delete in backend/app/routers/todos.py
- [x] T028 [US5] Return HTTP 204 with no content body on success in backend/app/routers/todos.py

**Checkpoint**: User Story 5 complete - delete removes task permanently - VERIFIED

---

## Phase 7: User Story 6 - Get Single Task (Priority: P3)

**Goal**: Users can retrieve a single task by ID

**Independent Test**: GET /api/todos/{id} returns specific task

**Acceptance Criteria**:
- GET returns HTTP 200 with task object
- Returns HTTP 404 for non-existent task
- Returns HTTP 403 for another user's task

### Implementation

- [x] T029 [US6] Implement GET /api/todos/{id} endpoint in backend/app/routers/todos.py
- [x] T030 [US6] Reuse get_todo_or_404 helper for single task retrieval in backend/app/routers/todos.py

**Checkpoint**: User Story 6 complete - single task retrieval works - VERIFIED

---

## Phase 8: Polish & Cross-Cutting Concerns

**Goal**: Error handling, documentation, and final validation

**Validation**: All HTTP status codes match spec, README complete

- [x] T031 Add global exception handler for unhandled errors returning HTTP 500 in backend/app/main.py
- [x] T032 Add HTTPException handler for database errors returning HTTP 503 in backend/app/main.py
- [x] T033 Verify all HTTP status codes match spec (200, 201, 204, 400, 401, 403, 404, 422, 500, 503) in backend/app/routers/todos.py
- [x] T034 Create README.md with setup instructions, environment variables, API overview in backend/README.md
- [x] T035 Verify API responses match TodoResponse and ErrorResponse schemas in backend/app/schemas/todo.py

**Checkpoint**: All success criteria (SC-001 to SC-008) validated - VERIFIED

---

## Dependencies

```
Phase 1 (Setup)
    │
    ▼
Phase 2 (Foundational)
    │
    ├──────────────────────────────────────────┐
    │                                          │
    ▼                                          ▼
Phase 3 (US1: List + US2: Create)      [Independent after Phase 2]
    │
    ▼
Phase 4 (US3: Toggle) ─────► Phase 5 (US4: Update) ─────► Phase 6 (US5: Delete)
    │                              │                            │
    └──────────────────────────────┴────────────────────────────┘
                                   │
                                   ▼
                          Phase 7 (US6: Get Single)
                                   │
                                   ▼
                          Phase 8 (Polish)
```

### Story Dependencies

| Story | Depends On | Can Parallelize With |
|-------|------------|---------------------|
| US1 (List) | Phase 2 | US2 (same phase) |
| US2 (Create) | Phase 2 | US1 (same phase) |
| US3 (Toggle) | US1, US2 | - |
| US4 (Update) | US3 | US5 (after toggle helper exists) |
| US5 (Delete) | US3 | US4 (after toggle helper exists) |
| US6 (Get Single) | US3 | - |

---

## Parallel Execution Opportunities

### Within Phase 2 (Foundational)

```bash
# Can run in parallel after T007:
T008, T010  # Models and Schemas
T012        # JWT Authentication
```

### Within Phase 3 (US1 + US2)

```bash
# Can run in parallel:
T016 (GET)  # List endpoint
T017 (POST) # Create endpoint
```

### Within Phase 4-6

```bash
# After T020 (helper), can parallelize:
T023-T025 (US4: Update)
T026-T028 (US5: Delete)
```

---

## Implementation Strategy

### MVP Scope (Minimum Viable Product)

**Phase 1 + Phase 2 + Phase 3** = Core API functionality

- Users can create tasks
- Users can list their tasks
- JWT authentication enforced
- Database persistence working

### Incremental Delivery

1. **Increment 1**: Setup + Database + List/Create (US1 + US2) - COMPLETE
2. **Increment 2**: Toggle completion (US3) - COMPLETE
3. **Increment 3**: Update details (US4) - COMPLETE
4. **Increment 4**: Delete task (US5) - COMPLETE
5. **Increment 5**: Get single task (US6) + Polish - COMPLETE

---

## Success Criteria Traceability

| Criteria | Tasks | Phase | Status |
|----------|-------|-------|--------|
| SC-001: All 6 endpoints | T016, T017, T021, T023, T026, T029 | 3-7 | PASS |
| SC-002: HTTP status codes | T019, T022, T033 | 3, 4, 8 | PASS |
| SC-003: Data persists | T007, T008, T017 | 2, 3 | PASS |
| SC-004: User isolation | T012, T016, T020 | 2, 3, 4 | PASS |
| SC-005: Input validation | T010, T017, T025 | 2, 3, 5 | PASS |
| SC-006: Consistent JSON | T010, T035 | 2, 8 | PASS |
| SC-007: Edge cases | T031, T032, T033 | 8 | PASS |
| SC-008: Toggle inverts | T021 | 4 | PASS |
