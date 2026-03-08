# Knowledge Discovery Platform

A minimalist web app that helps you discover interesting Wikipedia articles based on your interests. Think Instagram Reels, but for knowledge.

## Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS, Framer Motion, next-intl (EN/UK/RU)
- **Backend:** Python 3.12, FastAPI, SQLAlchemy 2.0 (async), Alembic
- **Database:** PostgreSQL (Neon free tier for production)
- **Deploy:** Vercel (frontend) + Render (backend)

## Quick Start

### Option 1: Docker (recommended)
```bash
docker-compose up -d
# Frontend: http://localhost:3000
# Backend: http://localhost:8000/docs
```

### Option 2: Manual

**Backend:**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -e ".[dev]"
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Deploy (Free Tier)

1. **Database:** Create free PostgreSQL on [Neon](https://neon.tech)
2. **Backend:** Deploy to [Render](https://render.com) — connect GitHub, set env vars
3. **Frontend:** Deploy to [Vercel](https://vercel.com) — connect GitHub, set `NEXT_PUBLIC_API_URL`

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/dbname
JWT_SECRET=your-secret-key
CORS_ORIGINS=["https://your-frontend.vercel.app"]
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

## Features

- Vertical scroll feed (Reels-style) with scroll-snap
- Like, save, dismiss, share articles
- Personalized recommendations based on interests
- 3 languages: English, Ukrainian, Russian
- Dark/Light theme
- Keyboard shortcuts (L, S, D, Space, Enter)
- Responsive: mobile, tablet, desktop
- Minimalist design with clean typography
