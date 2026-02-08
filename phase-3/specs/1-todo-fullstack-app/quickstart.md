# Quickstart: Todo Full-Stack Web Application

**Date**: 2026-01-12
**Branch**: `1-todo-fullstack-app`
**Purpose**: Step-by-step guide to run the application locally

## Prerequisites

Before starting, ensure you have:

- [ ] **Node.js** 20+ installed (`node --version`)
- [ ] **Python** 3.11+ installed (`python --version`)
- [ ] **Git** installed (`git --version`)
- [ ] **Neon PostgreSQL** account and database created
- [ ] **Terminal** access (bash, zsh, or PowerShell)

## Quick Start (5 minutes)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd phase-2
```

### 2. Set Up Environment Variables

#### Backend (.env)

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```bash
# Neon PostgreSQL connection string
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require

# JWT secret - MUST match frontend BETTER_AUTH_SECRET
JWT_SECRET=your-super-secret-key-at-least-32-characters-long

# CORS - frontend URL
CORS_ORIGINS=http://localhost:3000
```

#### Frontend (.env.local)

```bash
cd ../frontend
cp .env.example .env.local
```

Edit `frontend/.env.local`:
```bash
# Better Auth configuration
BETTER_AUTH_SECRET=your-super-secret-key-at-least-32-characters-long
BETTER_AUTH_URL=http://localhost:3000

# Database for Better Auth sessions
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**IMPORTANT**: `JWT_SECRET` and `BETTER_AUTH_SECRET` MUST be identical!

### 3. Install Dependencies

#### Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

#### Frontend

```bash
cd frontend
npm install
```

### 4. Initialize Database

```bash
cd backend
python -m app.database init
# Or run migrations if using Alembic
```

### 5. Start the Application

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 6. Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## Verification Checklist

Run through these steps to verify the application works:

### Authentication
- [ ] Navigate to http://localhost:3000
- [ ] You should be redirected to the signin page
- [ ] Click "Sign up" and create a new account
- [ ] You should be redirected to the todos dashboard

### Todo Operations
- [ ] Create a new todo with a title
- [ ] The todo appears in the list
- [ ] Click the checkbox to mark it complete
- [ ] Edit the todo title
- [ ] Delete the todo

### User Isolation
- [ ] Sign out
- [ ] Create a second account with different email
- [ ] Verify you don't see the first user's todos
- [ ] Create a todo with the second account
- [ ] Sign out and sign in with first account
- [ ] Verify you only see the first user's todos

### Data Persistence
- [ ] Create a todo
- [ ] Refresh the page (F5)
- [ ] Todo still appears
- [ ] Sign out and sign in again
- [ ] Todo still appears

## Troubleshooting

### "Invalid or expired token" error

**Cause**: JWT_SECRET mismatch between frontend and backend

**Solution**: Ensure both `.env` files have identical secret values:
```bash
# Check frontend
grep BETTER_AUTH_SECRET frontend/.env.local

# Check backend
grep JWT_SECRET backend/.env

# They must match!
```

### "CORS error" in browser console

**Cause**: Backend not allowing frontend origin

**Solution**: Update `CORS_ORIGINS` in `backend/.env`:
```bash
CORS_ORIGINS=http://localhost:3000
```

### "Connection refused" when accessing API

**Cause**: Backend not running or wrong port

**Solution**:
1. Verify backend is running: `curl http://localhost:8000/health`
2. Check frontend API URL: `NEXT_PUBLIC_API_URL=http://localhost:8000`

### Database connection errors

**Cause**: Invalid Neon connection string or network issues

**Solution**:
1. Verify DATABASE_URL format includes `?sslmode=require`
2. Check Neon dashboard for correct connection string
3. Ensure your IP is allowed (Neon → Settings → IP Allow)

### "Module not found" errors

**Cause**: Dependencies not installed

**Solution**:
```bash
# Backend
cd backend && pip install -r requirements.txt

# Frontend
cd frontend && npm install
```

## Project Structure

```
phase-2/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI entry point
│   │   ├── config.py        # Environment config
│   │   ├── database.py      # Neon connection
│   │   ├── models/          # SQLModel models
│   │   ├── routers/         # API endpoints
│   │   ├── auth/            # JWT verification
│   │   └── schemas/         # Pydantic schemas
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── app/                 # Next.js App Router
│   ├── components/          # React components
│   ├── lib/                 # Auth & API clients
│   ├── package.json
│   └── .env.example
│
└── specs/                   # Documentation
    └── 1-todo-fullstack-app/
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Health check |
| GET | /api/todos | List user's todos |
| POST | /api/todos | Create todo |
| GET | /api/todos/{id} | Get single todo |
| PUT | /api/todos/{id} | Update todo |
| DELETE | /api/todos/{id} | Delete todo |
| PATCH | /api/todos/{id}/toggle | Toggle completion |

All `/api/todos/*` endpoints require `Authorization: Bearer <token>` header.

## Next Steps

After verifying the quickstart:

1. Review the [spec.md](./spec.md) for full requirements
2. Review the [plan.md](./plan.md) for implementation details
3. Review the [contracts/openapi.yaml](./contracts/openapi.yaml) for API spec
4. Run `/sp.tasks` to generate implementation tasks
