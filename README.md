# TalentOS — AI-Powered Employee Development Platform

## Tech Stack

**Backend:** FastAPI 0.111 · Python 3.12 · Async SQLAlchemy 2.0 · PostgreSQL (Supabase) · pgvector · Cohere AI · JWT Auth · Alembic · Redis  
**Frontend:** React 18 · Vite · TailwindCSS · Zustand · Recharts · Axios

---

## Prerequisites

- Docker + Docker Compose
- A **Supabase** project with PostgreSQL
- A **Cohere** API key (https://cohere.com — free tier available)

---

## 1. Supabase Setup

### Enable pgvector

In your Supabase SQL Editor, run:

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify
SELECT * FROM pg_extension WHERE extname = 'vector';
```

### Get Connection String

Go to: Supabase Dashboard → Settings → Database → Connection String  
Use the **Transaction** pooler URL (port 6543) for serverless, or **Session** pooler (port 5432) for persistent.

Format: `postgresql://postgres.[project-ref]:[password]@[region].pooler.supabase.com:5432/postgres`

---

## 2. Environment Setup

```bash
# Clone the repo and copy env
cp .env.example .env

# Edit .env with your credentials
nano .env  # or use any editor
```

Required values to set:
```
DATABASE_URL=postgresql://postgres.xxxx:password@aws-0-region.pooler.supabase.com:5432/postgres
JWT_SECRET_KEY=<run: openssl rand -hex 32>
COHERE_API_KEY=<your-cohere-api-key>
```

---

## 3. Run with Docker Compose

```bash
# Build and start all services
docker compose up --build

# Run in background
docker compose up --build -d

# View logs
docker compose logs -f backend
docker compose logs -f frontend
```

Services:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs (only in DEBUG=true mode)
- **Redis**: localhost:6379

---

## 4. Run Locally (without Docker)

### Backend

```bash
cd backend

# Create virtual environment
python3.12 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy env
cp .env.example .env
# Edit .env with your DATABASE_URL and COHERE_API_KEY

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend

npm install

# Start dev server
npm run dev
```

Frontend runs at: http://localhost:5173

---

## 5. Database Migrations

```bash
# Apply all migrations
alembic upgrade head

# Create a new migration
alembic revision --autogenerate -m "describe_your_change"

# Rollback one step
alembic downgrade -1

# View history
alembic history
```

---

## 6. Run Tests

```bash
cd backend
pip install pytest pytest-asyncio
pytest tests/ -v
```

---

## 7. API Examples

### Register
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"Admin123!","full_name":"Admin User","role":"admin"}'
```

### Login
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"Admin123!"}'
```

### Create Employee (requires Bearer token)
```bash
TOKEN="your-access-token"
curl -X POST http://localhost:8000/api/v1/employees \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"john@company.com","password":"Pass123!","full_name":"John Doe","role":"employee"}'
```

### Upload CV
```bash
curl -X POST "http://localhost:8000/api/v1/ai/cv/parse/{employee_id}" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@cv.pdf"
```

### Generate Development Plan
```bash
curl -X POST "http://localhost:8000/api/v1/ai/plan/{employee_id}" \
  -H "Authorization: Bearer $TOKEN"
```

### Chat with AI
```bash
curl -X POST http://localhost:8000/api/v1/ai/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"What skills should I improve?","history":[]}'
```

---

## Architecture Overview

```
talentos/
├── backend/
│   └── app/
│       ├── auth/          # JWT, bcrypt, RBAC
│       ├── models/        # SQLAlchemy ORM (pgvector enabled)
│       ├── routers/       # FastAPI route handlers
│       ├── schemas/       # Pydantic v2 models
│       ├── services/      # Business logic layer
│       └── ai/            # RAG pipeline (Cohere embeddings + LLM)
├── frontend/
│   └── src/
│       ├── api/           # Axios API clients
│       ├── components/    # Reusable UI components
│       ├── pages/         # Route-level page components
│       ├── store/         # Zustand state management
│       └── utils/         # Axios interceptor, helpers
└── docker-compose.yml
```

### Data Flow
```
Request → FastAPI Router → Service Layer → Database
                                        ↓
                              AI Layer (Cohere)
                              ↓
                         pgvector search
                              ↓
                         LLM generation
```

---

## Role Permissions

| Action                    | Admin | Manager | Employee |
|---------------------------|-------|---------|----------|
| View employees            | ✓     | ✓       | ✓        |
| Create/update employees   | ✓     | ✓       | ✗        |
| Delete employees          | ✓     | ✗       | ✗        |
| Submit assessments        | ✓     | ✓       | ✗        |
| View reports              | ✓     | ✓       | own only |
| Company summary           | ✓     | ✗       | ✗        |
| Manage skills             | ✓     | ✗       | ✗        |
| AI features               | ✓     | ✓       | ✓        |
