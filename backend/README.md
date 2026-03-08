# Knowledge Discovery Platform - Backend

A FastAPI-based backend for a personalized knowledge discovery platform powered by Wikipedia.

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entry point
│   ├── core/
│   │   ├── config.py          # Settings and configuration
│   │   ├── database.py        # SQLAlchemy async engine and session
│   │   └── security.py        # JWT authentication and security
│   ├── models/                # SQLAlchemy ORM models
│   │   ├── user.py           # User model
│   │   ├── article.py        # ArticleCache model
│   │   ├── interaction.py    # Like, Bookmark, Feedback, ReadingHistory, Share models
│   │   └── interest.py       # UserInterest model
│   ├── schemas/              # Pydantic schemas for request/response
│   │   ├── common.py         # Common schemas (CursorParams, PaginatedResponse)
│   │   ├── user.py           # User-related schemas
│   │   └── article.py        # Article-related schemas
│   ├── services/             # Business logic services
│   │   ├── wikipedia.py      # Wikipedia API client with caching
│   │   ├── recommendation.py # Article recommendation engine
│   │   └── article_processor.py  # HTML sanitization, reading time calc, fun facts
│   ├── api/v1/
│   │   ├── router.py         # Main v1 API router
│   │   └── endpoints/
│   │       ├── auth.py       # Authentication endpoints
│   │       ├── users.py      # User management endpoints
│   │       ├── articles.py   # Article browsing endpoints
│   │       ├── interactions.py  # Like, feedback, share endpoints
│   │       ├── bookmarks.py  # Bookmark management endpoints
│   │       └── search.py     # Search endpoints
│   ├── utils/                # Utility functions
│   └── tests/                # Test suite
├── alembic/                  # Database migrations
│   ├── env.py               # Alembic async configuration
│   ├── versions/
│   │   └── 001_initial_schema.py  # Initial database schema
│   └── script.py.mako       # Migration template
├── pyproject.toml           # Python project configuration
└── README.md                # This file
```

## Features

### Authentication & Users
- JWT-based authentication (simplified OAuth for MVP)
- User profiles with preferences (language, reading time, theme)
- User interests/categories tracking

### Article Management
- Wikipedia integration for article discovery
- Article caching with language support
- Full-text article storage (HTML + plain text)
- Reading time estimation
- Fun fact extraction

### Personalization
- Recommendation engine with two modes:
  - **Explore**: Mix of 70% interest-based + 30% random articles
  - **Deepen**: 100% interest-focused recommendations
- Filter by reading time (with ±2 minute tolerance)
- Exclude already-read and marked-not-interested articles
- Featured articles promotion

### User Interactions
- Like/unlike articles
- Bookmark articles
- Mark articles as not interested
- Record reading history (duration, scroll depth)
- Share articles to platforms
- Provide feedback on articles

### Search & Discovery
- Full Wikipedia search integration
- Article discovery by category
- Random article discovery

## Setup & Installation

### Prerequisites
- Python 3.12+
- PostgreSQL 12+
- pip/uv for package management

### 1. Install Dependencies

```bash
pip install -e .
```

Or with uv:
```bash
uv pip install -e .
```

### 2. Environment Setup

Create a `.env` file in the backend directory:

```env
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/knowledge_platform
JWT_SECRET=your-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=1440
CORS_ORIGINS=["http://localhost:3000"]
DEFAULT_LANGUAGE=en
SUPPORTED_LANGUAGES=["en", "uk", "ru"]
```

### 3. Database Setup

Initialize the database:

```bash
# Create the database (if not exists)
createdb knowledge_platform

# Run migrations
alembic upgrade head
```

### 4. Run the Application

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

- API Documentation: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- Health Check: `http://localhost:8000/health`

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Login/create user
- `POST /api/v1/auth/refresh` - Refresh JWT token

### Users
- `GET /api/v1/users/me` - Get current user profile (requires auth)
- `PATCH /api/v1/users/me` - Update user profile (requires auth)
- `PUT /api/v1/users/me/interests` - Update user interests (requires auth)

### Articles
- `GET /api/v1/articles/feed` - Get personalized article feed
  - Query params: `mode` (explore/deepen), `reading_time`, `lang`, `limit`, `cursor`
- `GET /api/v1/articles/{id}` - Get full article details
- `GET /api/v1/articles/random` - Get random articles

