# Data Model: Todo AI Chatbot

**Date**: 2026-02-04
**Feature**: 004-todo-ai-chatbot

---

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────────┐       ┌─────────────┐
│    User     │       │  Conversation   │       │   Message   │
├─────────────┤       ├─────────────────┤       ├─────────────┤
│ id (PK)     │──1:N──│ id (PK)         │──1:N──│ id (PK)     │
│ email       │       │ user_id (FK)    │       │ conv_id(FK) │
│ name        │       │ created_at      │       │ user_id(FK) │
│ created_at  │       │ updated_at      │       │ role        │
└─────────────┘       └─────────────────┘       │ content     │
       │                                        │ created_at  │
       │                                        └─────────────┘
       │
       │              ┌─────────────────┐
       └───────1:N────│     Task        │
                      ├─────────────────┤
                      │ id (PK)         │
                      │ user_id (FK)    │
                      │ title           │
                      │ description     │
                      │ completed       │
                      │ created_at      │
                      │ updated_at      │
                      └─────────────────┘
```

---

## Existing Entities (from Phase 2)

### User

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email address |
| name | VARCHAR(100) | NOT NULL | Display name |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Account creation time |

### Task

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-increment identifier |
| user_id | UUID | FOREIGN KEY → users.id, NOT NULL | Owner reference |
| title | VARCHAR(200) | NOT NULL | Task title (max 200 chars) |
| description | TEXT | NULLABLE | Optional description |
| completed | BOOLEAN | NOT NULL, DEFAULT FALSE | Completion status |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update time |

**Indexes**:
- `idx_tasks_user_id` on (user_id)
- `idx_tasks_user_completed` on (user_id, completed)

---

## New Entities (Phase 3)

### Conversation

Represents a chat session between a user and the AI assistant.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique identifier |
| user_id | UUID | FOREIGN KEY → users.id, NOT NULL | Owner reference |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Session start time |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last activity time |

**Indexes**:
- `idx_conversations_user_id` on (user_id)
- `idx_conversations_user_updated` on (user_id, updated_at DESC)

**Cascade Rules**:
- ON DELETE of User → CASCADE delete Conversations

**SQLModel Definition**:
```python
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from uuid import UUID, uuid4

class Conversation(SQLModel, table=True):
    __tablename__ = "conversations"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", nullable=False, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relationships
    messages: list["Message"] = Relationship(back_populates="conversation")
```

---

### Message

Represents a single message in a conversation (user or assistant).

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique identifier |
| conversation_id | UUID | FOREIGN KEY → conversations.id, NOT NULL | Parent conversation |
| user_id | UUID | FOREIGN KEY → users.id, NOT NULL | Message author context |
| role | VARCHAR(20) | NOT NULL, CHECK IN ('user', 'assistant') | Message sender role |
| content | TEXT | NOT NULL | Message content |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Message timestamp |

**Indexes**:
- `idx_messages_conversation_id` on (conversation_id)
- `idx_messages_conversation_created` on (conversation_id, created_at)

**Cascade Rules**:
- ON DELETE of Conversation → CASCADE delete Messages

**SQLModel Definition**:
```python
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from uuid import UUID, uuid4
from enum import Enum

class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"

class Message(SQLModel, table=True):
    __tablename__ = "messages"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    conversation_id: UUID = Field(foreign_key="conversations.id", nullable=False, index=True)
    user_id: UUID = Field(foreign_key="users.id", nullable=False)
    role: MessageRole = Field(nullable=False)
    content: str = Field(nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relationships
    conversation: "Conversation" = Relationship(back_populates="messages")
```

---

## Validation Rules

### Conversation

| Rule | Validation |
|------|------------|
| user_id required | Must reference existing user |
| timestamps auto-set | created_at and updated_at default to NOW() |

### Message

| Rule | Validation |
|------|------------|
| conversation_id required | Must reference existing conversation |
| user_id required | Must match conversation owner |
| role required | Must be 'user' or 'assistant' |
| content required | Cannot be empty string |
| content max length | 10,000 characters (reasonable limit) |

### Task (extended validation for MCP tools)

| Rule | Validation |
|------|------------|
| title required | Cannot be empty |
| title max length | 200 characters |
| description max length | 5,000 characters |
| user_id match | Operation user must match task owner |

---

## State Transitions

### Conversation Lifecycle

```
Created → Active → (no explicit closed state)
         ↓
      Updated (on each new message)
```

### Message Lifecycle

```
(none) → Created (immutable after creation)
```

Messages are append-only; no updates or soft deletes.

### Task Lifecycle (existing)

```
Created → Active ←→ Completed
           ↓
        Deleted
```

---

## Query Patterns

### Get User's Recent Conversations

```sql
SELECT * FROM conversations
WHERE user_id = :user_id
ORDER BY updated_at DESC
LIMIT 10;
```

### Get Conversation Messages (with pagination)

```sql
SELECT * FROM messages
WHERE conversation_id = :conversation_id
ORDER BY created_at ASC
LIMIT 20;
```

### Get Last N Messages for Context

```sql
SELECT * FROM messages
WHERE conversation_id = :conversation_id
ORDER BY created_at DESC
LIMIT :limit;
-- Reverse in application for chronological order
```

### Get User's Tasks (for MCP tools)

```sql
-- All tasks
SELECT * FROM tasks WHERE user_id = :user_id ORDER BY created_at DESC;

-- Pending only
SELECT * FROM tasks WHERE user_id = :user_id AND completed = FALSE;

-- Completed only
SELECT * FROM tasks WHERE user_id = :user_id AND completed = TRUE;
```

---

## Migration Strategy

### Migration: Add Conversation and Message Tables

```sql
-- Migration: 004_add_chat_tables.sql

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create conversations table
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for conversations
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_user_updated ON conversations(user_id, updated_at DESC);

-- Create messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for messages
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at);

-- Update function for conversations.updated_at
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations SET updated_at = NOW() WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update conversation timestamp on new message
CREATE TRIGGER trigger_update_conversation_timestamp
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_timestamp();
```

### Rollback Migration

```sql
-- Rollback: 004_add_chat_tables.sql

DROP TRIGGER IF EXISTS trigger_update_conversation_timestamp ON messages;
DROP FUNCTION IF EXISTS update_conversation_timestamp();
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS conversations;
```

---

## Performance Considerations

| Concern | Mitigation |
|---------|------------|
| Large conversation history | Limit context to 20 messages |
| Frequent message inserts | Batch if needed; use connection pool |
| Index maintenance | Indexes on FK columns for join performance |
| UUID generation | Use database-side uuid_generate_v4() |
| Cascade deletes | Handled by FK constraints, not application |

---

## Data Volume Estimates

| Entity | Estimate | Rationale |
|--------|----------|-----------|
| Users | 100 | Initial target concurrent users |
| Tasks per user | 50 | Average based on assumptions |
| Conversations per user | 5 | Multiple chat sessions |
| Messages per conversation | 50 | ~25 exchanges average |
| Total messages | 25,000 | 100 × 5 × 50 |

Storage: ~5MB for messages (assuming 200 bytes avg per message)
