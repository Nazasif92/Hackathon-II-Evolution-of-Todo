---
description: "Task list for Todo Console Application implementation"
---

# Tasks: todo-console-app

**Input**: Design documents from `/specs/todo-console-app/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths shown below assume single project - adjust based on plan.md structure

<!--
  ============================================================================
  IMPORTANT: The tasks below are SAMPLE TASKS for illustration purposes only.

  The /sp.tasks command MUST replace these with actual tasks based on:
  - User stories from spec.md (with their priorities P1, P2, P3...)
  - Feature requirements from plan.md
  - Entities from data-model.md
  - Endpoints from contracts/

  Tasks MUST be organized by user story so each story can be:
  - Implemented independently
  - Tested independently
  - Delivered as an MVP increment

  DO NOT keep these sample tasks in the generated tasks.md file.
  ============================================================================
-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project structure per implementation plan
- [ ] T002 Initialize Python project with proper directory structure (src/, tests/, etc.)
- [ ] T003 [P] Create main application entry point at src/cli/main.py
- [ ] T004 Create requirements.txt with Python version requirement

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Create Todo model class in src/models/todo.py with id, title, description, completed properties
- [ ] T006 Create TodoManager service in src/services/todo_manager.py with in-memory storage
- [ ] T007 Create basic CLI menu structure in src/cli/main.py
- [ ] T008 Set up error handling and validation utilities

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Add and View Todos (Priority: P1) 🎯 MVP

**Goal**: Allow users to add new todos and view all their todos

**Independent Test**: Can successfully add a todo with a title and view it in the list. The app delivers value by allowing users to store and retrieve basic task information.

### Tests for User Story 1 (OPTIONAL - only if tests requested) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T009 [P] [US1] Unit test for Todo model creation in tests/unit/test_todo.py
- [ ] T010 [P] [US1] Unit test for TodoManager add_todo functionality in tests/unit/test_todo_manager.py
- [ ] T011 [P] [US1] Unit test for TodoManager list_todos functionality in tests/unit/test_todo_manager.py

### Implementation for User Story 1

- [ ] T012 [P] [US1] Implement Todo model with validation in src/models/todo.py
- [ ] T013 [US1] Implement add_todo method in TodoManager service in src/services/todo_manager.py
- [ ] T014 [US1] Implement list_todos method in TodoManager service in src/services/todo_manager.py
- [ ] T015 [US1] Implement add todo CLI function in src/cli/main.py
- [ ] T016 [US1] Implement view todos CLI function in src/cli/main.py
- [ ] T017 [US1] Add menu option for adding and viewing todos in src/cli/main.py

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Update and Delete Todos (Priority: P2)

**Goal**: Allow users to update or delete their todos

**Independent Test**: Can update a todo's title or description by ID, or delete a todo by ID. The app delivers value by allowing users to maintain their task list.

### Tests for User Story 2 (OPTIONAL - only if tests requested) ⚠️

- [ ] T018 [P] [US2] Unit test for TodoManager update_todo functionality in tests/unit/test_todo_manager.py
- [ ] T019 [P] [US2] Unit test for TodoManager delete_todo functionality in tests/unit/test_todo_manager.py

### Implementation for User Story 2

- [ ] T020 [P] [US2] Implement update_todo method in TodoManager service in src/services/todo_manager.py
- [ ] T021 [P] [US2] Implement delete_todo method in TodoManager service in src/services/todo_manager.py
- [ ] T022 [US2] Implement update todo CLI function in src/cli/main.py
- [ ] T023 [US2] Implement delete todo CLI function in src/cli/main.py
- [ ] T024 [US2] Add menu options for updating and deleting todos in src/cli/main.py

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Mark Todos Complete/Incomplete (Priority: P3)

**Goal**: Allow users to mark their todos as complete or incomplete

**Independent Test**: Can mark a todo as complete or incomplete by ID. The app delivers value by allowing users to track which tasks have been completed.

### Tests for User Story 3 (OPTIONAL - only if tests requested) ⚠️

- [ ] T025 [P] [US3] Unit test for TodoManager mark_complete functionality in tests/unit/test_todo_manager.py
- [ ] T026 [P] [US3] Unit test for TodoManager mark_incomplete functionality in tests/unit/test_todo_manager.py

### Implementation for User Story 3

- [ ] T027 [P] [US3] Implement mark_complete method in TodoManager service in src/services/todo_manager.py
- [ ] T028 [P] [US3] Implement mark_incomplete method in TodoManager service in src/services/todo_manager.py
- [ ] T029 [US3] Implement mark todo as complete CLI function in src/cli/main.py
- [ ] T030 [US3] Implement mark todo as incomplete CLI function in src/cli/main.py
- [ ] T031 [US3] Add menu options for marking todos complete/incomplete in src/cli/main.py

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Error Handling and Edge Cases

**Goal**: Handle invalid inputs and edge cases gracefully

**Independent Test**: App handles invalid IDs, empty titles, and other edge cases with clear error messages.

- [ ] T032 [P] Add input validation for empty titles during creation
- [ ] T033 [P] Add error handling for invalid todo IDs in update/delete operations
- [ ] T034 [P] Add error handling for invalid menu choices
- [ ] T035 [P] Add error handling for when no todos exist to view
- [ ] T036 Add comprehensive error messages to all CLI functions

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T037 [P] Documentation updates in src/ with docstrings
- [ ] T038 Code cleanup and refactoring
- [ ] T039 Performance optimization for large numbers of todos
- [ ] T040 [P] Additional unit tests in tests/unit/
- [ ] T041 Run quickstart.md validation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Error Handling (Phase 6)**: Depends on all user stories being implemented
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (if tests requested):
Task: "Unit test for Todo model creation in tests/unit/test_todo.py"
Task: "Unit test for TodoManager add_todo functionality in tests/unit/test_todo_manager.py"
Task: "Unit test for TodoManager list_todos functionality in tests/unit/test_todo_manager.py"

# Launch all models for User Story 1 together:
Task: "Implement Todo model with validation in src/models/todo.py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [US1], [US2], [US3] labels map task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence