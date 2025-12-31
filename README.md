# SynapseDigest - Automated AI & Tech News SaaS

A fully automated, constantly refreshing web application that displays daily news, research updates, and developments in AI, CS, and Software Engineering.

## Architecture
- **Frontend**: Next.js (App Router), Tailwind CSS
- **Backend**: FastAPI (Python), SQLAlchemy
- **Database**: PostgreSQL
- **AI**: Google Gemini (Summarization & Categorization)
- **Automation**: GitHub Actions (Daily Cron)

## 🚀 Getting Started

### Prerequisites
- Node.js & npm
- Python 3.10+
- PostgreSQL Database (Local or Cloud like Supabase/Neon)
- Google Gemini API Key (Free)

### 1. Backend Setup

```bash
cd backend
# Create virtual env
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Install deps
pip install -r requirements.txt

# Setup Env Vars
# Create .env file or export vars:
export DATABASE_URL="postgresql://user:pass@localhost:5432/dbname"
export GEMINI_API_KEY="your-gemini-key"

# Initialize DB
# You can run the ingestion script to create tables (models creates them if using create_all, 
# but we provided schema.sql. Best to run schema.sql in DB first).
psql $DATABASE_URL -f database/schema.sql

# Run Server
uvicorn app.main:app --reload
```

### 2. Frontend Setup

```bash
cd frontend
# Install deps (if not already)
npm install

# Setup Env (Optional if defaults work)
# Create .env.local
# NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# Run Dev Server
npm run dev
```

Visit `http://localhost:3000` to see the app.

## ☁️ Deployment Guide (Free Tier)

### Database: Supabase
1. Create a free project on Supabase.
2. Go to **SQL Editor** and paste the content of `backend/database/schema.sql`. Run it.
3. Get the **Connection String** (Transaction pooler recommended, port 6543 or 5432).

### Backend: Render / Railway
1. **Render**: Create New Web Service -> Connect Repo.
2. Root Directory: `backend`.
3. Build Command: `pip install -r requirements.txt`.
4. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
5. Add Environment Variables: `DATABASE_URL`, `GEMINI_API_KEY`.

### Frontend: Vercel
1. Import Git Repository.
2. Framework Preset: Next.js.
3. Root Directory: `frontend`.
4. Environment Variables: `NEXT_PUBLIC_API_URL` -> URL of your deployed Backend (e.g., `https://algo-news-backend.onrender.com/api/v1`).
5. Deploy.

### Automation: GitHub Actions
1. Go to Repo Settings -> Secrets and Variables -> Actions.
2. Add Repository Secrets:
   - `DATABASE_URL` (Same as backend)
   - `GEMINI_API_KEY`
3. The workflow `.github/workflows/daily_ingest.yml` will run automatically every day at 08:00 UTC.
4. You can manually trigger it from the "Actions" tab to test.

## License
MIT
