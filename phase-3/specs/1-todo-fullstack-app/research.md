# Research: Todo Full-Stack Web Application

**Date**: 2026-01-12
**Branch**: `1-todo-fullstack-app`
**Purpose**: Resolve technical decisions and document best practices for implementation

## Research Summary

All technical decisions have been resolved. No blocking clarifications remain.

---

## 1. Better Auth + FastAPI JWT Integration

### Decision
Use Better Auth's JWT bearer token with a shared secret for cross-service authentication.

### Rationale
- Better Auth natively supports JWT issuance when configured
- FastAPI can verify JWTs using the same secret with `python-jose`
- Stateless authentication scales without session storage
- Industry standard approach for decoupled frontend/backend

### Alternatives Considered
- **Session-based auth**: Rejected - requires shared session store between Next.js and FastAPI
- **OAuth2 password flow**: Rejected - Better Auth handles this internally
- **Separate auth service**: Rejected - over-engineering for hackathon scope

### Implementation Notes
```
Frontend (Better Auth):
- Configure Better Auth with JWT plugin
- Set JWT secret via BETTER_AUTH_SECRET env var
- Token included in Authorization header automatically

Backend (FastAPI):
- Read same secret from JWT_SECRET env var
- Decode token using python-jose
- Extract user_id from token payload
- Dependency injection for protected routes
```

---

## 2. Neon Serverless PostgreSQL Connection

### Decision
Use SQLModel with async SQLAlchemy engine and connection pooling optimized for serverless.

### Rationale
- Neon requires special handling for serverless cold starts
- SQLModel provides Pydantic integration for type safety
- Async engine improves request throughput

### Alternatives Considered
- **Raw asyncpg**: Rejected - loses ORM benefits
- **Prisma**: Rejected - Python support is limited
- **Synchronous SQLAlchemy**: Rejected - blocks event loop

### Implementation Notes
```python
# database.py pattern
from sqlmodel import SQLModel, create_engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession

DATABASE_URL = os.getenv("DATABASE_URL")
# Replace postgres:// with postgresql+asyncpg://
async_url = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://")

engine = create_async_engine(
    async_url,
    pool_size=5,           # Limit for serverless
    max_overflow=10,
    pool_pre_ping=True,    # Handle stale connections
    pool_recycle=300       # Recycle every 5 minutes
)
```

---

## 3. Next.js App Router Structure

### Decision
Use App Router with route groups for auth and dashboard layouts.

### Rationale
- App Router is the modern Next.js standard
- Route groups enable different layouts per section
- Server Components reduce client bundle size
- Built-in loading and error states

### Alternatives Considered
- **Pages Router**: Rejected - legacy approach, constitution requires App Router
- **Single layout**: Rejected - auth pages need different layout than dashboard

### Implementation Notes
```
app/
├── (auth)/          # Route group - no 'auth' in URL
│   ├── layout.tsx   # Minimal layout, no nav
│   ├── signin/
│   └── signup/
├── (dashboard)/     # Route group - no 'dashboard' in URL
│   ├── layout.tsx   # Full layout with nav, auth check
│   └── todos/
└── api/auth/[...all]/  # Better Auth catch-all route
```

---

## 4. User Isolation Strategy

### Decision
Filter all todo queries by user_id extracted from JWT token.

### Rationale
- Simplest approach that guarantees isolation
- No complex row-level security needed
- Easy to test and verify

### Alternatives Considered
- **Database RLS (Row Level Security)**: Rejected - adds complexity, Neon supports it but overkill
- **Middleware tenant filtering**: Rejected - same as chosen but less explicit

### Implementation Notes
```python
# Every todo query includes user_id filter
async def get_todos(user_id: str, db: AsyncSession):
    result = await db.execute(
        select(Todo).where(Todo.user_id == user_id)
    )
    return result.scalars().all()

# Ownership check for mutations
async def get_todo_for_user(todo_id: int, user_id: str, db: AsyncSession):
    result = await db.execute(
        select(Todo).where(Todo.id == todo_id, Todo.user_id == user_id)
    )
    todo = result.scalar_one_or_none()
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    return todo
```

---

## 5. Error Handling Strategy

### Decision
Use consistent HTTP status codes with JSON error responses.

### Rationale
- RESTful conventions improve API predictability
- JSON errors enable frontend to display messages
- Constitution requires proper status codes

### Error Response Format
```json
{
  "detail": "Human-readable error message",
  "code": "ERROR_CODE"
}
```

### Status Code Mapping
| Scenario | Status Code | Code |
|----------|-------------|------|
| Invalid input | 400 | VALIDATION_ERROR |
| Not authenticated | 401 | UNAUTHORIZED |
| Not owner of resource | 403 | FORBIDDEN |
| Resource not found | 404 | NOT_FOUND |
| Server error | 500 | INTERNAL_ERROR |

---

## 6. Frontend State Management

### Decision
Use React hooks with fetch API; no external state library.

### Rationale
- App is simple CRUD with minimal shared state
- Server state managed per-request
- Reduces bundle size and complexity

### Alternatives Considered
- **Redux/Zustand**: Rejected - overkill for 2 entities
- **React Query/SWR**: Considered but not required - simple refetch patterns sufficient
- **Context API**: Used only for auth state

### Implementation Notes
```typescript
// Simple pattern for each page
const [todos, setTodos] = useState<Todo[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  fetchTodos()
    .then(setTodos)
    .catch(e => setError(e.message))
    .finally(() => setLoading(false));
}, []);
```

---

## 7. CORS Configuration

### Decision
Configure FastAPI CORS middleware to allow only the frontend origin.

### Rationale
- Security best practice - no wildcard origins
- Required for cross-origin requests from Next.js
- Environment-based configuration for flexibility

### Implementation Notes
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("CORS_ORIGINS", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)
```

---

## Research Status

| Topic | Status | Decision |
|-------|--------|----------|
| Auth integration | RESOLVED | Better Auth JWT + FastAPI verification |
| Database connection | RESOLVED | Async SQLModel with connection pooling |
| Project structure | RESOLVED | App Router with route groups |
| User isolation | RESOLVED | Query-level user_id filtering |
| Error handling | RESOLVED | JSON responses with HTTP status codes |
| State management | RESOLVED | React hooks, no external library |
| CORS | RESOLVED | Explicit origin allowlist |

**All research complete. Ready for Phase 1 design artifacts.**
