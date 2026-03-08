# Quick Setup Guide

## Prerequisites

- Python 3.12+
- PostgreSQL 12+
- pip or uv

## Installation Steps

### 1. Install Dependencies

```bash
cd backend/
pip install -e .
```

Or with uv:
```bash
uv pip install -e .
```

### 2. Configure Database

Create `.env` file:
```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/knowledge_platform
JWT_SECRET=your-super-secret-key-change-in-production
```

### 3. Create Database

```bash
createdb knowledge_platform
```

Or via PostgreSQL client:
```sql
CREATE DATABASE knowledge_platform;
```

### 4. Run Migrations

```bash
alembic upgrade head
```

This creates all 8 tables with indexes and constraints.

### 5. Start the Server

```bash
uvicorn app.main:app --reload
```

Server will be available at:
- API: `http://localhost:8000/api/v1`
- Docs: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- Health: `http://localhost:8000/health`

## Testing the API

### 1. Login

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "provider": "local"
  }'
```

Save the `access_token` from the response.

### 2. Use Token

```bash
TOKEN="your_token_here"

# Get profile
curl -X GET http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer $TOKEN"

# Set interests
curl -X PUT http://localhost:8000/api/v1/users/me/interests \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "interests": ["Science", "Technology", "History"]
  }'

# Get personalized feed
curl -X GET "http://localhost:8000/api/v1/articles/feed?mode=explore&reading_time=5" \
  -H "Authorization: Bearer $TOKEN"
```

## Project Structure

```
backend/
├── app/
│   ├── core/          # Configuration, database, security
│   ├── models/        # SQLAlchemy ORM models
│   ├── schemas/       # Pydantic request/response schemas
│   ├── services/      # Business logic (Wikipedia, recommendations, etc)
│   ├── api/v1/        # API endpoints
│   ├── utils/         # Utility functions
│   ├── tests/         # Test suite
│   └── main.py        # FastAPI app entry point
├── alembic/           # Database migrations
├── pyproject.toml     # Project configuration
└── README.md          # Detailed documentation
```

## Key Files

- **Configuration**: `app/core/config.py`
- **Database Models**: `app/models/`
- **API Endpoints**: `app/api/v1/endpoints/`
- **Services**: `app/services/`
  - `wikipedia.py` - Wikipedia API client
  - `recommendation.py` - Article recommendation engine
  - `article_processor.py` - Content processing
- **Database Migrations**: `alembic/versions/001_initial_schema.py`

## Important Features

### Authentication
- JWT-based with Bearer tokens
- Optional authentication (public endpoints don't require auth)
- Token expiry: 24 hours (configurable)

### Recommendations
- **Explore mode**: Mix of 70% user interests + 30% random
- **Deepen mode**: 100% from user interests
- Filters out already-read and marked-not-interested articles
- Reading time matching with tolerance

### Multi-language Support
- English (en)
- Ukrainian (uk)
- Russian (ru)

### Database
- PostgreSQL with asyncpg
- 8 tables with proper relationships
- Indexes on frequently used columns
- Unique constraints to prevent duplicates

## API Overview

20 endpoints across 6 categories:

**Authentication** (2 endpoints)
- Login / Register
- Token refresh

**Users** (3 endpoints)
- Get profile
- Update profile
- Set interests

**Articles** (3 endpoints)
- Get personalized feed
- Get article details
- Get random articles

**Interactions** (4 endpoints)
- Like/unlike
- Mark not interested
- Share article
- See share count

**Bookmarks** (3 endpoints)
- List bookmarks
- Add bookmark
- Remove bookmark

**Search** (1 endpoint)
- Search Wikipedia

**System** (2 endpoints)
- Health check
- API docs

## Environment Variables

All settings in `app/core/config.py`:

```python
DATABASE_URL              # PostgreSQL connection
JWT_SECRET               # Secret key for JWT tokens
JWT_ALGORITHM            # HS256 (default)
JWT_EXPIRATION_MINUTES   # Token lifetime (1440 = 24h)
CORS_ORIGINS             # Allowed frontend domains
DEFAULT_LANGUAGE         # Default language (en)
SUPPORTED_LANGUAGES      # Available languages list
```

## Production Deployment

### 1. Set Strong JWT Secret
```bash
export JWT_SECRET=$(openssl rand -hex 32)
```

### 2. Use Production Database
```bash
export DATABASE_URL=postgresql+asyncpg://user:pass@prod-db:5432/knowledge_platform
```

### 3. Set CORS Origins
```bash
export CORS_ORIGINS='["https://yourdomain.com"]'
```

### 4. Run with Production Server
```bash
gunicorn app.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000
```

### 5. Enable HTTPS
Use NGINX as reverse proxy with SSL/TLS

## Monitoring

### Logs
```bash
# View application logs
tail -f app.log

# View database logs
tail -f /var/log/postgresql/postgresql.log
```

### Health Check
```bash
curl http://localhost:8000/health
```

Response:
```json
{
  "status": "ok"
}
```

## Troubleshooting

### Database Connection Error
```
psycopg3.OperationalError: could not connect to server
```

Solution:
1. Check PostgreSQL is running
2. Verify DATABASE_URL is correct
3. Check database exists: `createdb knowledge_platform`

### JWT Secret Not Set
```
ValueError: JWT_SECRET not configured
```

Solution:
```bash
export JWT_SECRET=your-secret-key
```

### Import Errors
```
ModuleNotFoundError: No module named 'fastapi'
```

Solution:
```bash
pip install -e .
```

### CORS Issues
```
Access to XMLHttpRequest blocked by CORS policy
```

Solution:
Update `CORS_ORIGINS` in `.env` to include your frontend URL:
```env
CORS_ORIGINS=["http://localhost:3000", "https://yourdomain.com"]
```

## Next Steps

1. Start the server: `uvicorn app.main:app --reload`
2. Open API docs: `http://localhost:8000/docs`
3. Try the API with cURL or Postman
4. See `API_GUIDE.md` for detailed endpoint examples
5. See `ARCHITECTURE.md` for system design details

## Support

For issues:
1. Check `README.md` for overview
2. Check `API_GUIDE.md` for endpoint details
3. Check `ARCHITECTURE.md` for system design
4. Review error messages in server logs

Good luck!
