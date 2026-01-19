# Tasks: Todo Full-Stack Web Application

**Input**: Design documents from `/specs/1-todo-fullstack-app/`
**Prerequisites**: plan.md (required), spec.md (required), data-model.md, contracts/openapi.yaml

**Tests**: Tests are OPTIONAL - not explicitly requested in spec. Tasks focus on implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/app/`, `backend/tests/`
- **Frontend**: `frontend/app/`, `frontend/components/`, `frontend/lib/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create backend directory structure per plan.md in backend/
- [x] T002 Create frontend directory structure per plan.md in frontend/
- [x] T003 [P] Initialize Python virtual environment and create backend/requirements.txt with FastAPI, SQLModel, python-jose, uvicorn, asyncpg
- [x] T004 [P] Initialize Next.js 16+ project with App Router in frontend/ using npx create-next-app
- [x] T005 [P] Create backend/.env.example with DATABASE_URL, JWT_SECRET, CORS_ORIGINS placeholders
- [x] T006 [P] Create frontend/.env.example with BETTER_AUTH_SECRET, BETTER_AUTH_URL, DATABASE_URL, NEXT_PUBLIC_API_URL placeholders
- [x] T007 Install and configure Tailwind CSS in frontend/tailwind.config.ts
- [x] T008 Create TypeScript types from data-model.md in frontend/types/index.ts

**Checkpoint**: Both projects initialize without errors; npm run dev and uvicorn start successfully

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T009 Create environment configuration loader in backend/app/config.py
- [x] T010 Create Neon PostgreSQL async connection with pooling in backend/app/database.py
- [x] T011 [P] Create User SQLModel in backend/app/models/user.py per data-model.md
- [x] T012 [P] Create Todo SQLModel in backend/app/models/todo.py per data-model.md
- [x] T013 Create models __init__.py to export all models in backend/app/models/__init__.py
- [x] T014 Create FastAPI app with CORS middleware in backend/app/main.py
- [x] T015 Add health check endpoint (GET /health) in backend/app/main.py
- [x] T016 Create JWT verification dependency in backend/app/auth/jwt.py per contracts/auth-flow.md
- [x] T017 Create Pydantic schemas for Todo CRUD in backend/app/schemas/todo.py per openapi.yaml
- [x] T018 Configure Better Auth in frontend/lib/auth.ts with JWT plugin
- [x] T019 Create Better Auth client instance in frontend/lib/auth-client.ts
- [x] T020 Create API client with JWT header injection in frontend/lib/api.ts
- [x] T021 Create root layout with auth provider in frontend/app/layout.tsx
- [x] T022 Create reusable Button component in frontend/components/ui/button.tsx
- [x] T023 [P] Create reusable Input component in frontend/components/ui/input.tsx
- [x] T024 [P] Create reusable Card component in frontend/components/ui/card.tsx
- [x] T025 [P] Create Loading spinner component in frontend/components/ui/loading.tsx

**Checkpoint**: Database connects; JWT verification works; UI components render; Better Auth configured

---

## Phase 3: User Story 1 - User Registration and Authentication (Priority: P1)

**Goal**: Users can create accounts, sign in, and sign out securely

**Independent Test**: Complete signup → signin → signout flow; JWT token issued on login

### Implementation for User Story 1

- [x] T026 [US1] Create Better Auth API route handler in frontend/app/api/auth/[...all]/route.ts
- [x] T027 [US1] Create auth layout (minimal, no nav) in frontend/app/(auth)/layout.tsx
- [x] T028 [US1] Create signup form component with validation in frontend/components/auth/signup-form.tsx
- [x] T029 [US1] Create signin form component with validation in frontend/components/auth/signin-form.tsx
- [x] T030 [US1] Create signup page using SignupForm in frontend/app/(auth)/signup/page.tsx
- [x] T031 [US1] Create signin page using SigninForm in frontend/app/(auth)/signin/page.tsx
- [x] T032 [US1] Create landing page with redirect logic in frontend/app/page.tsx
- [x] T033 [US1] Add form validation for email format and password length (min 8 chars) in signup-form.tsx
- [x] T034 [US1] Add error message display for invalid credentials in signin-form.tsx
- [x] T035 [US1] Implement signout functionality with redirect to signin page

