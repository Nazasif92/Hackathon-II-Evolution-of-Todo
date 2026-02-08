# Research Document: Backend REST API

**Feature**: 002-backend-api
**Created**: 2026-01-12
**Status**: Complete

## Technical Decisions

### Decision 1: FastAPI Async Configuration

**Decision**: Use FastAPI with async SQLAlchemy engine for all database operations

**Rationale**:
- Neon Serverless PostgreSQL benefits from async connections to handle connection pooling efficiently
- FastAPI's native async support provides optimal performance for I/O-bound operations
- SQLModel integrates seamlessly with async SQLAlchemy engine

**Alternatives Considered**:
- Sync SQLAlchemy: Simpler but blocks event loop, poor performance with serverless DB
- Raw asyncpg: Better performance but loses ORM benefits and type safety

### Decision 2: JWT Token Verification Pattern

**Decision**: Use FastAPI dependency injection with `Depends()` for JWT verification

**Rationale**:
- Centralizes authentication logic in a single reusable dependency
- Automatically applies to all protected routes via dependency injection
- Returns decoded user information for use in route handlers
- Clean separation between auth logic and business logic

**Alternatives Considered**:
- Middleware-based auth: Applies globally but harder to exclude public routes
- Decorator-based: More verbose, requires repeating logic per route

### Decision 3: Database Connection Pooling

**Decision**: Configure SQLAlchemy async engine with connection pooling optimized for serverless

**Rationale**:
- Neon Serverless has connection limits that require careful pool management
- Settings: pool_size=5, max_overflow=10, pool_pre_ping=True, pool_recycle=300
- pool_pre_ping ensures stale connections are detected before use
- pool_recycle prevents connections from becoming stale

**Alternatives Considered**:
- No pooling: Creates new connection per request, high latency
- Large pool: Exceeds Neon free tier connection limits

### Decision 4: API Route Structure

**Decision**: Use `/api/todos` prefix with JWT-based user identification (not URL-based user_id)

**Rationale**:
- User ID extracted from JWT token "sub" claim, not from URL
- Prevents user enumeration attacks (can't guess other user IDs in URL)
- Simpler API surface: `/api/todos` instead of `/api/{user_id}/todos`
- Authorization handled by comparing token user_id with resource owner

**Alternatives Considered**:
- URL-based user_id: Exposes user IDs, requires additional validation
- Session-based auth: Doesn't align with JWT requirement

### Decision 5: Error Response Format

**Decision**: Standardized JSON error responses with `detail` and optional `code` fields

**Rationale**:
- Follows FastAPI's default HTTPException format for consistency
- Frontend can parse predictable structure
- Includes error code for programmatic handling

**Format**:
```json
{
  "detail": "Human-readable error message",
  "code": "OPTIONAL_ERROR_CODE"
}
```

**Alternatives Considered**:
- Custom error format: Requires more code, less compatibility with FastAPI defaults
- RFC 7807 Problem Details: More complex than needed for this application

### Decision 6: SQLModel Schema Design

**Decision**: Use SQLModel with `table=True` for database models and separate Pydantic models for API schemas

**Rationale**:
- SQLModel table models define database schema and ORM operations
- Separate input/output schemas (CreateTodoInput, UpdateTodoInput, TodoResponse) for API validation
- Prevents exposing internal fields (like user_id in create requests)
- Clear separation between database models and API contracts

**Alternatives Considered**:
- Single model for all: Exposes internal fields, less control over validation
- Pure Pydantic + SQLAlchemy: Loses SQLModel's type integration benefits

### Decision 7: Toggle vs PUT for Completion Status

**Decision**: Implement dedicated PATCH `/api/todos/{id}/toggle` endpoint

**Rationale**:
- Single-purpose endpoint is more semantic and RESTful for this action
- Prevents accidental field overwrites from PUT operations
- Simpler frontend integration (no need to send current state)
- Atomic operation ensures consistent state transitions

**Alternatives Considered**:
- PUT only: Requires sending full object, risk of race conditions
- PATCH with completed field: More flexible but less semantic

## Technology Best Practices Applied

### FastAPI Best Practices

- Use Pydantic models for request/response validation
- Leverage dependency injection for cross-cutting concerns
- Use async/await for all I/O operations
- Configure CORS properly for frontend access
- Use lifespan context manager for startup/shutdown

### SQLModel Best Practices

- Define table models with explicit `table=True`
- Use Optional[] for nullable fields
- Configure relationships with proper foreign keys
- Use model_validate() for ORM object to Pydantic conversion

### Neon PostgreSQL Best Practices

- Enable SSL for all connections
- Configure connection pooling for serverless
- Use environment variables for connection strings
- Handle connection errors gracefully

## Unresolved Items

None - all technical decisions have been made based on constitution requirements and spec constraints.