### Interactions
- `POST /api/v1/articles/{id}/like` - Like/unlike article (requires auth)
- `DELETE /api/v1/articles/{id}/like` - Remove like (requires auth)
- `POST /api/v1/articles/{id}/not-interested` - Mark as not interested (requires auth)
- `POST /api/v1/articles/{id}/share` - Record share event (requires auth)

### Bookmarks
- `GET /api/v1/bookmarks` - List user's bookmarks (requires auth)
- `POST /api/v1/bookmarks` - Add bookmark (requires auth)
- `DELETE /api/v1/bookmarks/{article_id}` - Remove bookmark (requires auth)

### Search
- `GET /api/v1/search` - Search Wikipedia articles
  - Query params: `q` (search query), `lang`, `limit`

## Models

### User
- `id` (UUID, PK)
- `email` (unique)
- `name`
- `avatar_url`
- `provider` (google, github, local)
- `preferred_language` (en, uk, ru)
- `ui_language` (en, uk, ru)
- `preferred_reading_time` (minutes)
- `theme` (light, dark, auto)
- `created_at`

### ArticleCache
- `id` (UUID, PK)
- `wikipedia_id` (unique per language)
- `title`
- `extract` (plain text intro)
- `full_content` (HTML)
- `language`
- `category`
- `reading_time_minutes`
- `is_featured`
- `image_url`
- `cached_at`

### ArticleLike, Bookmark
- `id` (UUID, PK)
- `user_id` (FK)
- `article_id` (FK)
- `created_at`
- Unique constraint on (user_id, article_id)

### ArticleFeedback
- `id` (UUID, PK)
- `user_id` (FK)
- `article_id` (FK)
- `feedback` (like, not_interested)
- `created_at`

### ReadingHistory
- `id` (UUID, PK)
- `user_id` (FK)
- `article_id` (FK)
- `started_at`
- `finished_at` (nullable)
- `reading_duration_seconds`
- `scroll_depth_percent`

### ArticleShare
- `id` (UUID, PK)
- `user_id` (FK)
- `article_id` (FK)
- `platform` (twitter, facebook, email, etc.)
- `created_at`

### UserInterest
- `id` (UUID, PK)
- `user_id` (FK)
- `category_name`
- `weight` (default 1.0)
- `created_at`
- Unique constraint on (user_id, category_name)

## Services

### WikipediaClient
Async HTTP client for Wikipedia API with in-memory LRU cache (1-hour TTL).

Methods:
- `get_random_articles(lang, count)` - Get random articles
- `get_articles_by_category(category, lang, limit)` - Get articles from category
- `get_article_full(page_id, lang)` - Get full HTML content
- `search_articles(query, lang, limit)` - Search articles

### RecommendationEngine
Personalized article recommendation with smart filtering.

Methods:
- `get_feed(user_id, lang, mode, reading_time, cursor, limit, db)` - Get feed

### ArticleProcessor
Content processing utilities.

Functions:
- `sanitize_html(html)` - Clean HTML with bleach
- `calculate_reading_time(text)` - Estimate reading time (words/200)
- `extract_fun_fact(text)` - Extract interesting sentence

## Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. User logs in via `POST /api/v1/auth/login`
2. Server returns a JWT token
3. Client includes token in `Authorization: Bearer <token>` header
4. Optional authentication - endpoints that require auth raise 401 if no token

## Database Migrations

Use Alembic to manage database schema:

```bash
# Generate new migration
alembic revision --autogenerate -m "Add new column"

# Apply migrations
alembic upgrade head

# Revert last migration
alembic downgrade -1

# View migration history
alembic history
```

## Configuration

Settings are managed via Pydantic BaseSettings and can be loaded from:
1. Environment variables
2. `.env` file
3. Code defaults

See `app/core/config.py` for all available settings.

## Development

### Running Tests
```bash
pytest app/tests/
```

### Code Linting
```bash
ruff check app/
```

### Code Formatting
```bash
ruff format app/
```

## Production Deployment

1. Set strong `JWT_SECRET` environment variable
2. Update `CORS_ORIGINS` for your frontend domain
3. Use PostgreSQL with proper backups
4. Use a production ASGI server (gunicorn with uvicorn workers)
5. Enable HTTPS/TLS
6. Set up monitoring and logging

Example production run:
```bash
gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## Performance Considerations

- Article cache has TTL of 1 hour in Wikipedia client
- Database uses indexes on frequently filtered columns
- Recommend using PostgreSQL connection pooling (PgBouncer)
- Consider Redis for session management at scale
- Reading history can be archived periodically

## License

MIT