**Checkpoint**: User Story 1 complete - signup/signin/signout works; JWT token issued and stored

---

## Phase 4: User Story 2 - Create and View Todos (Priority: P2)

**Goal**: Authenticated users can create new todos and view their todo list

**Independent Test**: Create multiple todos; verify they appear in list; verify user isolation

### Implementation for User Story 2

- [x] T036 [US2] Create GET /api/todos endpoint with user_id filtering in backend/app/routers/todos.py
- [x] T037 [US2] Create POST /api/todos endpoint with user_id assignment in backend/app/routers/todos.py
- [x] T038 [US2] Register todos router in backend/app/main.py
- [x] T039 [US2] Create dashboard layout with navigation and auth check in frontend/app/(dashboard)/layout.tsx
- [x] T040 [US2] Create todo-form component for creating new todos in frontend/components/todos/todo-form.tsx
- [x] T041 [US2] Create todo-item component for displaying a single todo in frontend/components/todos/todo-item.tsx
- [x] T042 [US2] Create todo-list component that fetches and displays todos in frontend/components/todos/todo-list.tsx
- [x] T043 [US2] Create todos page with TodoList and TodoForm in frontend/app/(dashboard)/todos/page.tsx
- [x] T044 [US2] Add empty state message when no todos exist in todo-list.tsx
- [x] T045 [US2] Add loading state while fetching todos in todo-list.tsx
- [x] T046 [US2] Add title validation (not empty/whitespace) in todo-form.tsx

**Checkpoint**: User Story 2 complete - create and list todos works; user isolation verified

---

## Phase 5: User Story 3 - Update Todo Status (Priority: P3)

**Goal**: Users can toggle todo completion status

**Independent Test**: Toggle todo status; verify change persists after page refresh

### Implementation for User Story 3

- [x] T047 [US3] Create PATCH /api/todos/{id}/toggle endpoint in backend/app/routers/todos.py
- [x] T048 [US3] Add ownership check before toggle (return 403 if not owner) in todos.py
- [x] T049 [US3] Add completion toggle button/checkbox to todo-item.tsx
- [x] T050 [US3] Implement toggle API call with optimistic UI update in todo-item.tsx
- [x] T051 [US3] Add visual indication for completed todos (strikethrough, checkmark) in todo-item.tsx

**Checkpoint**: User Story 3 complete - toggle works; persists after refresh

---

## Phase 6: User Story 4 - Edit Todo Details (Priority: P4)

**Goal**: Users can edit title and description of existing todos

**Independent Test**: Edit todo title/description; verify changes persist

### Implementation for User Story 4

- [x] T052 [US4] Create PUT /api/todos/{id} endpoint with partial update in backend/app/routers/todos.py
- [x] T053 [US4] Add ownership check before update (return 403 if not owner) in todos.py
- [x] T054 [US4] Add edit mode toggle to todo-item.tsx with inline form
- [x] T055 [US4] Implement edit form with title and description fields in todo-item.tsx
- [x] T056 [US4] Add save and cancel buttons for edit mode in todo-item.tsx
- [x] T057 [US4] Add validation preventing empty title on save in todo-item.tsx
- [x] T058 [US4] Implement update API call and refresh list on success in todo-item.tsx

**Checkpoint**: User Story 4 complete - edit works; changes persist

---

## Phase 7: User Story 5 - Delete Todos (Priority: P5)

**Goal**: Users can delete todos they no longer need

**Independent Test**: Delete todo; verify it disappears and doesn't reappear on refresh

### Implementation for User Story 5

- [x] T059 [US5] Create DELETE /api/todos/{id} endpoint in backend/app/routers/todos.py
- [x] T060 [US5] Add ownership check before delete (return 403 if not owner) in todos.py
- [x] T061 [US5] Create delete confirmation dialog component in frontend/components/todos/delete-dialog.tsx
- [x] T062 [US5] Add delete button to todo-item.tsx that opens confirmation dialog
- [x] T063 [US5] Implement delete API call and remove from list on success in todo-item.tsx

