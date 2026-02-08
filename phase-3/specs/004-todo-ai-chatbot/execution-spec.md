# Execution Specification: Todo AI Chatbot

**Feature**: 004-todo-ai-chatbot
**Date**: 2026-02-05
**Type**: Execution Plan + Automation Workflow
**Status**: Implementation Complete, Testing & Deployment Pending

---

## Executive Summary

This document provides a complete execution specification for the Todo AI Chatbot system, defining automation pipelines, Claude Code workflows, testing strategies, and deployment procedures. All implementation follows the agent-driven, fully-automated approach using the Agentic Dev Stack.

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Specification | SpecKitPlus | Feature specs, plans, tasks |
| Automation | Claude Code | Code generation, implementation |
| Backend | Python FastAPI | API server |
| ORM | SQLModel | Database models |
| Database | Neon PostgreSQL | Serverless data storage |
| Auth | Better Auth + JWT | User authentication |
| AI | OpenAI Agents SDK | Natural language processing |
| Tools | MCP Architecture | Tool definitions and execution |
| Frontend | Next.js + React | Chat UI |
| Testing | pytest + Playwright | Unit, integration, e2e tests |

---

## Phase Structure Overview

```
Phase 1: Scaffolding ──────────────────────────────────────┐
         ↓                                                  │
Phase 2: Database + Auth ──────────────────────────────────┤
         ↓                                                  │
Phase 3: MCP Server + Tools ───────────┐                   │
         ↓                             │ Parallel          │
Phase 4: AI Agent ─────────────────────┤ Frontend          │
         ↓                             │ (with mocks)      │
Phase 5: Chat API ─────────────────────┘                   │
         ↓                                                  │
Phase 6: Frontend UI ──────────────────────────────────────┘
         ↓
Phase 7: Testing + QA
         ↓
Phase 8: Deployment + Production
```

---

## Phase 1: Project Initialization & Scaffolding

### Technical Goals
- Extend existing project structure for chat feature
- Add new dependencies (openai, mcp SDK, @ai-sdk/react)
- Configure environment variables

### System Components
- `backend/mcp/` - MCP server directory
- `backend/agents/` - AI agent directory
- `backend/app/services/` - Service layer
- `backend/app/schemas/` - Pydantic schemas
- `frontend/components/chat/` - Chat UI components
- `frontend/app/(dashboard)/chat/` - Chat page

### Input Dependencies
- Existing Phase 2 infrastructure (Todo app, Better Auth, Neon DB)
- Node.js 18+, Python 3.11+

### Output Deliverables
- Directory structure created
- Dependencies installed
- Environment templates updated

### Claude Code Automation Prompts

```yaml
prompt_chain:
  - id: scaffold_backend
    agent: fastapi-backend
    prompt: |
      Create the following directory structure in backend/:
      - mcp/__init__.py
      - mcp/tools/__init__.py
      - agents/__init__.py
      - app/services/__init__.py (if not exists)
      - app/schemas/__init__.py (if not exists)

  - id: scaffold_frontend
    agent: frontend-nextjs
    prompt: |
      Create the following directories in frontend/:
      - app/(dashboard)/chat/
      - components/chat/
      - lib/chat-api.ts (placeholder)

  - id: update_dependencies
    agent: fastapi-backend
    prompt: |
      Update backend/requirements.txt with:
      openai>=1.0.0
      mcp>=0.1.0

  - id: update_frontend_deps
    agent: frontend-nextjs
    prompt: |
      Add @ai-sdk/react to frontend/package.json
```

### Validation Checkpoints
- [ ] All directories exist
- [ ] `pip install -r requirements.txt` succeeds
- [ ] `npm install` succeeds
- [ ] Existing functionality unaffected

### Acceptance Criteria
- Directory structure matches plan.md specification
- No import errors when running servers
- Existing todo endpoints still work

### Failure Recovery
| Issue | Recovery Action |
|-------|-----------------|
| Dependency conflict | Pin specific versions, check compatibility |
| Directory already exists | Skip creation, verify contents |
| npm/pip failure | Clear cache, retry with verbose logging |

