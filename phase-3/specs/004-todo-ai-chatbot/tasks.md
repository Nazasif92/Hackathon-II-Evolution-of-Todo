# Tasks: Todo AI Chatbot

**Input**: Design documents from `/specs/004-todo-ai-chatbot/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Test tasks included for backend (unit, integration, security) and frontend (e2e) as specified in the execution plan.

**Organization**: Tasks grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, directory structure, dependencies, environment configuration

- [x] T001 Create backend directory structure: backend/mcp/__init__.py, backend/mcp/tools/__init__.py, backend/agents/__init__.py, backend/app/services/__init__.py, backend/app/schemas/__init__.py
- [x] T002 [P] Create frontend directory structure: frontend/app/(dashboard)/chat/, frontend/components/chat/, frontend/lib/chat-api.ts (placeholder)
- [x] T003 Update backend/requirements.txt — add openai>=1.0.0 (preserve existing deps)
- [x] T004 [P] Update frontend/package.json — add @ai-sdk/react, run npm install
- [x] T005 [P] Update backend/.env.example — add OPENAI_API_KEY=sk-your-openai-api-key-here
- [x] T006 [P] Update frontend/.env.example — add NEXT_PUBLIC_API_URL=http://localhost:8000
- [x] T007 Verify existing todo endpoints still work after dependency changes (GET /api/todos with valid JWT returns 200)

**Checkpoint**: Project structure ready. `pip install` and `npm install` succeed. Existing features unaffected.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database models, MCP server framework, agent framework, chat API skeleton, frontend shell — shared infrastructure ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

### Database Models

- [x] T008 Create backend/app/models/conversation.py — Conversation SQLModel class with fields: id (Optional[int], primary key), user_id (str), created_at (datetime), updated_at (datetime). Reference specs/004-todo-ai-chatbot/data-model.md
- [x] T009 Create backend/app/models/message.py — MessageRole enum (user/assistant) and Message SQLModel class with fields: id (Optional[int], primary key), conversation_id (int, FK to conversations.id), user_id (str), role (MessageRole), content (str), created_at (datetime). Reference specs/004-todo-ai-chatbot/data-model.md
- [x] T010 Update backend/app/models/__init__.py — export Conversation, Message, MessageRole alongside existing Todo exports
- [x] T011 Ensure backend/app/main.py imports Conversation and Message models so SQLModel.metadata.create_all() creates tables on startup

### MCP Server Framework

- [x] T012 Create backend/mcp/server.py — MCPServer class with tool registry dict, get_tool_definitions() returning OpenAI function-calling compatible definitions, invoke_tool(name, session, user_id, arguments) method. Register tools in __init__. Reference specs/004-todo-ai-chatbot/contracts/mcp-tools.json

### Agent Framework

- [x] T013 Create backend/agents/prompts.py — SYSTEM_PROMPT (task management assistant role, capabilities, constraints), CONTEXT_WINDOW_LIMIT=20. Reference plan.md Phase 4 system prompt strategy
- [x] T014 Create backend/agents/todo_agent.py — TodoAgent class: __init__(api_key, model="gpt-4o-mini"), _build_messages(user_message, history), async run(session, user_id, message, conversation_history) returning {response, tool_calls, tasks_affected}. 30s timeout, max 5 tool iterations. Reference plan.md Phase 4
- [x] T015 Update backend/agents/__init__.py — export TodoAgent

### Chat API Skeleton

- [x] T016 Create backend/app/schemas/chat.py — Pydantic models: ChatRequest(conversation_id: Optional[int], message: str 1-2000), ChatResponse(conversation_id, message_id, response, tasks_affected), TaskAffected(id, action, title), ConversationSummary(id, created_at, updated_at, message_count, preview), MessageOut(id, role, content, created_at). Reference contracts/chat-api.yaml
- [x] T017 Create backend/app/services/chat_service.py — ChatService class: get_or_create_conversation(), get_conversation_messages(limit=20), persist_message(), process_chat() orchestrating full flow, list_conversations(), get_messages(). 30s agent timeout. Reference plan.md Phase 5
- [x] T018 Create backend/app/routers/chat.py — POST /api/chat (JWT required, ChatRequest → ChatResponse), GET /api/chat/conversations (JWT, list user's conversations), GET /api/chat/conversations/{id}/messages (JWT, 404 for other user's). Reference contracts/chat-api.yaml
- [x] T019 Update backend/app/main.py — import and include chat_router with prefix="/api"
- [x] T020 Update backend/app/routers/__init__.py — export chat_router

### Frontend Shell

- [x] T021 Create frontend/lib/chat-api.ts — TypeScript API client: sendMessage(conversationId, message), getConversations(limit), getMessages(conversationId, limit). JWT from Better Auth session. Handle 401 → redirect /signin. Reference lib/api.ts patterns
- [x] T022 [P] Create frontend/components/chat/TypingIndicator.tsx — "use client", props: isVisible (boolean), "Assistant is typing..." with animated dots, Tailwind CSS
- [x] T023 [P] Create frontend/components/chat/MessageInput.tsx — "use client", props: onSend, disabled, loading. Auto-resize textarea, Enter to send, Shift+Enter newline, clear after send, Tailwind CSS
- [x] T024 [P] Create frontend/components/chat/MessageList.tsx — "use client", props: messages[]. User messages right/blue, assistant left/gray, timestamps, auto-scroll, empty state, Tailwind CSS
- [x] T025 Create frontend/components/chat/ChatInterface.tsx — "use client", state: messages[], conversationId, isLoading, isTyping, error. Optimistic updates, error banner, compose MessageList + TypingIndicator + MessageInput
- [x] T026 [P] Create frontend/components/chat/index.ts — barrel export all chat components
- [x] T027 Create frontend/app/(dashboard)/chat/page.tsx — "use client", page title "Chat with AI Assistant", full-height layout, render ChatInterface
- [x] T028 Update frontend/app/(dashboard)/layout.tsx — add Chat link to nav with MessageSquare icon, link to /chat, highlight active

**Checkpoint**: Foundation ready. App starts, tables created, chat page renders, API endpoints exist (returning mock/empty). ALL user stories can now proceed.

---

## Phase 3: User Story 1 — Natural Language Task Creation (Priority: P1) MVP

**Goal**: Users can create tasks by typing natural language commands like "Add buy groceries to my list"

**Independent Test**: Send chat message "Add a task to buy milk" → verify task appears in user's task list via GET /api/todos

### Implementation for User Story 1

- [x] T029 [US1] Create backend/mcp/tools/add_task.py — async def add_task(session, user_id, title, description=None). Validate: title required (1-200 chars). Create Todo in DB. Return {success, task: {id, title, description, completed, created_at}}. ALWAYS filter by user_id. Reference contracts/mcp-tools.json
- [x] T030 [US1] Register add_task tool in backend/mcp/server.py — add tool definition (name, description, parameters JSON Schema) and wire invoke_tool to call add_task
- [x] T031 [US1] Verify end-to-end: POST /api/chat with message "Add buy groceries" → agent calls add_task → task created → response confirms creation → task visible in GET /api/todos

**Checkpoint**: User Story 1 fully functional. Users can create tasks via chat.

---

## Phase 4: User Story 2 — View and List Tasks (Priority: P1) MVP

**Goal**: Users can ask the chatbot to show tasks with status filtering

**Independent Test**: Create 3 tasks (2 pending, 1 completed) → send "Show my tasks" → all 3 shown. Send "What's left to do?" → only 2 pending shown.

### Implementation for User Story 2

- [x] T032 [US2] Create backend/mcp/tools/list_tasks.py — async def list_tasks(session, user_id, status="all"). Query WHERE user_id=user_id, apply status filter (pending→completed=False, completed→completed=True). Return {success, tasks[], count}. Return empty array when no tasks
- [x] T033 [US2] Register list_tasks tool in backend/mcp/server.py — add tool definition and wire invoke_tool
- [x] T034 [US2] Verify end-to-end: POST /api/chat with message "Show my tasks" → agent calls list_tasks → tasks displayed → send "Show completed tasks" → only completed shown

**Checkpoint**: User Stories 1 AND 2 work. Users can create and view tasks.

---

## Phase 5: User Story 3 — Mark Tasks Complete (Priority: P2)

**Goal**: Users can tell the chatbot they've finished a task to update its status

**Independent Test**: Create task "Buy groceries" → send "I finished buying groceries" → task status changes to completed → visible in completed list

### Implementation for User Story 3

- [x] T035 [US3] Create backend/mcp/tools/complete_task.py — async def complete_task(session, user_id, task_id). Query WHERE id=task_id AND user_id=user_id. If not found: {success: false, error: "Task not found"}. Set completed=True. Return {success, task}
- [x] T036 [US3] Register complete_task tool in backend/mcp/server.py — add tool definition and wire invoke_tool
- [x] T037 [US3] Verify end-to-end: Create task via chat → send "Mark buy groceries as done" → agent calls complete_task → confirmation response → task shows as completed

**Checkpoint**: User Stories 1, 2, 3 work independently.

---

## Phase 6: User Story 4 — Delete Tasks (Priority: P2)

**Goal**: Users can remove tasks from their list to keep it clean

**Independent Test**: Create task → send "Delete the groceries task" → task removed → task no longer in list

### Implementation for User Story 4

- [x] T038 [US4] Create backend/mcp/tools/delete_task.py — async def delete_task(session, user_id, task_id). Query WHERE id=task_id AND user_id=user_id. If not found: {success: false, error: "Task not found"}. Delete permanently. Return {success, deleted: {id, title}}
- [x] T039 [US4] Register delete_task tool in backend/mcp/server.py — add tool definition and wire invoke_tool
- [x] T040 [US4] Verify end-to-end: Create task via chat → send "Remove the groceries task" → agent calls delete_task → confirmation → task gone from list

**Checkpoint**: User Stories 1-4 work. Full CRUD minus update.

---

## Phase 7: User Story 5 — Update Tasks (Priority: P3)

**Goal**: Users can modify task details like title or description

**Independent Test**: Create task "Buy milk" → send "Change it to buy almond milk" → task title updated

### Implementation for User Story 5

- [x] T041 [US5] Create backend/mcp/tools/update_task.py — async def update_task(session, user_id, task_id, title=None, description=None). Validate: at least one field provided. Query WHERE id=task_id AND user_id=user_id. If not found: error. Update fields. Return {success, task}
- [x] T042 [US5] Register update_task tool in backend/mcp/server.py — add tool definition and wire invoke_tool
- [x] T043 [US5] Verify end-to-end: Create task "Buy milk" → send "Change buy milk to buy almond milk" → agent calls update_task → confirmation → task shows updated title

**Checkpoint**: All 5 CRUD operations work via chat. User Stories 1-5 complete.

---

## Phase 8: User Story 6 — Conversation Memory (Priority: P3)

**Goal**: Chatbot remembers conversation context for pronoun/reference resolution

**Independent Test**: Create task → follow up with "Actually, delete that" → chatbot understands "that" refers to just-created task

### Implementation for User Story 6

- [x] T044 [US6] Verify conversation persistence in backend/app/services/chat_service.py — ensure get_conversation_messages returns last 20 messages in chronological order and agent receives full history
- [x] T045 [US6] Verify context resolution: create task → send "mark that as done" (no task name) → agent uses conversation history to identify the correct task
- [x] T046 [US6] Verify cross-session persistence: send message → close browser → reopen → navigate to chat → previous messages still visible (loaded from GET /api/chat/conversations/{id}/messages)

**Checkpoint**: Conversation memory works across messages and sessions.

---

## Phase 9: User Story 7 — Multi-Step Operations via Tool Chaining (Priority: P3)

**Goal**: Users can perform complex operations with a single request

**Independent Test**: Create 3 completed tasks → send "Delete all completed tasks" → all 3 deleted

### Implementation for User Story 7

- [x] T047 [US7] Verify agent tool chaining in backend/agents/todo_agent.py — ensure agent can call list_tasks then call delete_task multiple times in a single run() invocation (max 5 iterations)
- [x] T048 [US7] Verify end-to-end: Create 3 tasks → complete 2 → send "Delete all completed tasks" → agent calls list_tasks(status=completed) then delete_task for each → confirmation
- [x] T049 [US7] Verify batch creation: send "Add three tasks: buy milk, call mom, finish report" → agent calls add_task 3 times → all 3 tasks created and confirmed

**Checkpoint**: All 7 user stories functional.

---

## Phase 10: Testing & QA

**Purpose**: Comprehensive testing — unit, integration, security, e2e. 80% coverage target.

### Backend Unit Tests

- [x] T050 [P] Create backend/tests/test_mcp_tools.py — pytest unit tests for all 5 tools: add_task (valid, missing title, title too long), list_tasks (all/pending/completed, empty, user isolation), complete_task (valid, not found, wrong user), delete_task (valid, not found, wrong user), update_task (title, description, both, no fields, wrong user). Multi-user fixtures
- [x] T051 [P] Create backend/tests/test_agent.py — pytest tests with mocked OpenAI: intent detection (add/list/complete/delete/update), tool chaining, ambiguity handling, timeout, no system prompt leak. Use mocked responses

### Backend Integration Tests

- [x] T052 Create backend/tests/test_chat.py — pytest + TestClient: POST /api/chat (new conversation, continue conversation, no JWT → 401, empty message → 400), GET /api/chat/conversations (user's only, empty, no JWT), GET /api/chat/conversations/{id}/messages (in order, wrong user → 404)

### Security Tests

- [x] T053 Create backend/tests/test_security.py — pytest: no JWT → 401, expired JWT → 401, User A → User B conversation → 404, SQL injection in message → no effect, system prompt extraction → refused, message > 2000 chars → rejected

### Frontend E2E Tests

- [x] T054 Create frontend/tests/chat.spec.ts — Playwright: authenticated → see chat, unauthenticated → redirect, send message → receive response, typing indicator, message persistence, responsive mobile, navigation

### Test Execution

- [x] T055 Run pytest backend/tests/ --cov=app --cov=mcp --cov=agents and verify >= 80% coverage
- [x] T056 Run npx playwright test and verify all e2e tests pass
- [x] T057 Verify zero security test failures in test_security.py

**Checkpoint**: Quality gate passed — 80% coverage, 0 security failures, all e2e pass.

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Production hardening, health checks, logging, documentation

- [x] T058 Update backend/app/main.py /health endpoint — return {status, checks: {database, openai_configured}, version: "1.0.0"}
- [x] T059 [P] Add structured logging to backend/app/services/chat_service.py — correlation_id, user_id, agent duration_ms, tool calls, errors (no sensitive data)
- [x] T060 [P] Add error boundary to frontend/components/chat/ChatInterface.tsx — catch API errors, display friendly messages, redirect on 401
- [x] T061 [P] Update backend/.env.example with all variables: DATABASE_URL, JWT_SECRET, OPENAI_API_KEY, CORS_ORIGINS, LOG_LEVEL
- [x] T062 [P] Update frontend/.env.example with all variables: BETTER_AUTH_SECRET, BETTER_AUTH_URL, NEXT_PUBLIC_API_URL, DATABASE_URL
- [x] T063 Verify quickstart.md instructions in specs/004-todo-ai-chatbot/quickstart.md — follow step by step, fix any outdated instructions
- [x] T064 Run full application end-to-end: signup → signin → chat → create task → list → complete → update → delete → verify
- [x] T065 Test responsive design on mobile viewport (375px)
- [x] T066 Verify graceful degradation when OpenAI API key is missing or invalid

**Checkpoint**: Production ready. Health checks pass, logs structured, docs complete.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **User Stories (Phases 3-9)**: All depend on Phase 2 completion
  - US1 (Phase 3): Can start after Phase 2 — No other story dependencies
  - US2 (Phase 4): Can start after Phase 2 — No other story dependencies
  - US3 (Phase 5): Can start after Phase 2 — No other story dependencies
  - US4 (Phase 6): Can start after Phase 2 — No other story dependencies
  - US5 (Phase 7): Can start after Phase 2 — No other story dependencies
  - US6 (Phase 8): Can start after Phase 2 — Validates existing persistence
  - US7 (Phase 9): Depends on US1-US4 (needs multiple tools for chaining)
- **Testing (Phase 10)**: Depends on all user stories complete
- **Polish (Phase 11)**: Depends on Phase 10 (testing)

### User Story Dependencies

```
Phase 1 (Setup)
    │
    ▼
