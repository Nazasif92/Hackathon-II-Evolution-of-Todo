# Feature Specification: Backend REST API for Todo Application

**Feature Branch**: `002-backend-api`
**Created**: 2026-01-12
**Status**: Draft
**Input**: Spec-2: Backend & REST API (Todo Full-Stack Web Application)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Retrieve All Tasks for Authenticated User (Priority: P1)

As a backend API consumer, I need to fetch all tasks that belong to an authenticated user so that I can display them in the frontend application.

**Why this priority**: Retrieving tasks is the foundation of any todo application. Without this capability, users cannot view their work, making all other features unusable.

**Independent Test**: Can be fully tested by making an authenticated GET request to the API and verifying that only the requesting user's tasks are returned in the correct JSON format.

**Acceptance Scenarios**:

1. **Given** a user is authenticated with a valid JWT token, **When** they request all tasks via GET endpoint, **Then** the API returns HTTP 200 with a JSON array of their tasks
2. **Given** a user is not authenticated, **When** they request all tasks, **Then** the API returns HTTP 401 Unauthorized with error message
3. **Given** a user has no tasks, **When** they request their task list, **Then** the API returns HTTP 200 with an empty array

---

### User Story 2 - Create New Task (Priority: P1)

As a backend API consumer, I need to create new tasks for authenticated users so that they can add items to their todo list.

**Why this priority**: Task creation is essential functionality. Users must be able to add new tasks immediately after the retrieval feature works.

**Independent Test**: Can be fully tested by sending a POST request with task data and verifying that the task is created, assigned to the correct user, and persisted in the database.

**Acceptance Scenarios**:

1. **Given** a user is authenticated, **When** they send valid task data (title required, description optional), **Then** the API returns HTTP 201 Created with the new task object including its generated ID
2. **Given** a user sends invalid task data (empty title), **When** the request is processed, **Then** the API returns HTTP 422 Unprocessable Entity with validation errors
3. **Given** a user creates a task, **When** they retrieve their task list, **Then** the newly created task appears in the response

---

### User Story 3 - Toggle Task Completion Status (Priority: P1)

As a backend API consumer, I need to toggle the completion status of a task so that users can mark tasks as done or undone.

**Why this priority**: Toggling task completion is the primary interaction in a todo application. This should be implemented alongside create functionality.

**Independent Test**: Can be fully tested by sending a PATCH request to toggle a task and verifying the completion status changes persist.

**Acceptance Scenarios**:

1. **Given** a task with completed=false exists, **When** the user toggles completion, **Then** the API returns HTTP 200 with completed=true
2. **Given** a task with completed=true exists, **When** the user toggles completion, **Then** the API returns HTTP 200 with completed=false
3. **Given** a user attempts to toggle another user's task, **When** the request is processed, **Then** the API returns HTTP 403 Forbidden

---

### User Story 4 - Update Task Details (Priority: P2)

As a backend API consumer, I need to update existing task details so that users can modify task title and description.

**Why this priority**: Updating task details is secondary to toggle but important for full task management capability.

**Independent Test**: Can be fully tested by sending a PUT request to update a task and verifying the changes persist in subsequent GET requests.

**Acceptance Scenarios**:

1. **Given** a task exists for an authenticated user, **When** they update the task with new title/description, **Then** the API returns HTTP 200 OK with the updated task object
2. **Given** a user attempts to update a task that doesn't exist, **When** the request is processed, **Then** the API returns HTTP 404 Not Found
3. **Given** a user attempts to update another user's task, **When** the request is processed, **Then** the API returns HTTP 403 Forbidden

---

### User Story 5 - Delete Task (Priority: P2)

As a backend API consumer, I need to delete tasks so that users can remove completed or unwanted items from their list.

**Why this priority**: Task deletion is part of full CRUD operations but secondary to core create/read/toggle functionality.

**Independent Test**: Can be fully tested by sending a DELETE request and verifying the task is removed and no longer appears in list requests.

**Acceptance Scenarios**:

1. **Given** a task exists for an authenticated user, **When** they delete the task, **Then** the API returns HTTP 204 No Content
2. **Given** a user attempts to delete a task that doesn't exist, **When** the request is processed, **Then** the API returns HTTP 404 Not Found
3. **Given** a task is deleted, **When** the user retrieves their task list, **Then** the deleted task no longer appears

---

### User Story 6 - Get Single Task (Priority: P3)

As a backend API consumer, I need to retrieve a specific task by ID so that I can display detailed information about a single task.

**Why this priority**: While useful for detailed views, this is tertiary to list and core CRUD operations.

**Independent Test**: Can be fully tested by requesting a specific task by ID and verifying the correct task object is returned.

**Acceptance Scenarios**:

1. **Given** a task exists for an authenticated user, **When** they request the task by ID, **Then** the API returns HTTP 200 OK with the complete task object
2. **Given** a user requests a task ID that doesn't exist, **When** the request is processed, **Then** the API returns HTTP 404 Not Found
3. **Given** a user requests another user's task, **When** the request is processed, **Then** the API returns HTTP 403 Forbidden

---

### Edge Cases

- What happens when a task title exceeds maximum length? System returns HTTP 422 with validation error
- What happens when request body is malformed JSON? System returns HTTP 400 Bad Request
- How does system handle database connection failures? System returns HTTP 503 Service Unavailable with appropriate error message
- What happens when JWT token is expired? System returns HTTP 401 Unauthorized
- What happens when JWT token is malformed? System returns HTTP 401 Unauthorized
- What happens when task ID is non-numeric? System returns HTTP 422 Unprocessable Entity

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a GET endpoint to retrieve all tasks for an authenticated user
- **FR-002**: System MUST provide a POST endpoint to create a new task for an authenticated user
- **FR-003**: System MUST provide a GET endpoint to retrieve a single task by ID
- **FR-004**: System MUST provide a PUT endpoint to update an existing task
- **FR-005**: System MUST provide a PATCH endpoint to toggle task completion status
- **FR-006**: System MUST provide a DELETE endpoint to remove a task
- **FR-007**: System MUST validate JWT tokens on all task endpoints before processing requests
- **FR-008**: System MUST filter tasks by user ID to ensure users only access their own data
- **FR-009**: System MUST return 403 Forbidden when users attempt to access other users' tasks
- **FR-010**: System MUST persist all task data to the database
- **FR-011**: System MUST validate task input (title required, max 200 characters; description optional, max 1000 characters)
- **FR-012**: System MUST return consistent JSON response structure for all endpoints
- **FR-013**: System MUST return appropriate HTTP status codes for all operations
- **FR-014**: System MUST handle database errors gracefully without exposing internal details
- **FR-015**: System MUST support async request handling for all endpoints

### Key Entities

- **Task**: Represents a todo item. Attributes: unique identifier, title (required), description (optional), completion status (boolean), owner reference, creation timestamp, last update timestamp
- **User Reference**: Links tasks to their owner. Used for data isolation and authorization checks

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 6 API endpoints (GET all, GET single, POST, PUT, PATCH toggle, DELETE) respond successfully to valid requests
- **SC-002**: API returns correct HTTP status codes for all operation types (200, 201, 204, 400, 401, 403, 404, 422, 500, 503)
- **SC-003**: Task data persists across requests - created tasks appear in subsequent GET requests
- **SC-004**: User isolation works correctly - users cannot access, modify, or delete other users' tasks
- **SC-005**: Input validation rejects invalid data with clear error messages
- **SC-006**: All API responses follow consistent JSON structure with appropriate fields
- **SC-007**: System handles edge cases gracefully without crashing or exposing internal errors
- **SC-008**: Toggle endpoint correctly inverts completion status on each call

## Assumptions

- JWT authentication is already implemented in the frontend and provides valid tokens
- JWT tokens contain user ID in the "sub" claim for user identification
- Database schema and connection are configured via environment variables
- Frontend handles token management and includes Authorization header in requests
- Task IDs are auto-generated integers by the database