---

## Phase 2: Database + ORM + Auth Foundation

### Technical Goals
- Add Conversation and Message models
- Configure SQLModel relationships
- Ensure proper foreign keys and indexes

### System Components
- `backend/app/models/conversation.py` - Conversation SQLModel
- `backend/app/models/message.py` - Message SQLModel + MessageRole enum
- `backend/app/models/__init__.py` - Model exports

### Input Dependencies
- Existing User model from Better Auth
- Neon PostgreSQL connection

### Output Deliverables
- Conversation model with user_id FK
- Message model with conversation_id FK
- MessageRole enum (user, assistant)
- Auto-create tables on startup

### Claude Code Automation Prompts

```yaml
prompt_chain:
  - id: create_conversation_model
    agent: neon-database-architect
    prompt: |
      Create backend/app/models/conversation.py with SQLModel:
      - id: UUID primary key
      - user_id: str (Better Auth user reference)
      - created_at: datetime
      - updated_at: datetime
      - Relationship to messages
      Reference: specs/004-todo-ai-chatbot/data-model.md

  - id: create_message_model
    agent: neon-database-architect
    prompt: |
      Create backend/app/models/message.py with:
      - MessageRole enum (user, assistant)
      - Message SQLModel:
        - id: UUID primary key
        - conversation_id: FK to conversations
        - user_id: str
        - role: MessageRole
        - content: str (max 10000)
        - created_at: datetime
      Reference: specs/004-todo-ai-chatbot/data-model.md

  - id: update_model_exports
    agent: fastapi-backend
    prompt: |
      Update backend/app/models/__init__.py to export:
      Conversation, Message, MessageRole
```

### Validation Checkpoints
- [ ] Models import without errors
- [ ] Foreign key relationships defined
- [ ] Tables created on app startup
- [ ] Cascade delete works (user → conversations → messages)

### Acceptance Criteria
- Can create conversation for authenticated user
- Can add messages to conversation
- Messages ordered by created_at
- User deletion cascades to conversations

### Failure Recovery
| Issue | Recovery Action |
|-------|-----------------|
| FK constraint error | Verify user table exists, check column types |
| Import cycle | Use TYPE_CHECKING for forward references |
| Table not created | Check model imports in main.py |

---

## Phase 3: MCP Server + Tools

### Technical Goals
- Implement MCP Server with tool registry
- Create 5 task operation tools
- Enforce user isolation in all operations

### System Components
- `backend/mcp/server.py` - MCP Server class
- `backend/mcp/tools/add_task.py`
- `backend/mcp/tools/list_tasks.py`
- `backend/mcp/tools/complete_task.py`
- `backend/mcp/tools/delete_task.py`
- `backend/mcp/tools/update_task.py`

### Input Dependencies
- Todo model from existing app
- Database session management

### Output Deliverables
- MCPServer class with tool registration
- 5 fully-functional tools
- Tool definitions for OpenAI function calling

### Claude Code Automation Prompts

```yaml
prompt_chain:
  - id: create_mcp_server
    agent: fastapi-backend
    prompt: |
      Create backend/mcp/server.py implementing MCPServer class:
      - Tool registry dictionary
      - Tool definitions for OpenAI function calling format
      - invoke_tool(name, session, user_id, arguments) method
      - Wrapper methods for each tool
      Reference: specs/004-todo-ai-chatbot/contracts/mcp-tools.json

  - id: create_add_task_tool
    agent: fastapi-backend
    parallel: true
    prompt: |
      Create backend/mcp/tools/add_task.py:
      - Input: session, user_id, title, description (optional)
      - Validate title (required, max 200 chars)
      - Create task in database
      - Return task object or error
      - ALWAYS filter by user_id

  - id: create_list_tasks_tool
    agent: fastapi-backend
    parallel: true
    prompt: |
      Create backend/mcp/tools/list_tasks.py:
      - Input: session, user_id, status (all/pending/completed)
      - Query tasks filtered by user_id
      - Apply status filter
      - Return tasks array with count

  - id: create_complete_task_tool
    agent: fastapi-backend
    parallel: true
    prompt: |
      Create backend/mcp/tools/complete_task.py:
      - Input: session, user_id, task_id
      - Verify task exists AND belongs to user
      - Mark task as completed
      - Return "Task not found" for other users' tasks

  - id: create_delete_task_tool
    agent: fastapi-backend
    parallel: true
    prompt: |
      Create backend/mcp/tools/delete_task.py:
      - Input: session, user_id, task_id
      - Verify task exists AND belongs to user
      - Delete task permanently
      - Return deleted task info

  - id: create_update_task_tool
    agent: fastapi-backend
    parallel: true
    prompt: |
      Create backend/mcp/tools/update_task.py:
      - Input: session, user_id, task_id, title?, description?
      - At least one field required
      - Verify task belongs to user
      - Update and return task
```

### Validation Checkpoints
- [ ] Each tool callable independently
- [ ] User isolation enforced (User A cannot access User B's tasks)
- [ ] Error responses follow consistent format
- [ ] Response latency < 100ms

### Acceptance Criteria
- All 5 tools pass unit tests
- Invalid user_id returns proper error
- Non-existent task_id returns "Task not found"
- Tool outputs match mcp-tools.json schema

### Failure Recovery
| Issue | Recovery Action |
|-------|-----------------|
| Tool invocation error | Log error, return graceful message |
| Database timeout | Implement retry with backoff |
| User isolation breach | Add explicit user_id WHERE clause |

---

## Phase 4: AI Agent Implementation

### Technical Goals
- Implement OpenAI Agent with tool calling
- Configure system prompt for task management
- Handle conversation context (20 message limit)

### System Components
- `backend/agents/prompts.py` - System prompt definitions
- `backend/agents/todo_agent.py` - TodoAgent class
- `backend/agents/__init__.py` - Exports

### Input Dependencies
- MCP tools from Phase 3
- OpenAI API key

### Output Deliverables
- TodoAgent class with run() method
- System prompt for task management
- Tool registration with OpenAI format
- Context window management

### Claude Code Automation Prompts

```yaml
prompt_chain:
  - id: create_system_prompt
    agent: fastapi-backend
    prompt: |
      Create backend/agents/prompts.py with:
      - SYSTEM_PROMPT: Role as task management assistant
        - Capabilities: add, list, complete, delete, update
        - Behavior: confirm actions, ask for clarification
        - Constraints: never expose internals, verify ownership
      - CONTEXT_WINDOW_LIMIT = 20
      - INTENT_PATTERNS dictionary for logging

  - id: create_todo_agent
    agent: fastapi-backend
    prompt: |
      Create backend/agents/todo_agent.py with TodoAgent class:
      - __init__(api_key, model="gpt-4o-mini")
      - _build_tools() from MCP tool definitions
      - run(session, user_id, message, conversation_history)
        - Build messages with system prompt
        - Call OpenAI with tools
        - Process tool calls in loop
        - Track affected tasks
        - Return response, tool_calls, tasks_affected
      Reference: specs/004-todo-ai-chatbot/plan.md Phase 4
```

### Validation Checkpoints
- [ ] Agent correctly identifies intent for standard phrases
- [ ] Agent chains tools when needed (e.g., "delete all completed")
- [ ] Agent asks for clarification on ambiguous requests
- [ ] Agent never exposes system internals

### Acceptance Criteria
- 90% intent accuracy on test phrases
- Tool chaining works for multi-step requests
- Graceful handling of unrecognized intents
- Response time < 3s for simple requests

### Failure Recovery
| Issue | Recovery Action |
|-------|-----------------|
| OpenAI API error | Retry with exponential backoff |
| Tool call failure | Return graceful error message |
| Context overflow | Truncate to 20 most recent messages |
| Hallucination | Validate tool outputs before presenting |

---

## Phase 5: FastAPI Chat API

### Technical Goals
- Create /api/chat endpoints
- Implement stateless request handling
- Orchestrate agent invocation and message persistence

### System Components
- `backend/app/schemas/chat.py` - Pydantic schemas
- `backend/app/services/chat_service.py` - ChatService class
- `backend/app/routers/chat.py` - FastAPI router

### Input Dependencies
- TodoAgent from Phase 4
- Conversation/Message models from Phase 2
- JWT auth from existing app

### Output Deliverables
- ChatRequest/ChatResponse schemas
- ChatService with process_chat() method
- Three API endpoints with JWT auth

### Claude Code Automation Prompts

```yaml
prompt_chain:
  - id: create_chat_schemas
    agent: fastapi-backend
    prompt: |
      Create backend/app/schemas/chat.py with Pydantic models:
      - ChatRequest: conversation_id (optional), message (1-2000 chars)
      - ChatResponse: conversation_id, message_id, response, tasks_affected
      - TaskAffected: id, action, title
      - ConversationSummary: id, timestamps, message_count, preview
      - MessageOut: id, role, content, created_at
      - ErrorResponse: error, message, code
      Reference: contracts/chat-api.yaml

  - id: create_chat_service
    agent: fastapi-backend
    prompt: |
      Create backend/app/services/chat_service.py with ChatService:
      - get_or_create_conversation()
      - get_conversation_messages(limit=20)
      - persist_message()
      - process_chat() - full flow orchestration
      - list_conversations()
      - get_messages()
      Use 30s timeout for agent calls

  - id: create_chat_router
    agent: fastapi-backend
    prompt: |
      Create backend/app/routers/chat.py with endpoints:
      - POST /api/chat - Send message (JWT required)
      - GET /api/chat/conversations - List conversations
      - GET /api/chat/conversations/{id}/messages - Get messages
      Use get_current_user dependency for auth
      Reference: contracts/chat-api.yaml

  - id: register_router
    agent: fastapi-backend
    prompt: |
      Update backend/app/main.py:
      - Import chat_router from app.routers
      - Add app.include_router(chat_router)
      - Import models to ensure table creation
```

### Validation Checkpoints
- [ ] Endpoint rejects requests without valid JWT
- [ ] New conversation created when conversation_id is null
- [ ] Messages persisted before and after agent call
- [ ] Response includes affected tasks

### Acceptance Criteria
- p95 latency < 5s
- Proper 401 response for invalid JWT
- Proper 400 response for empty message
- Conversation persists across requests

### Failure Recovery
| Issue | Recovery Action |
|-------|-----------------|
| Agent timeout | Return graceful error, suggest retry |
| DB transaction failure | Rollback, return error |
| Concurrent message race | Use database transactions |
| Large conversation history | Truncate to 20 messages |

---

## Phase 6: ChatKit Frontend

### Technical Goals
- Build chat UI components
- Integrate with Better Auth
- Implement real-time message display

### System Components
- `frontend/lib/chat-api.ts` - API client
- `frontend/components/chat/TypingIndicator.tsx`
- `frontend/components/chat/MessageInput.tsx`
- `frontend/components/chat/MessageList.tsx`
- `frontend/components/chat/ChatInterface.tsx`
- `frontend/app/(dashboard)/chat/page.tsx`

### Input Dependencies
- Chat API from Phase 5
- Better Auth session
- Existing dashboard layout

### Output Deliverables
- TypeScript API client with auth
- 4 React chat components
- Chat page with navigation

### Claude Code Automation Prompts

```yaml
prompt_chain:
  - id: implement_chat_api
    agent: frontend-nextjs
    prompt: |
      Implement frontend/lib/chat-api.ts:
      - sendMessage(conversationId, message) - POST /api/chat
      - getConversations(limit) - GET conversations
      - getMessages(conversationId, limit) - GET messages
      Get JWT token from Better Auth /api/auth/token endpoint
      Handle 401 by redirecting to signin

  - id: create_typing_indicator
    agent: frontend-nextjs
    parallel: true
    prompt: |
      Create frontend/components/chat/TypingIndicator.tsx:
      - Props: isVisible (boolean)
      - "Assistant is typing..." with animated dots
      - Tailwind CSS styling

  - id: create_message_input
    agent: frontend-nextjs
    parallel: true
    prompt: |
      Create frontend/components/chat/MessageInput.tsx:
      - Props: onSend, disabled, loading
      - Auto-resizing textarea
      - Send button with icon
      - Enter to send, Shift+Enter for newline
      - Clear after send

  - id: create_message_list
    agent: frontend-nextjs
    parallel: true
    prompt: |
      Create frontend/components/chat/MessageList.tsx:
      - Props: messages array
      - User messages: right-aligned, blue
      - Assistant messages: left-aligned, gray
      - Timestamp on hover
      - Auto-scroll to bottom
      - Empty state message

  - id: create_chat_interface
    agent: frontend-nextjs
    prompt: |
      Create frontend/components/chat/ChatInterface.tsx:
      - State: messages, conversationId, isLoading, isTyping, error
      - Optimistic UI updates
      - Error banner display
      - Compose child components
      - Use Better Auth session

  - id: create_chat_page
    agent: frontend-nextjs
    prompt: |
      Create frontend/app/(dashboard)/chat/page.tsx:
      - "use client" directive
      - Page title "Chat with Assistant"
      - Full-height layout
      - Render ChatInterface

  - id: update_navigation
    agent: frontend-nextjs
    prompt: |
      Update frontend/app/(dashboard)/layout.tsx:
      - Add navItems array with Todos and Chat
      - Use MessageSquare icon from lucide-react
      - Highlight active page
      - Link to /chat
```

### Validation Checkpoints
- [ ] Chat page only accessible when authenticated
- [ ] Messages render in correct order
- [ ] Input cleared after sending
- [ ] Typing indicator shows during API call

### Acceptance Criteria
- Responsive design works on mobile
- Messages scroll to bottom on new message
- Error states display user-friendly messages
- Keyboard navigation works (Enter to send)

### Failure Recovery
| Issue | Recovery Action |
|-------|-----------------|
| Session expiration | Redirect to login |
| API timeout | Show error toast, allow retry |
| Message order issues | Sort by created_at |
| Optimistic update failure | Remove failed message, show error |

---

## Phase 7: Testing & QA

### Technical Goals
- Achieve 80% code coverage
- Zero security test failures
- Validate all user scenarios

### System Components
- `backend/tests/test_mcp_tools.py`
- `backend/tests/test_agent.py`
- `backend/tests/test_chat.py`
- `backend/tests/test_integration.py`
- `backend/tests/test_security.py`
- `frontend/tests/chat.spec.ts`

### Testing Matrix

| Test Type | Scope | Tools | Coverage Target |
|-----------|-------|-------|-----------------|
| Unit | MCP Tools | pytest | 100% |
| Unit | Agent | pytest + mocks | 90% |
| Integration | Chat API | pytest + TestClient | 85% |
| E2E | Full Flow | Playwright | Critical paths |
| Security | Auth + Isolation | pytest | 100% |
| Load | Performance | locust | p95 < 5s |

### Claude Code Automation Prompts

```yaml
prompt_chain:
  - id: create_mcp_tool_tests
    agent: fastapi-backend
    prompt: |
      Create backend/tests/test_mcp_tools.py:
      - add_task: valid creation, missing title, title too long
      - list_tasks: all/pending/completed, empty list
      - complete_task: valid, not found, wrong user
      - delete_task: valid, not found, wrong user
      - update_task: title, description, both, no fields
      Use test database fixtures with multiple users

  - id: create_agent_tests
    agent: fastapi-backend
    prompt: |
      Create backend/tests/test_agent.py:
      - Intent detection tests
      - Tool chaining tests
      - Ambiguity handling tests
      - Error handling tests
      - Context usage tests
      Use mocked OpenAI responses

  - id: create_chat_api_tests
    agent: fastapi-backend
    prompt: |
      Create backend/tests/test_chat.py:
      - POST /api/chat: valid, continue, reject no JWT, reject empty
      - GET conversations: returns user's only
      - GET messages: in order, 404 for other user

  - id: create_security_tests
    agent: fastapi-backend
    prompt: |
      Create backend/tests/test_security.py:
      - No JWT → 401
      - Expired JWT → 401
      - User A conversation_id for User B → 404
      - SQL injection in message → no effect
      - System prompt extraction → refused
      - Very long message → rejected

  - id: create_e2e_tests
    agent: frontend-nextjs
    prompt: |
      Create frontend/tests/chat.spec.ts with Playwright:
      - Navigate authenticated → see chat
      - Navigate unauthenticated → redirect
      - Send message → see response
      - Typing indicator during API call
      - Error handling
      - Responsive design
```

### Validation Checkpoints
- [ ] All unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] No security violations
- [ ] Performance meets targets

