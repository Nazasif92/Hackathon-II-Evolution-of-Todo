# Quickstart Guide: Backend REST API

**Feature**: 002-backend-api
**Created**: 2026-01-12

## Prerequisites

- Python 3.11+
- pip (Python package manager)
- Neon PostgreSQL account with database created
- JWT secret key (shared with frontend Better Auth)

## Setup Steps

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Create Virtual Environment

```bash
python -m venv venv

# Linux/macOS
source venv/bin/activate

# Windows
.\venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Database
DATABASE_URL=postgresql+asyncpg://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require

# JWT Configuration
JWT_SECRET=your-shared-secret-with-frontend
JWT_ALGORITHM=HS256

# CORS
CORS_ORIGINS=http://localhost:3000
```

### 5. Start the Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 6. Verify Setup

**Health Check**:
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{"status": "healthy", "timestamp": "2026-01-12T10:00:00Z"}
```

**API Documentation**:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Testing Endpoints

### Get All Todos (requires JWT)

```bash
curl -X GET http://localhost:8000/api/todos \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create Todo

```bash
curl -X POST http://localhost:8000/api/todos \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test todo", "description": "Test description"}'
```

### Toggle Todo

```bash
curl -X PATCH http://localhost:8000/api/todos/1/toggle \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update Todo

```bash
curl -X PUT http://localhost:8000/api/todos/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated title"}'
```

### Delete Todo

```bash
curl -X DELETE http://localhost:8000/api/todos/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry
│   ├── config.py            # Environment configuration
│   ├── database.py          # Database connection setup
│   ├── auth/
│   │   ├── __init__.py
│   │   └── jwt.py           # JWT verification dependency
│   ├── models/
│   │   ├── __init__.py
│   │   └── todo.py          # SQLModel Todo table
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── todo.py          # Pydantic request/response schemas
│   └── routers/
│       ├── __init__.py
│       └── todos.py         # Todo CRUD endpoints
├── tests/
│   └── __init__.py
├── requirements.txt
├── .env.example
└── README.md
```

## Common Issues

### Database Connection Error

**Error**: `connection refused` or `timeout`

**Solution**:
1. Check DATABASE_URL format includes `+asyncpg` driver
2. Ensure SSL mode is enabled (`?sslmode=require`)
3. Verify Neon project is active (not suspended)

### JWT Verification Failed

**Error**: `401 Unauthorized - Invalid token`

**Solution**:
1. Verify JWT_SECRET matches frontend Better Auth configuration
2. Check token is not expired
3. Ensure Authorization header format: `Bearer <token>`

### CORS Error

**Error**: `Cross-Origin Request Blocked`

**Solution**:
1. Add frontend URL to CORS_ORIGINS in .env
2. Restart backend server after changing .env
