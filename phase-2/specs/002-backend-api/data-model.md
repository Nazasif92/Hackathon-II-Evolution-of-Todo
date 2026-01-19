# Data Model: Backend REST API

**Feature**: 002-backend-api
**Created**: 2026-01-12
**Status**: Complete

## Entity Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Todo                                │
├─────────────────────────────────────────────────────────────┤
│ id: int (PK, auto-increment)                               │
│ user_id: str (required, indexed)                           │
│ title: str (required, max 200 chars)                       │
│ description: str | null (optional, max 1000 chars)         │
│ completed: bool (default: false)                           │
│ created_at: datetime (auto-generated)                      │
│ updated_at: datetime (auto-updated)                        │
└─────────────────────────────────────────────────────────────┘
```

## Entity Definitions

### Todo Entity

**Purpose**: Represents a todo item belonging to an authenticated user.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Integer | Primary Key, Auto-increment | Unique identifier |
| user_id | String | Required, Indexed | Owner reference from JWT "sub" claim |
| title | String(200) | Required, Non-empty | Task title |
| description | String(1000) | Optional, Nullable | Task description |
| completed | Boolean | Default: false | Completion status |
| created_at | DateTime | Auto-generated, UTC | Creation timestamp |
| updated_at | DateTime | Auto-updated, UTC | Last modification timestamp |

### Validation Rules

**Title**:
- Required (cannot be null or empty)
- Maximum 200 characters
- Leading/trailing whitespace trimmed
- Fails validation with HTTP 422 if empty after trim

**Description**:
- Optional (can be null)
- Maximum 1000 characters
- Empty string treated as null

**Completed**:
- Boolean only (true/false)
- Defaults to false on creation
- Toggle endpoint inverts current value

### State Transitions

```
┌──────────────┐     toggle()     ┌──────────────┐
│  completed   │ ◄──────────────► │  incomplete  │
│  (true)      │                  │  (false)     │
└──────────────┘                  └──────────────┘
       │                                 │
       │          delete()               │
       └─────────────┬───────────────────┘
                     ▼
               ┌───────────┐
               │  DELETED  │
               └───────────┘
```

## API Schema Definitions

### Input Schemas

**CreateTodoInput**
```
{
  "title": string (required),
  "description": string | null (optional)
}
```

**UpdateTodoInput**
```
{
  "title": string | null (optional),
  "description": string | null (optional),
  "completed": boolean | null (optional)
}
```

### Output Schemas

**TodoResponse**
```
{
  "id": integer,
  "userId": string,
  "title": string,
  "description": string | null,
  "completed": boolean,
  "createdAt": string (ISO 8601),
  "updatedAt": string (ISO 8601)
}
```

**ErrorResponse**
```
{
  "detail": string,
  "code": string | null (optional)
}
```

## Database Indexes

| Index Name | Fields | Purpose |
|------------|--------|---------|
| pk_todo | id | Primary key lookup |
| ix_todo_user_id | user_id | Filter todos by user |
| ix_todo_user_created | user_id, created_at DESC | List user todos sorted by date |

## Data Integrity Rules

1. **User Isolation**: All queries MUST include `WHERE user_id = ?` clause
2. **Ownership Check**: Before UPDATE/DELETE, verify `todo.user_id == current_user.user_id`
3. **Cascade**: No cascading deletes (user_id is reference, not FK to users table)
4. **Timestamps**: `updated_at` auto-updates on any field change