### Acceptance Criteria
- 80% code coverage
- Zero security test failures
- p95 latency < 5s under 100 concurrent users
- All user stories verified

### Failure Recovery
| Issue | Recovery Action |
|-------|-----------------|
| Test flakiness | Add retries, improve fixtures |
| Coverage gap | Add targeted tests |
| Security failure | Immediate fix, re-test |
| Performance degradation | Profile and optimize |

---

## Phase 8: Deployment & Production Hardening

### Technical Goals
- Production-ready configuration
- Health monitoring and logging
- Documentation and runbooks

### System Components
- Health check endpoints
- Structured logging
- Error tracking
- Environment configuration

### Environment Separation

| Environment | Purpose | Database | OpenAI Model |
|-------------|---------|----------|--------------|
| Development | Local dev | Local/branch | gpt-4o-mini |
| Staging | Pre-production | Staging branch | gpt-4o-mini |
| Production | Live users | Main branch | gpt-4o |

### Secrets Management

| Secret | Storage | Rotation |
|--------|---------|----------|
| DATABASE_URL | Environment variable | On compromise |
| JWT_SECRET | Environment variable | Quarterly |
| OPENAI_API_KEY | Environment variable | On compromise |
| BETTER_AUTH_SECRET | Environment variable | On compromise |

