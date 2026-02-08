# Research: Todo AI Chatbot

**Date**: 2026-02-04
**Feature**: 004-todo-ai-chatbot

---

## Technology Decisions

### 1. MCP SDK Selection

**Decision**: Use official `mcp` Python SDK from Anthropic/Model Context Protocol

**Rationale**:
- Official SDK ensures compatibility with MCP specification
- Active maintenance and documentation
- Type-safe tool definitions with Pydantic
- Built-in support for stdio and HTTP transports

**Alternatives Considered**:
- Custom tool protocol → Rejected: reinventing the wheel, no standard compliance
- LangChain tools → Rejected: different abstraction, not MCP-compliant
- Direct function calling → Rejected: no standardization benefits

**Implementation Notes**:
```python
# Install: pip install mcp
from mcp.server import Server
from mcp.types import Tool, TextContent
```

---

### 2. OpenAI Agents SDK Integration

**Decision**: Use `openai-agents-sdk` for agent orchestration

**Rationale**:
- Native support for tool calling with OpenAI models
- Built-in conversation management
- Supports structured outputs
- Well-documented best practices

**Alternatives Considered**:
- LangChain agents → Rejected: heavier dependency, more abstraction layers
- Raw OpenAI API → Rejected: would need to build agent loop manually
- Anthropic Claude → Rejected: spec requires OpenAI Agents SDK

**Implementation Notes**:
```python
# Install: pip install openai-agents-sdk
from agents import Agent, Tool
```

---

### 3. Chat UI Framework

**Decision**: Custom React components with @ai-sdk/react patterns

**Rationale**:
- Lightweight, no heavy dependencies
- Full control over styling with Tailwind CSS
- Patterns from @ai-sdk/react for streaming (if needed later)
- Integrates naturally with existing Next.js app

**Alternatives Considered**:
- Vercel AI SDK ChatKit → Considered: good patterns but adds dependency
- Stream.io Chat → Rejected: overkill for simple chat
- Raw WebSocket → Rejected: not needed for request/response model

**Implementation Notes**:
```typescript
// Components: ChatInterface, MessageList, MessageInput, TypingIndicator
// State: useReducer for message management
// API: fetch with JWT bearer token
```

---

### 4. Conversation Storage Strategy

**Decision**: Store full conversation history in PostgreSQL with message table

**Rationale**:
- Persistent across sessions (requirement FR-002)
- Queryable for analytics later
- Natural fit with existing SQLModel ORM
- Supports conversation continuation

**Alternatives Considered**:
- Redis for recent messages → Rejected: complexity of dual storage
- In-memory cache → Rejected: violates stateless requirement
- File storage → Rejected: not suitable for multi-user

**Schema Design**:
```sql
conversations (id, user_id, created_at, updated_at)
messages (id, conversation_id, user_id, role, content, created_at)
-- Index on (user_id), (conversation_id, created_at)
```

---

### 5. Agent Context Window Management

**Decision**: Limit context to last 20 messages per conversation

**Rationale**:
- Prevents token overflow with long conversations
- 20 messages ~= 10 exchanges, sufficient for task context
- Reduces API costs
- Maintains fast response times

**Alternatives Considered**:
- Full history always → Rejected: token limits, cost
- Summarization → Rejected: complexity, potential information loss
- Sliding window + summary → Considered for future enhancement

**Implementation**:
```python
messages = await get_last_n_messages(conversation_id, limit=20)
```

---

### 6. Error Response Strategy

**Decision**: Unified error response format with user-friendly messages

**Rationale**:
- Consistent experience across all error types
- Never expose internal details (security requirement FR-023)
- Actionable messages for users

**Format**:
```json
{
  "error": true,
  "message": "I couldn't find that task. Could you try describing it differently?",
  "code": "TASK_NOT_FOUND"
}
```

**Error Codes**:
| Code | User Message |
|------|--------------|
| TASK_NOT_FOUND | "I couldn't find that task..." |
| AUTH_REQUIRED | "Please sign in to continue" |
| INVALID_REQUEST | "I didn't understand that. Could you rephrase?" |
| AGENT_ERROR | "I'm having trouble right now. Please try again." |
| RATE_LIMITED | "Too many requests. Please wait a moment." |

---

### 7. Tool Invocation Pattern

**Decision**: Synchronous tool execution within agent loop

**Rationale**:
- Simpler implementation
- Task operations are fast (<100ms)
- No need for async job queue complexity
- Easier error handling and rollback

**Alternatives Considered**:
- Async with callbacks → Rejected: unnecessary complexity
- Queue-based → Rejected: overkill for simple CRUD
- Background jobs → Rejected: immediate feedback expected

**Flow**:
```
User Message → Agent → Tool Call → DB Operation → Tool Response → Agent → Response
```

---

### 8. JWT Token Handling in Chat

**Decision**: Pass user_id from JWT directly to MCP tools

**Rationale**:
- Tools don't need to re-validate JWT
- Single point of authentication (API layer)
- Simpler tool implementations
- Consistent with existing todo endpoints

**Implementation**:
```python
# In chat router (after JWT validation)
user_id = get_current_user_id(token)
# Pass to agent
response = await agent.run(message, context={"user_id": user_id})
# Tools receive user_id in their input
```

---

## Best Practices Applied

### From MCP SDK Documentation

1. **Tool definitions should be atomic** - Each tool does one thing well
2. **Input validation at tool boundary** - Validate all inputs before DB operations
3. **Structured outputs** - Return typed responses, not raw strings

### From OpenAI Agents Best Practices

1. **Clear system prompts** - Define role, capabilities, and constraints
2. **Tool descriptions matter** - Agent uses them for routing decisions
3. **Handle tool errors gracefully** - Don't crash on tool failures

### From FastAPI Security Guidelines

1. **Never trust client input** - Validate everything
2. **Always filter by user_id** - No direct object references
3. **Audit-log sensitive operations** - Track deletions, updates

---

## Open Questions (Resolved)

| Question | Resolution |
|----------|------------|
| Which MCP transport to use? | HTTP (embedded in FastAPI process) |
| How to handle streaming? | Not needed for MVP; request/response is fine |
| Rate limiting strategy? | Rely on OpenAI API limits initially |
| Conversation timeout? | No timeout; persistent storage |

---

## References

- [MCP SDK Documentation](https://modelcontextprotocol.io/docs)
- [OpenAI Agents SDK](https://platform.openai.com/docs/agents)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [SQLModel Documentation](https://sqlmodel.tiangolo.com/)
