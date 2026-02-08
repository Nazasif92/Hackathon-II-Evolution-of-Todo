---
id: 004
title: Generate Atomic Task Breakdown
stage: tasks
date: 2026-02-04
surface: agent
model: claude-opus-4-5-20251101
feature: 004-todo-ai-chatbot
branch: 004-todo-ai-chatbot
user: developer
command: /sp.tasks
labels: ["task-breakdown", "automation", "claude-code-prompts", "execution-plan"]
links:
  spec: specs/004-todo-ai-chatbot/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/004-todo-ai-chatbot/tasks.md
tests:
  - Task format validation
  - Dependency graph validation
---

## Prompt

/sp.tasks - Generate a COMPLETE ATOMIC TASK BREAKDOWN based on the previously generated SYSTEM SPECIFICATION and EXECUTION PLAN for the "Todo AI Chatbot" system.

OBJECTIVE: Decompose the full system into:
- Atomic, automatable engineering tasks
- Claude Code execution prompts
- Task-level validation checkpoints
- Task dependency graph
- Failure handling strategy

TASK GROUPING BY PHASES:
- Phase 1: Repo scaffolding
- Phase 2: Database + ORM + Auth
- Phase 3: MCP Server + Tools
- Phase 4: Agent logic
- Phase 5: API endpoints
- Phase 6: ChatKit frontend
- Phase 7: Testing + QA
- Phase 8: Deployment

FOR EACH TASK: Task name, Purpose, Input context, Expected output, Claude Code execution prompt, Validation criteria, Failure recovery.

## Response snapshot

Generated comprehensive atomic task breakdown with **67 total tasks** across 8 phases:

### Task Distribution by Phase

| Phase | Task Count | Key Deliverables |
|-------|------------|------------------|
| Phase 1: Scaffolding | 13 | Directory structure, dependencies |
| Phase 2: Database | 6 | Conversation, Message models, migration |
| Phase 3: MCP Tools | 10 | 5 tools + server + tests |
| Phase 4: Agent | 5 | TodoAgent, prompts, tests |
| Phase 5: Chat API | 6 | Schemas, service, router, tests |
| Phase 6: Frontend | 10 | Components, page, e2e tests |
| Phase 7: Testing | 6 | Integration, security, performance |
| Phase 8: Deploy | 11 | Health checks, logging, docs |

### Key Features

1. **Claude Code Prompts**: Each implementation task includes copy-paste-ready prompts with:
   - Clear input/output specifications
   - Reference to relevant contract files
   - Validation requirements

2. **Parallelization Opportunities**: 14 tasks marked [P] for parallel execution:
   - Phase 1: 7 parallel directory/file creations
   - Phase 3: 5 parallel MCP tool implementations
   - Phase 6: 3 parallel UI component creations

3. **Dependency Graph**: Clear phase dependencies with:
   - Critical path identified
   - Parallel track option (frontend mock during backend)
   - Rollback strategy per phase

4. **Quality Control Matrix**: Validation criteria per phase:
   - Phase 2: Migration tests
   - Phase 3: Tool isolation tests
   - Phase 4: 90% intent accuracy
   - Phase 7: 80% coverage, 0 security failures

## Outcome

- Impact: Created implementation-ready task breakdown with 67 atomic tasks
- Tests: Task format validated, all tasks have prompts and validation criteria
- Files: 1 file created (tasks.md)
- Next prompts: `/sp.implement` to execute tasks, or manually copy prompts to Claude Code
- Reflection: Tasks are atomic, automatable, and organized for parallel execution where possible

## Evaluation notes (flywheel)

- Failure modes observed: None - all tasks properly formatted with prompts
- Graders run and results (PASS/FAIL): Task format validation - PASS
- Prompt variant (if applicable): Full /sp.tasks with 8-phase structure from user input
- Next experiment (smallest change to try): Begin implementation with Phase 1