### Claude Code Automation Prompts

```yaml
prompt_chain:
  - id: add_health_check
    agent: fastapi-backend
    prompt: |
      Update backend/app/main.py /health endpoint:
      - status: healthy/unhealthy
      - checks: { database: bool, openai: bool }
      - Verify database connection
      - Verify OpenAI API key configured

  - id: add_structured_logging
    agent: fastapi-backend
    prompt: |
      Add structured logging to chat_service.py:
      - Log each request with correlation_id, user_id, conversation_id
      - Log agent invocation start/end with duration
      - Log tool calls with name and status
      - Log errors with full context (no sensitive data)
      Use Python logging with JSON formatter

  - id: add_error_boundary
    agent: frontend-nextjs
    prompt: |
      Add error boundary to ChatInterface:
      - Catch unhandled errors
      - Display friendly message
      - Report to console (or Sentry if configured)

  - id: update_env_examples
    agent: fastapi-backend
    parallel: true
    prompt: |
      Update backend/.env.example with all variables:
      DATABASE_URL, JWT_SECRET, OPENAI_API_KEY, CORS_ORIGINS, LOG_LEVEL

  - id: update_frontend_env
    agent: frontend-nextjs
    parallel: true
    prompt: |
      Update frontend/.env.example with all variables
```

### CI/CD Pipeline

