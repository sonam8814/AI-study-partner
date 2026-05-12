# How to Set Up AI Study Partner (The Library)

This guide will walk you through setting up the project on your own computer. No prior experience needed — just follow the steps.

---

## What You'll Need

Before starting, make sure you have these installed:

- **Node.js** (version 18 or newer) — [Download here](https://nodejs.org)
- **Python 3.11** — [Download here](https://www.python.org/downloads/)
- **Git** — [Download here](https://git-scm.com/downloads)

You'll also need to create free accounts on:

- **Supabase** (our database) — [supabase.com](https://supabase.com)
- **Ollama** (runs AI locally on your computer) — [ollama.com](https://ollama.com)
  - OR **Groq** (runs AI in the cloud, also free) — [groq.com](https://groq.com)

---

## Step 1: Clone the Project

Open your terminal and run:

```bash
git clone https://github.com/your-username/ai-study-partner.git
cd ai-study-partner
```

---

## Step 2: Set Up Supabase (Database)

### 2a. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Give it any name (e.g. "ai-study-partner")
4. Choose a password and a region close to you
5. Click **Create new project** and wait for it to finish

### 2b. Run the Database Setup

We need to create the tables and functions the app uses.

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Open each file below (from the `supabase/migrations/` folder in the project), copy its contents, paste into the SQL Editor, and click **Run**. Do them **in this order**:

   ```
   1. 20250101000001_init_schema.sql
   2. 20250101000002_pgvector.sql
   3. 20250101000003_rls_policies.sql
   4. 20250101000004_triggers.sql
   5. 20250101000005_rpc_functions.sql
   ```

### 2c. Get Your Supabase Keys

You'll need 3 things from Supabase. Go to **Settings > API** in your dashboard:

| What | Where to find it | Used in |
|------|-----------------|---------|
| **Project URL** | Top of the API page | Both frontend and backend |
| **anon (public) key** | Under "Project API keys" | Frontend only |
| **service_role (secret) key** | Under "Project API keys" (click reveal) | Backend only |

Keep these handy for the next steps.

---

## Step 3: Set Up the AI (Choose One)

### Option A: Ollama (Runs on Your Computer — Recommended)

1. Download and install Ollama from [ollama.com](https://ollama.com)
2. Open a terminal and download the AI model:

   ```bash
   ollama pull llama3
   ```

3. That's it! Ollama runs in the background automatically.

### Option B: Groq (Runs in the Cloud)

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up and go to **API Keys**
3. Create a new key and copy it — you'll need it later

---

## Step 4: Set Up the Backend

Open a terminal in the project folder:

```bash
cd backend
```

### 4a. Create a Virtual Environment

```bash
python3 -m venv venv
```

### 4b. Activate It

On Mac/Linux:
```bash
source venv/bin/activate
```

On Windows:
```bash
venv\Scripts\activate
```

You should see `(venv)` at the start of your terminal line.

### 4c. Install Dependencies

```bash
pip install -r requirements.txt
```

This will take a few minutes (it downloads the AI embedding model too).

### 4d. Set Up Environment Variables

```bash
cp .env.example .env
```

Now open the `.env` file in any text editor and fill in your values:

```env
# Paste your Supabase Project URL here
SUPABASE_URL=https://your-project-id.supabase.co

# Paste your service_role key here (the secret one, NOT the anon key)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# If using Ollama (recommended):
LLM_PROVIDER=ollama
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3:latest

# If using Groq instead, change these:
# LLM_PROVIDER=groq
# GROQ_API_KEY=your-groq-key-here

# Leave the rest as default
```

### 4e. Start the Backend

```bash
uvicorn app.main:app --reload
```

You should see something like:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

To check it's working, open your browser and go to:
```
http://localhost:8000/api/v1/health
```

You should see `{"status": "ok", ...}`.

**Keep this terminal open** and open a new terminal for the next step.

---

## Step 5: Set Up the Frontend

In a new terminal, from the project folder:

```bash
cd frontend
```

### 5a. Install Dependencies

```bash
npm install
```

### 5b. Set Up Environment Variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Note: Use the **anon (public)** key here, NOT the service_role key.

### 5c. Start the Frontend

```bash
npm run dev
```

You should see:
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

---

## Step 6: Open the App

Go to **http://localhost:3000** in your browser. You should see the login page.

1. Create an account (email + password)
2. Check your email for the confirmation link
3. Log in and start studying!

---

## Quick Summary

When you want to use the app, you need **3 things running**:

| What | How to start | Terminal |
|------|-------------|----------|
| Ollama (if using) | It runs automatically after install | — |
| Backend | `cd backend && source venv/bin/activate && uvicorn app.main:app --reload` | Terminal 1 |
| Frontend | `cd frontend && npm run dev` | Terminal 2 |

Then open **http://localhost:3000** in your browser.

---

## Troubleshooting

**"Cannot connect to backend" or API errors**
- Make sure the backend is running on port 8000
- Check that your `.env` file has the correct Supabase keys

**"model not found" error**
- If using Ollama, make sure you ran `ollama pull llama3`
- Check that `OLLAMA_MODEL` in your `.env` matches the model you downloaded

**"Invalid API key" error**
- Double check your `SUPABASE_SERVICE_ROLE_KEY` in `backend/.env`
- Make sure you copied the **service_role** key (not the anon key)

**Login not working**
- Make sure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct in `frontend/.env.local`
- Check your email for the confirmation link after signing up

**Stuck on loading / blank page**
- Make sure both backend (port 8000) and frontend (port 3000) are running
- Open browser dev tools (F12) > Console to see any errors

---

## Project Folder Structure

```
ai-study-partner/
├── frontend/          # The website (what you see in the browser)
├── backend/           # The server (handles AI, database, etc.)
├── supabase/          # Database setup files
├── PRD.md             # Product requirements doc
├── SETUP.md           # This file
└── README.md          # Project overview
```
