# Data Model: Todo Full-Stack Web Application

**Date**: 2026-01-12
**Branch**: `1-todo-fullstack-app`
**Source**: [spec.md](./spec.md) Key Entities section

## Entity Overview

The application has 2 core entities with a one-to-many relationship:

```
┌──────────────┐         ┌──────────────┐
│     User     │ 1     * │     Todo     │
│──────────────│─────────│──────────────│
│ id (PK)      │         │ id (PK)      │
│ email        │         │ user_id (FK) │
│ name         │         │ title        │
│ created_at   │         │ description  │
│              │         │ completed    │
│              │         │ created_at   │
│              │         │ updated_at   │
└──────────────┘         └──────────────┘
```

---

## Entity: User

**Purpose**: Represents a registered account holder who owns todos.

**Note**: User management is handled by Better Auth. The backend only needs to understand the user_id from JWT tokens. We may store minimal user data for reference but auth is delegated.

### Attributes

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID/String | PK, Auto-generated | Unique identifier (from Better Auth) |
| email | String | Unique, Not Null | User's email address |
| name | String | Nullable | Display name (optional) |
| created_at | DateTime | Not Null, Default Now | Account creation timestamp |

### Business Rules

- Email MUST be unique across all users
- Email format MUST be validated before storage
- User ID from JWT MUST match stored user ID for ownership checks

### SQLModel Definition (Backend)

```python
from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional
import uuid

class User(SQLModel, table=True):
    __tablename__ = "users"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    email: str = Field(unique=True, index=True, nullable=False)
    name: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

---

## Entity: Todo

**Purpose**: Represents a task item owned by a user.

### Attributes

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Integer | PK, Auto-increment | Unique identifier |
| user_id | String | FK → User.id, Not Null, Index | Owner reference |
| title | String | Not Null, Max 255 chars | Task title |
| description | String | Nullable, Max 1000 chars | Task details |
| completed | Boolean | Not Null, Default False | Completion status |
| created_at | DateTime | Not Null, Default Now | Creation timestamp |
| updated_at | DateTime | Not Null, Auto-update | Last modification |

### Business Rules

- Title MUST NOT be empty or whitespace-only
- Title MUST NOT exceed 255 characters
- Description MAY be empty
- Description MUST NOT exceed 1000 characters
- User can only access todos where user_id matches their ID
- Deleting a user SHOULD cascade delete their todos

### SQLModel Definition (Backend)

```python
from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional

class Todo(SQLModel, table=True):
    __tablename__ = "todos"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True, nullable=False)
    title: str = Field(max_length=255, nullable=False)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"onupdate": datetime.utcnow}
    )
```

---

## TypeScript Types (Frontend)

```typescript
// types/index.ts

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;  // ISO date string
}

export interface Todo {
  id: number;
  userId: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;  // ISO date string
  updatedAt: string;  // ISO date string
}

export interface CreateTodoInput {
  title: string;
  description?: string;
}

export interface UpdateTodoInput {
  title?: string;
  description?: string;
  completed?: boolean;
}
```

---

## Database Schema (SQL)

```sql
-- Users table (managed by Better Auth, but schema for reference)
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Todos table
CREATE TABLE todos (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster user-specific queries
CREATE INDEX idx_todos_user_id ON todos(user_id);

-- Trigger for auto-updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_todos_updated_at
    BEFORE UPDATE ON todos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

---

## State Transitions

### Todo Completion State

```
┌─────────────┐     toggle      ┌─────────────┐
│  Incomplete │ ◄─────────────► │  Complete   │
│ completed:  │                 │ completed:  │
│   false     │                 │   true      │
└─────────────┘                 └─────────────┘
```

- Initial state: Incomplete (completed = false)
- User can toggle between states at any time
- State change updates `updated_at` timestamp

### Todo Lifecycle

```
Created ──► Active ──► Deleted
              │
              ├──► Completed ──► Deleted
              │        │
              └────────┘ (toggle)
```

---

## Validation Rules Summary

| Entity | Field | Validation |
|--------|-------|------------|
| User | email | Valid email format, unique |
| User | name | Optional, max 255 chars |
| Todo | title | Required, 1-255 chars, not whitespace-only |
| Todo | description | Optional, max 1000 chars |
| Todo | completed | Boolean, default false |

---

## Relationships

| Relationship | Cardinality | Description |
|--------------|-------------|-------------|
| User → Todo | 1:N | One user has many todos |
| Todo → User | N:1 | Each todo belongs to exactly one user |

**Cascade Behavior**: When a user is deleted, all their todos are automatically deleted.