**Checkpoint**: User Story 5 complete - delete works with confirmation; persists

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T064 [P] Add proper HTTP status codes to all API error responses in backend/app/routers/todos.py
- [x] T065 [P] Add GET /api/todos/{id} endpoint for single todo fetch in backend/app/routers/todos.py
- [x] T066 Add global error handling middleware in backend/app/main.py
- [x] T067 Add responsive design adjustments for mobile (320px+) across all frontend components
- [x] T068 Add loading states to all form submissions in frontend components
- [x] T069 Add error toast/message display for API failures in frontend
- [x] T070 Create backend/README.md with setup and run instructions
- [x] T071 Create frontend/README.md with setup and run instructions
- [ ] T072 Verify all success criteria from spec.md pass
- [ ] T073 Run end-to-end test: signup → create todos → toggle → edit → delete → signout → signin → verify persistence

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Phase 2 - Auth must work first
- **User Stories 2-5 (Phase 4-7)**: Depend on Phase 3 (auth required for API calls)
  - US2 can start after US1 complete
  - US3, US4, US5 can run in parallel after US2 (all need todos to exist)
- **Polish (Phase 8)**: Depends on all user stories complete

### User Story Dependencies

```
Phase 1 (Setup)
    │
    ▼
Phase 2 (Foundational)
    │
    ▼
Phase 3 (US1: Auth) ──────────────────┐
    │                                  │
    ▼                                  │
Phase 4 (US2: Create/View)            │
    │                                  │
    ├───────┬───────┬─────────────────┘
    ▼       ▼       ▼
Phase 5  Phase 6  Phase 7
(US3)    (US4)    (US5)
    │       │       │
    └───────┴───────┘
            │
            ▼
      Phase 8 (Polish)
```

### Parallel Opportunities

**Phase 1 (Setup)**:
```bash
# Can run in parallel:
T003 [P] Python requirements
T004 [P] Next.js init
T005 [P] Backend .env.example
T006 [P] Frontend .env.example
```

**Phase 2 (Foundational)**:
```bash
# Can run in parallel:
T011 [P] User model
T012 [P] Todo model
T022, T023, T024, T025 [P] UI components
```

**Phases 5, 6, 7 (US3, US4, US5)**:
```bash
# Can run in parallel after US2 is complete:
Phase 5 (Toggle)
Phase 6 (Edit)
Phase 7 (Delete)
```

---

## Implementation Strategy

### MVP First (User Stories 1-2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (Auth)
4. Complete Phase 4: User Story 2 (Create/View)
5. **STOP and VALIDATE**: Test signup → create todo → list todos
6. Deploy/demo if ready - this is a working MVP!

### Full Implementation

1. Complete MVP (Phases 1-4)
2. Add Phase 5: User Story 3 (Toggle)
3. Add Phase 6: User Story 4 (Edit)
4. Add Phase 7: User Story 5 (Delete)
5. Complete Phase 8: Polish
6. Final validation against all success criteria

### Recommended Team Strategy

With 2 developers after Phase 2:
- **Developer A**: Backend tasks (T036-T065 backend parts)
- **Developer B**: Frontend tasks (T039-T063 frontend parts)

Tasks can interleave once API contracts are established.

---

## Task Summary

| Phase | Description | Task Count | Parallelizable |
|-------|-------------|------------|----------------|
| Phase 1 | Setup | 8 | 4 |
| Phase 2 | Foundational | 17 | 6 |
| Phase 3 | US1: Auth | 10 | 0 |
| Phase 4 | US2: Create/View | 11 | 0 |
| Phase 5 | US3: Toggle | 5 | 0 |
| Phase 6 | US4: Edit | 7 | 0 |
| Phase 7 | US5: Delete | 5 | 0 |
| Phase 8 | Polish | 10 | 3 |
| **Total** | | **73** | **13** |

---

## Notes

- All tasks include specific file paths for agent execution
- [P] tasks can run in parallel within their phase
- [US#] label maps task to specific user story for traceability
- Each user story phase has a checkpoint for independent validation
- Tests not included as not explicitly requested - add if TDD approach desired
- Commit after each task or logical group for clean history