```yaml
stages:
  - lint:
      - eslint frontend
      - flake8 backend
  - test:
      - pytest backend
      - npm test frontend
      - playwright e2e
  - build:
      - next build frontend
      - docker build backend
  - deploy:
      - staging: auto on PR merge
      - production: manual approval
```

### Rollback Strategy

| Phase | Rollback Action |
|-------|-----------------|
| Phase 2 | Drop conversations/messages tables |
| Phase 3-5 | Remove chat router from main.py |
| Phase 6 | Remove /chat route, hide nav link |
| Full | Revert to pre-feature branch |

### Validation Checkpoints
- [ ] Health checks return 200
- [ ] Logs contain correlation IDs
- [ ] Errors reported to tracking
- [ ] Documentation complete

### Acceptance Criteria
- Zero downtime deployment possible
- Errors traceable in monitoring
- New developers can setup in < 30 minutes

---

## Error Handling & Recovery

### Agent Hallucination Handling

```python
# Validation strategy
def validate_tool_response(tool_name, result):
    if not result.get("success"):
        return result  # Pass through errors

    # Verify response matches expected schema
    if tool_name == "add_task":
        assert "task" in result
        assert "id" in result["task"]

    # Never fabricate data
    return result
```

### Tool Execution Failures

```python
async def invoke_tool_with_retry(tool_name, session, user_id, args, max_retries=3):
    for attempt in range(max_retries):
        try:
            return await mcp_server.invoke_tool(tool_name, session, user_id, args)
        except DatabaseError:
            if attempt < max_retries - 1:
                await asyncio.sleep(2 ** attempt)
            else:
                return {"success": False, "error": "Service temporarily unavailable"}
```

