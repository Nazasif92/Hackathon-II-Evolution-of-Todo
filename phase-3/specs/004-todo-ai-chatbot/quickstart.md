# Quickstart: Todo AI Chatbot

**Feature**: 004-todo-ai-chatbot
**Date**: 2026-02-04

---

## Prerequisites

- Python 3.11+ installed
- Node.js 18+ installed
- Neon PostgreSQL database provisioned (from Phase 2)
- Better Auth configured (from Phase 2)
- OpenAI API key

---

## Environment Setup

### Backend (.env)

```bash
# Copy from existing Phase 2 .env and add:
cp backend/.env.example backend/.env

# Add these new variables:
OPENAI_API_KEY=sk-your-openai-api-key
```

### Frontend (.env.local)

```bash
# No changes needed from Phase 2 setup
# Better Auth already configured
```

---

## Installation

### Backend Dependencies

```bash
cd backend
pip install -r requirements.txt

# New dependencies added:
# - openai>=1.0.0 (OpenAI API for agent reasoning)
```

### Frontend Dependencies

```bash
cd frontend
npm install

# New dependencies added:
# - @ai-sdk/react (optional, for streaming patterns)
```

---

## Database Migration

Tables are auto-created on startup by SQLModel. When you start the backend server, it runs `SQLModel.metadata.create_all()` to create `conversations` and `messages` tables automatically.

Verify tables created (optional):

```sql
-- In Neon dashboard or psql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('conversations', 'messages');
```

---

## Running the Application

### Start Backend

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

### Start Frontend

```bash
cd frontend
npm run dev
```

---

## Verify Installation

### 1. Check Backend Health

```bash
curl http://localhost:8000/health
# Expected: {"status": "healthy", "checks": {"database": "healthy", "openai_configured": true}, "version": "1.0.0", "timestamp": "..."}
```

### 2. Check Existing Auth (from Phase 2)

```bash
# Login to get JWT token
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

### 3. Test Chat Endpoint

```bash
# Use the JWT token from login
curl -X POST http://localhost:8000/api/chat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Add a task to test the chatbot"}'
```

Expected response:

```json
{
  "conversation_id": "...",
  "message_id": "...",
  "response": "I've added 'test the chatbot' to your task list.",
  "tasks_affected": [
    {"id": 1, "action": "created", "title": "test the chatbot"}
  ]
}
```

---

## Using the Chat Interface

1. Navigate to `http://localhost:3000`
2. Sign in with your account
3. Click "Chat" in the navigation
4. Try these commands:
   - "Add buy groceries to my list"
   - "Show my tasks"
   - "Mark buy groceries as done"
   - "Delete the groceries task"

---

## Development Workflow

### MCP Tool Testing

```bash
# Run MCP tool unit tests
cd backend
pytest tests/test_mcp_tools.py -v
```

### Agent Testing

```bash
# Run agent behavior tests
pytest tests/test_agent.py -v
```

### Full Test Suite

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

---

## Troubleshooting

### "OpenAI API key not found"

Ensure `OPENAI_API_KEY` is set in `backend/.env`:

```bash
echo $OPENAI_API_KEY  # Should show your key
```

### "Conversation not found"

The conversation_id must belong to the authenticated user. Check:

1. JWT token is valid and not expired
2. conversation_id exists in the database
3. User owns the conversation

### "Agent timeout"

The agent has a 30-second timeout. If requests are slow:

1. Check OpenAI API status
2. Verify network connectivity
3. Check Neon database latency

### "CORS error"

Ensure backend CORS allows frontend origin:

```python
# backend/app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    ...
)
```

---

## Next Steps

After verification:

1. Run `/sp.tasks` to generate detailed implementation tasks
2. Execute tasks through Claude Code agents
3. Run test suite after each phase
4. Deploy to production after Phase 8

---

## Project Structure Reference

```
backend/
├── app/
│   ├── routers/chat.py      # Chat endpoint
│   ├── models/conversation.py
│   ├── models/message.py
│   └── services/chat_service.py
├── mcp/
│   ├── server.py            # MCP server
│   └── tools/               # Tool implementations
├── agents/
│   └── todo_agent.py        # OpenAI agent

frontend/
├── app/(dashboard)/chat/    # Chat page
├── components/chat/         # Chat components
└── lib/chat-api.ts          # API client
```
