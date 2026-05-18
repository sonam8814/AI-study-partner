# AI Study Partner — "The Library"

A free, voice-enabled AI study workspace that helps learners master any topic by switching between four AI personas (Peer, Tutor, Examiner, Feynman), reinforced by streak-based gamification and grounded in the user's own notes via RAG.

## Features

- **4 Study Modes** — Peer (casual study buddy), Tutor (patient instructor), Examiner (quiz mode), Feynman (explain-to-learn)
- **RAG-Powered** — Answers are grounded in your notes with clickable footnote citations
- **Voice Integration** — Speak your answers; Always Listening mode for hands-free study
- **Digital Garden** — Streak-based gamification with growing plants
- **Weak Spots** — Automatically tracks topics you struggle with

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS, Zustand |
| Backend | FastAPI, Python 3.11, sentence-transformers, Groq/Ollama |
| Database | Supabase (PostgreSQL + pgvector + Auth + RLS) |
| Deployment | Vercel (frontend) + Render (backend) |

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11.x
- A [Supabase](https://supabase.com) project (free tier)
- A [Groq](https://groq.com) API key (free tier) OR local [Ollama](https://ollama.ai)

### 1. Clone and Install

```bash
git clone https://github.com/your-org/ai-study-partner.git
cd ai-study-partner
```

### 2. Database Setup

Apply the SQL migrations in order via the Supabase SQL Editor:

```
supabase/migrations/20250101000001_init_schema.sql
supabase/migrations/20250101000002_pgvector.sql
supabase/migrations/20250101000003_rls_policies.sql
supabase/migrations/20250101000004_triggers.sql
supabase/migrations/20250101000005_rpc_functions.sql
```

### 3. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env with your Supabase and Groq credentials

uvicorn app.main:app --reload
```

Backend runs at `http://localhost:8000`. Verify: `GET http://localhost:8000/api/v1/health`

### 4. Frontend Setup

```bash
cd frontend
npm install

cp .env.example .env.local
# Edit .env.local with your Supabase URL and anon key

npm run dev
```

Frontend runs at `http://localhost:3000`.

## Project Structure

```
ai-study-partner/
├── frontend/          # Next.js 14 App Router
├── backend/           # FastAPI + RAG pipeline
├── supabase/          # SQL migrations
├── PRD.md             # Product Requirements Document
├── README.md
└── LICENSE            # MIT
```

## License

MIT
