<!--
  SYNC IMPACT REPORT
  ===================
  Version change: N/A (initial) → 1.0.0

  Added Principles:
  - I. Functionality - All 5 basic level features implemented correctly
  - II. Security - JWT-based authentication and user isolation enforced
  - III. Modularity - Frontend, backend, and database layers clearly separated
  - IV. Reproducibility - Application can be deployed and tested by following spec
  - V. Usability - Responsive frontend interface and clear user experience

  Added Sections:
  - Key Standards (technology stack requirements)
  - Constraints (development workflow constraints)
  - Success Criteria (measurable outcomes)
  - Governance (amendment and compliance rules)

  Removed Sections:
  - [PRINCIPLE_6_NAME] - User provided 5 principles only

  Templates Status:
  - .specify/templates/plan-template.md ✅ Compatible (Constitution Check section exists)
  - .specify/templates/spec-template.md ✅ Compatible (Success Criteria section aligns)
  - .specify/templates/tasks-template.md ✅ Compatible (Phase structure aligns)

  Follow-up TODOs: None
-->

# Todo Full-Stack Web Application Constitution

## Core Principles

### I. Functionality

All 5 basic level features MUST be implemented correctly as a web application:

- Complete CRUD operations for todo items (Create, Read, Update, Delete)
- List all todos with proper filtering by authenticated user
- Mark todos as complete/incomplete
- Search/filter todos functionality
- Persistent storage across sessions

**Rationale**: The hackathon evaluation requires all basic features working correctly. Partial implementations fail the core objective.

### II. Security

JWT-based authentication and user isolation MUST be enforced at all system boundaries:

- User signup/signin via Better Auth with JWT token issuance
- All API requests MUST include valid JWT in `Authorization: Bearer <token>` header
- Backend MUST verify JWT signature before processing any request
- Todo data MUST be filtered by authenticated user ID - users can ONLY access their own todos
- Secrets (BETTER_AUTH_SECRET, JWT_SECRET, DATABASE_URL) MUST use environment variables
- No hardcoded credentials permitted in source code

**Rationale**: Multi-user applications require strict data isolation. Security vulnerabilities disqualify the submission.

### III. Modularity

Frontend, backend, and database layers MUST be clearly separated:

- **Frontend**: Next.js 16+ with App Router - handles UI, client-side state, auth flows
- **Backend**: Python FastAPI - handles business logic, API endpoints, JWT verification
- **Database**: Neon Serverless PostgreSQL with SQLModel ORM - handles data persistence
- Each layer MUST communicate via well-defined interfaces (REST API, SQL)
- No direct database access from frontend
- No frontend rendering logic in backend

**Rationale**: Clean separation enables independent development, testing, and scaling of each layer.

### IV. Reproducibility

Application MUST be deployable and testable by following the specification:

- All dependencies documented in `requirements.txt` (backend) and `package.json` (frontend)
- Environment variable templates provided (`.env.example` files)
- Database schema migrations included and runnable
- README with step-by-step setup instructions
- No machine-specific paths or configurations

**Rationale**: Judges must be able to clone, configure, and run the application without additional guidance.

### V. Usability

Responsive frontend interface and clear user experience MUST be provided:

- Mobile-first responsive design using Tailwind CSS
- Clear visual feedback for all user actions (loading states, success/error messages)
- Intuitive navigation between auth pages and todo dashboard
- Form validation with helpful error messages
- Accessible UI following basic WCAG guidelines

**Rationale**: User experience directly impacts perceived quality and hackathon scoring.

## Key Standards

### Technology Stack (Non-Negotiable)

| Layer          | Technology                    | Version/Notes          |
|----------------|-------------------------------|------------------------|
| Frontend       | Next.js (App Router)          | 16+                    |
| Backend        | Python FastAPI                | Latest stable          |
| ORM            | SQLModel                      | Latest stable          |
| Database       | Neon Serverless PostgreSQL    | Serverless tier        |
| Styling        | Tailwind CSS                  | Latest stable          |
| Authentication | Better Auth                   | JWT integration        |
| Spec-Driven    | Claude Code + Spec-Kit Plus   | Agentic workflow       |

### Implementation Standards

- RESTful API endpoints MUST follow standard HTTP methods (GET, POST, PUT, DELETE)
- All API responses MUST use proper HTTP status codes (200, 201, 400, 401, 404, 500)
- Request/response bodies MUST use JSON format
- Error responses MUST include descriptive messages
- API endpoints MUST validate input using Pydantic models
- Database queries MUST use parameterized statements (SQLModel handles this)

## Constraints

### Development Workflow

- MUST use Agentic Dev Stack: Write spec → Generate plan → Break into tasks → Implement via Claude Code
- No manual coding allowed - all code generated through Claude Code agents
- Frontend and backend MUST communicate securely via JWT tokens
- Database schema MUST support multi-user persistent storage with user_id foreign keys
- All todo queries MUST filter by authenticated user_id

### Architecture Constraints

- Frontend runs on port 3000 (default Next.js)
- Backend runs on port 8000 (default FastAPI)
- CORS configured to allow frontend origin only
- JWT secret shared between Better Auth (frontend) and FastAPI (backend)
- Database connection pooling enabled for Neon serverless

## Success Criteria

### Functional Verification

- [ ] User can sign up with email and password
- [ ] User can sign in and receive JWT token
- [ ] User can create new todo items
- [ ] User can view list of their own todos only
- [ ] User can update todo title/description/status
- [ ] User can delete todo items
- [ ] User can mark todos as complete/incomplete
- [ ] Todo data persists across browser sessions
- [ ] User A cannot see or modify User B's todos

### Technical Verification

- [ ] JWT token included in all API requests after login
- [ ] Backend rejects requests without valid JWT (401 Unauthorized)
- [ ] Backend rejects requests for other users' todos (403 Forbidden)
- [ ] API returns proper HTTP status codes for all scenarios
- [ ] Frontend displays loading states during API calls
- [ ] Frontend displays error messages for failed operations
- [ ] Application works on mobile viewport sizes
- [ ] Environment variables used for all secrets

### Deployment Verification

- [ ] Application can be started with documented commands
- [ ] Database migrations run successfully
- [ ] Both frontend and backend start without errors
- [ ] End-to-end flow works (signup → login → CRUD → logout)

## Governance

### Amendment Procedure

1. Proposed changes MUST be documented with rationale
2. Changes affecting Core Principles require explicit approval
3. All amendments MUST update the version number following semver
4. LAST_AMENDED_DATE MUST be updated to current date

### Versioning Policy

- **MAJOR**: Breaking changes to principles or removal of requirements
- **MINOR**: New principles, sections, or materially expanded guidance
- **PATCH**: Clarifications, typo fixes, non-semantic refinements

### Compliance Review

- All PRs MUST verify alignment with Core Principles
- Constitution Check in plan.md MUST pass before implementation
- Security principle violations block merge
- Complexity additions MUST be justified in Complexity Tracking section

**Version**: 1.0.0 | **Ratified**: 2026-01-12 | **Last Amended**: 2026-01-12