### User-Safe Error Messages

| Internal Error | User Message | Code |
|---------------|--------------|------|
| DatabaseConnectionError | "Service temporarily unavailable" | DB_ERROR |
| OpenAI RateLimitError | "Too many requests. Please wait." | RATE_LIMITED |
| JWTExpiredError | "Please sign in again" | AUTH_REQUIRED |
| TaskNotFoundError | "I couldn't find that task" | TASK_NOT_FOUND |
| ValidationError | "I didn't understand that" | INVALID_REQUEST |
| TimeoutError | "Request timed out. Please try again." | TIMEOUT |

---

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] Security audit complete
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] OpenAI API key valid
- [ ] CORS origins configured
- [ ] Health checks working

### Deployment

- [ ] Deploy backend to production
- [ ] Verify /health returns healthy
- [ ] Deploy frontend to production
- [ ] Verify chat page loads
- [ ] Test full chat flow

### Post-Deployment

- [ ] Monitor error rates
- [ ] Check response latencies
- [ ] Verify user isolation
- [ ] Test rollback procedure
- [ ] Update documentation

---

## Appendix A: File Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app + chat router
│   ├── config.py            # Settings with openai_api_key
│   ├── database.py          # Neon connection
│   ├── routers/
│   │   ├── todos.py         # Existing
│   │   └── chat.py          # NEW: Chat endpoints
│   ├── models/
│   │   ├── todo.py          # Existing
│   │   ├── conversation.py  # NEW
│   │   └── message.py       # NEW
│   ├── schemas/
│   │   └── chat.py          # NEW: Pydantic schemas
│   ├── services/
│   │   └── chat_service.py  # NEW: Chat orchestration
│   └── auth/
│       └── jwt.py           # Existing
├── mcp/
│   ├── server.py            # NEW: MCP Server
│   └── tools/               # NEW: 5 tools
├── agents/
│   ├── prompts.py           # NEW: System prompt
│   └── todo_agent.py        # NEW: OpenAI Agent
└── tests/                   # NEW: Test files

frontend/
├── app/
│   └── (dashboard)/
│       ├── layout.tsx       # UPDATED: Nav with Chat
│       └── chat/
│           └── page.tsx     # NEW: Chat page
├── components/
│   └── chat/                # NEW: 4 components
└── lib/
    └── chat-api.ts          # NEW: API client
```

---

## Appendix B: API Contract Summary

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/chat` | POST | JWT | Send message to AI |
| `/api/chat/conversations` | GET | JWT | List conversations |
| `/api/chat/conversations/{id}/messages` | GET | JWT | Get messages |
| `/health` | GET | None | Health check |

---

## Appendix C: Tool Definitions

| Tool | Input | Output | Security |
|------|-------|--------|----------|
| add_task | title, description? | task object | user_id filter |
| list_tasks | status? | tasks array | user_id filter |
| complete_task | task_id | task object | user_id + task_id check |
| delete_task | task_id | deleted info | user_id + task_id check |
| update_task | task_id, title?, description? | task object | user_id + task_id check |

---

**Document Version**: 1.0
**Last Updated**: 2026-02-05
**Author**: Claude Code (Automated)
