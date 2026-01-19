# Todo App - Backend API

FastAPI backend for the Todo Full-Stack Web Application with JWT authentication.

## Prerequisites

- Python 3.11+
- PostgreSQL (Neon Serverless recommended)

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate  # Windows
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your values
```

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string (with `postgresql+asyncpg://`)
- `JWT_SECRET`: Secret key for JWT verification (must match Better Auth)
- `CORS_ORIGINS`: Comma-separated list of allowed origins

## Running

Development server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Health check |
| GET | /api/todos | List user's todos |
| GET | /api/todos/{id} | Get single todo |
| POST | /api/todos | Create todo |
| PUT | /api/todos/{id} | Update todo |
| PATCH | /api/todos/{id}/toggle | Toggle completion |
| DELETE | /api/todos/{id} | Delete todo |

All `/api/todos` endpoints require Bearer token authentication.

## Project Structure

```
backend/
├── app/
│   ├── auth/
│   │   └── jwt.py         # JWT verification
│   ├── models/
│   │   ├── user.py        # User model
│   │   └── todo.py        # Todo model
│   ├── routers/
│   │   └── todos.py       # Todo API routes
│   ├── schemas/
│   │   └── todo.py        # Pydantic schemas
│   ├── config.py          # Environment config
│   ├── database.py        # DB connection
│   └── main.py            # FastAPI app
└── requirements.txt
```