Phase 2 (Foundational) ── BLOCKS ALL ──┐
    │                                    │
    ├──▶ Phase 3 (US1: Create) ──┐      │
    ├──▶ Phase 4 (US2: List)  ──┤      │
    ├──▶ Phase 5 (US3: Complete)┤ parallel
    ├──▶ Phase 6 (US4: Delete) ─┤      │
    ├──▶ Phase 7 (US5: Update) ─┤      │
    ├──▶ Phase 8 (US6: Memory) ─┘      │
    │                                    │
    └──▶ Phase 9 (US7: Multi-step) ◀── needs US1-US4
              │
              ▼
         Phase 10 (Testing)
              │
              ▼
         Phase 11 (Polish)
```

### Within Each User Story

1. Create tool implementation file
2. Register tool in MCP server
3. Verify end-to-end flow

### Parallel Opportunities

**Within Phase 1**: T002, T004, T005, T006 (different files/dirs)
**Within Phase 2**: T008+T009 (different model files), T022+T023+T024+T026 (different component files)
**User Stories 1-6**: Can all run in parallel after Phase 2 (independent tools/verification)
**Within Phase 10**: T050+T051 (different test files), T053+T054 (different test files)
**Within Phase 11**: T059+T060+T061+T062 (different files)

---

## Parallel Example: User Stories 1-5 (after Phase 2)

```bash
# All 5 user stories can launch simultaneously:
Agent: "T029-T031 — US1: add_task tool + registration + e2e verify"
Agent: "T032-T034 — US2: list_tasks tool + registration + e2e verify"
Agent: "T035-T037 — US3: complete_task tool + registration + e2e verify"
Agent: "T038-T040 — US4: delete_task tool + registration + e2e verify"
Agent: "T041-T043 — US5: update_task tool + registration + e2e verify"
```

## Parallel Example: Phase 2 Frontend Components

```bash
# Launch all UI components together:
Agent: "T022 TypingIndicator in frontend/components/chat/TypingIndicator.tsx"
Agent: "T023 MessageInput in frontend/components/chat/MessageInput.tsx"
Agent: "T024 MessageList in frontend/components/chat/MessageList.tsx"
Agent: "T026 Barrel export in frontend/components/chat/index.ts"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (Create tasks via chat)
4. Complete Phase 4: User Story 2 (List tasks via chat)
5. **STOP and VALIDATE**: Test US1 + US2 independently
6. Deploy/demo if ready — users can create and view tasks

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (Create) → Test → Demo (MVP!)
3. Add US2 (List) → Test → Demo (users can see tasks)
4. Add US3 (Complete) → Test → Demo (task lifecycle)
5. Add US4 (Delete) → Test → Demo (full CRUD minus update)
6. Add US5 (Update) → Test → Demo (full CRUD)
7. Add US6 (Memory) → Test → Demo (context awareness)
8. Add US7 (Multi-step) → Test → Demo (power features)
9. Testing + Polish → Production ready

### Parallel Team Strategy

With multiple agents/developers after Phase 2:
- Agent A: US1 (Create) + US2 (List)
- Agent B: US3 (Complete) + US4 (Delete)
- Agent C: US5 (Update) + US6 (Memory)
- All complete → US7 (Multi-step) → Testing → Polish

---

## Summary

| Metric | Value |
|--------|-------|
| Total Tasks | 66 |
| Setup Tasks (Phase 1) | 7 |
| Foundational Tasks (Phase 2) | 21 |
| User Story Tasks (Phases 3-9) | 21 (3 per story) |
| Testing Tasks (Phase 10) | 8 |
| Polish Tasks (Phase 11) | 9 |
| Parallelizable Tasks | 16 (marked [P]) |
| User Stories | 7 |
| MVP Scope | US1 + US2 (6 tasks after foundation) |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable after Phase 2
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Tool implementations (Phase 3-7) register into MCP server created in Phase 2
- Agent framework (Phase 2) is the shared backbone; tools are plugged in per user story
