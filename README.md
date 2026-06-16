# Knowledge Discovery Platform

A minimalist web app that helps you discover interesting Wikipedia articles based on your interests. Think Instagram Reels, but for knowledge.

## Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS, Framer Motion, next-intl (EN/UK/RU)
- **Backend:** Ruby on Rails 7.1 (API mode), PostgreSQL, JWT auth, rack-cors
- **Database:** PostgreSQL (Vercel Postgres / Neon free tier)
- **Deploy:** Vercel (frontend + backend)

## Quick Start (Local)

**Backend:**
```bash
cd backend
bundle install
rails db:create db:migrate db:seed
rails server -p 8000
# API: http://localhost:8000/api/v1
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# App: http://localhost:3000
```

## Deploy to Vercel (Free Tier)

### Backend
1. Push to GitHub
2. Import `backend/` folder as a new Vercel project
3. Framework: **Other** (Vercel detects `config.ru` automatically via `@vercel/ruby`)
4. Add **Vercel Postgres** storage → connects to the project automatically (injects `POSTGRES_URL`)
5. Add environment variables:
   ```
   RAILS_ENV=production
   JWT_SECRET=your-secret-key-min-32-chars
   FRONTEND_URL=https://your-frontend.vercel.app
   ```
6. After first deploy, run migrations:
   ```bash
   vercel env pull && DATABASE_URL=$POSTGRES_URL rails db:migrate db:seed
   ```

### Frontend
1. Import `frontend/` folder as a new Vercel project
2. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.vercel.app/api/v1
   ```

## Environment Variables

### Backend (`backend/.env`)
```env
POSTGRES_URL=postgresql://user:pass@host:5432/dbname
JWT_SECRET=your-secret-key-min-32-chars
FRONTEND_URL=http://localhost:3000
RAILS_ENV=development
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/auth/register` | — | Register new user |
| POST | `/api/v1/auth/login` | — | Login, returns JWT |
| GET | `/api/v1/auth/me` | ✓ | Current user info |
| GET | `/api/v1/articles/feed` | — | Paginated article feed |
| GET | `/api/v1/articles/random` | — | Random Wikipedia articles |
| GET | `/api/v1/articles/search?q=` | — | Search articles |
| GET | `/api/v1/articles/:id` | — | Full article |
| POST | `/api/v1/articles/:id/like` | ✓ | Toggle like |
| POST | `/api/v1/articles/:id/bookmark` | ✓ | Toggle bookmark |
| POST | `/api/v1/articles/:id/share` | ✓ | Record share |
| POST | `/api/v1/articles/:id/not-interested` | ✓ | Dismiss article |

## Features

- Vertical scroll feed (Reels-style) with scroll-snap
- Like, save, dismiss, share articles
- Live Wikipedia article fetching (+ DB cache fallback)
- 3 languages: English, Ukrainian, Russian
- Dark/Light/System theme
- Keyboard shortcuts (L, S, D, Space, Enter)
- Responsive: mobile, tablet, desktop
- JWT authentication (30-day tokens)
