# Backend Architecture

## Overview

The Knowledge Discovery Platform backend is built with FastAPI and follows a clean, layered architecture:

```
┌─────────────────────────────────────────────────────┐
│                   API Layer                          │
│  (FastAPI Endpoints + HTTP Request Handling)        │
├─────────────────────────────────────────────────────┤
│              Business Logic Layer                    │
│  (Services: Recommendation, Wikipedia, Processing)  │
├─────────────────────────────────────────────────────┤
│              Data Access Layer                       │
│  (Models: SQLAlchemy ORM, Schemas: Pydantic)       │
├─────────────────────────────────────────────────────┤
│          Infrastructure Layer                       │
│  (Database, Security, Configuration, Cache)        │
└─────────────────────────────────────────────────────┘
```

## Layer Breakdown

### 1. API Layer (`app/api/`)

**Responsibility**: Handle HTTP requests and responses

**Components**:
- `/v1/router.py` - Main API router combining all endpoint routers
- `/v1/endpoints/` - Individual endpoint modules

**Endpoints**:

| Module | Purpose |
|--------|---------|
| `auth.py` | User login and token management |
| `users.py` | User profile and preferences |
| `articles.py` | Article discovery and viewing |
| `interactions.py` | Like, feedback, and share operations |
| `bookmarks.py` | Bookmark management |
| `search.py` | Wikipedia search |

**Key Features**:
- FastAPI dependency injection for authentication
- Automatic request validation (Pydantic)
- OpenAPI documentation generation
- CORS middleware support
- Optional/required authentication per endpoint

**Flow Example**:
```
HTTP Request → FastAPI Router → Endpoint Handler
    ↓ (dependency injection)
    get_current_user() → get_db() → Business Logic
    ↓
    Response Model (Pydantic) → JSON Response
```

### 2. Business Logic Layer (`app/services/`)

**Responsibility**: Implement complex business operations

**Components**:

#### `wikipedia.py` - WikipediaClient
- **Purpose**: Fetch and cache Wikipedia articles
- **Features**:
  - Async HTTP client using httpx
  - In-memory LRU cache with 1-hour TTL
  - Support for multiple languages (en, uk, ru)
  - Methods:
    - `get_random_articles()` - Random article discovery
    - `get_articles_by_category()` - Category browsing
    - `get_article_full()` - Full HTML content
    - `search_articles()` - Full-text search

#### `recommendation.py` - RecommendationEngine
- **Purpose**: Personalized article feed generation
- **Algorithm**:
  1. Get user's interests (if authenticated)
  2. Collect articles from interest categories
  3. Filter out already-read articles
  4. Filter out marked-as-not-interested articles
  5. Apply mode logic (explore vs deepen)
  6. Sort by is_featured DESC, then random
  7. Paginate with cursor
- **Modes**:
  - **Explore**: 70% from interests + 30% random (for discovery)
  - **Deepen**: 100% from interests (for focused learning)
- **Filtering**:
  - Reading time (±2 minutes)
  - Language
  - Exclude read articles
  - Exclude not-interested articles

#### `article_processor.py` - Content Processing
- **Purpose**: Process and prepare article content
- **Functions**:
  - `sanitize_html()` - Clean HTML with bleach (XSS prevention)
  - `calculate_reading_time()` - Estimate time (words/200)
  - `extract_fun_fact()` - Extract interesting sentence

### 3. Data Access Layer

#### Models (`app/models/`)

**SQLAlchemy ORM Models**:

```python
User
  ├── UserInterest (1-to-many)
  ├── ArticleLike (many-to-many via join table)
  ├── Bookmark (many-to-many via join table)
  ├── ReadingHistory (many-to-many with metadata)
  ├── ArticleShare (many-to-many with metadata)
  └── ArticleFeedback (many-to-many with feedback type)

ArticleCache
  ├── ArticleLike (many-to-many via join table)
  ├── Bookmark (many-to-many via join table)
  ├── ReadingHistory (many-to-many with metadata)
  ├── ArticleShare (many-to-many with metadata)
  └── ArticleFeedback (many-to-many with feedback type)
```

**Key Design Patterns**:
- **UUID Primary Keys**: All entities use UUID for global uniqueness
- **Server Defaults**: `created_at` timestamps set by database
- **Unique Constraints**: Prevent duplicate user-article relationships
- **Indexes**: On frequently filtered columns (user_id, article_id, language, wikipedia_id)

#### Schemas (`app/schemas/`)

**Pydantic Models**:
- Request validation (incoming data)
- Response serialization (outgoing data)
- Type hints and documentation
- Auto-generated OpenAPI docs

**Schema Organization**:
```
schemas/
├── common.py      # Shared schemas (CursorParams, PaginatedResponse)
├── user.py        # UserCreate, UserResponse, UserUpdate, InterestsUpdate
└── article.py     # ArticleCardResponse, ArticleFullResponse, etc.
```

### 4. Infrastructure Layer (`app/core/`)

#### `config.py` - Settings Management
- Pydantic BaseSettings for environment-based config
- Supports `.env` file loading
- Production-ready defaults
- Settings:
  - Database URL
  - JWT secret and algorithm
  - CORS origins
  - Language support

#### `database.py` - Database Connection
- SQLAlchemy 2.0 async engine
- PostgreSQL with asyncpg driver
- Async session factory
- Dependency injection for sessions

```python
# Connection Pool Setup
Engine Config:
  - pool_size: 20 (concurrent connections)
  - max_overflow: 0 (strict connection limit)
  - echo: False (no SQL logging in production)
```

#### `security.py` - JWT Authentication
- JWT token creation and validation
- Optional Bearer token extraction
- HTTPBearer scheme for OpenAPI
- Token payload: `sub` (user_id), `email`

**Token Flow**:
```
Login Request
    ↓
Verify credentials
    ↓
Create JWT: {sub: user_id, email: email, exp: now + 24h}
    ↓
Return token to client
    ↓
Client includes in Authorization header
    ↓
verify_token() decodes and validates
    ↓
Dependency injection provides user info to endpoint
```

## Database Design

### Schema Overview

```sql
┌──────────────────┐
│ users            │
├──────────────────┤
│ id (PK, UUID)    │
│ email (UNIQUE)   │
│ name             │
│ avatar_url       │
│ provider         │
│ preferences      │
│ created_at       │
└──────────────────┘
        │
        ├─→ ┌──────────────────┐
        │   │ user_interests   │
        │   ├──────────────────┤
        │   │ id (PK)          │
        │   │ user_id (FK)     │
        │   │ category_name    │
        │   │ weight           │
        │   └──────────────────┘
        │
        ├─→ ┌──────────────────┐
        │   │ article_likes    │
        │   ├──────────────────┤
        │   │ id (PK)          │
        │   │ user_id (FK)     │
        │   │ article_id (FK)  │
        │   │ created_at       │
        │   └──────────────────┘
        │
        ├─→ ┌──────────────────┐
        │   │ bookmarks        │
        │   ├──────────────────┤
        │   │ id (PK)          │
        │   │ user_id (FK)     │
        │   │ article_id (FK)  │
        │   │ created_at       │
        │   └──────────────────┘
        │
        ├─→ ┌──────────────────┐
        │   │ reading_history  │
        │   ├──────────────────┤
        │   │ id (PK)          │
        │   │ user_id (FK)     │
        │   │ article_id (FK)  │
        │   │ metadata         │
        │   └──────────────────┘
        │
        ├─→ ┌──────────────────┐
        │   │ article_shares   │
        │   ├──────────────────┤
        │   │ id (PK)          │
        │   │ user_id (FK)     │
        │   │ article_id (FK)  │
        │   │ platform         │
        │   └──────────────────┘
        │
        └─→ ┌──────────────────┐
            │article_feedback  │
            ├──────────────────┤
            │ id (PK)          │
            │ user_id (FK)     │
            │ article_id (FK)  │
            │ feedback_type    │
            └──────────────────┘

┌──────────────────┐
│ article_cache    │
├──────────────────┤
│ id (PK, UUID)    │
│ wikipedia_id     │
│ title            │
│ extract          │
│ full_content     │
│ language (IDX)   │
│ category         │
│ reading_time     │
│ is_featured      │
│ image_url        │
│ cached_at        │
└──────────────────┘
```

### Indexing Strategy

```sql
-- User lookups
CREATE INDEX ix_user_email ON users(email);

-- Article lookups
CREATE INDEX ix_article_language ON article_cache(language);
CREATE INDEX ix_article_featured ON article_cache(is_featured);
CREATE INDEX ix_article_wikipedia_id ON article_cache(wikipedia_id);

-- Relationship lookups
CREATE INDEX ix_like_user_id ON article_likes(user_id);
CREATE INDEX ix_like_article_id ON article_likes(article_id);
CREATE INDEX ix_bookmark_user_id ON bookmarks(user_id);
CREATE INDEX ix_bookmark_article_id ON bookmarks(article_id);
-- ... (similar for other interaction tables)

-- Unique constraints prevent duplicates
CREATE UNIQUE INDEX uq_article_like_user_article ON article_likes(user_id, article_id);
CREATE UNIQUE INDEX uq_bookmark_user_article ON bookmarks(user_id, article_id);
```

## Request Flow Examples

### Example 1: Get Personalized Feed

```
1. GET /api/v1/articles/feed?mode=explore&reading_time=5&lang=en
   ├─ FastAPI Route Handler
   ├─ get_current_user() dependency → JWT verification
   ├─ get_db() dependency → AsyncSession
   └─ articles() endpoint function

2. RecommendationEngine.get_feed()
   ├─ Get user's interests from DB
   ├─ Build article query with filters:
   │  ├─ language = 'en'
   │  ├─ reading_time_minutes BETWEEN 3 AND 7
   │  ├─ NOT IN (already_read_articles)
   │  └─ NOT IN (marked_not_interested)
   ├─ Split by interest coverage (70% / 30%)
   ├─ Order by is_featured DESC, RANDOM()
   └─ Return paginated results

3. Response Construction
   ├─ Fetch user's likes and bookmarks
   ├─ Extract fun facts from article extracts
   ├─ Build ArticleCardResponse objects
   └─ Return JSON with next_cursor

4. JSON Response
   {
     "items": [...],
     "next_cursor": "abc123",
     "has_more": true
   }
```

### Example 2: Like an Article

```
1. POST /api/v1/articles/{id}/like
   ├─ get_current_user() → verify token, extract user_id
   ├─ get_db() → get database session

2. like_article() endpoint
   ├─ Verify article exists
   ├─ Check if already liked
   │  ├─ If yes: delete ArticleLike record
   │  └─ If no: create ArticleLike record
   └─ Commit transaction

3. Response
   {
     "message": "Article liked"
   }
```

## Caching Strategy

### Wikipedia Client Cache
- **Type**: In-memory dictionary with TTL
- **TTL**: 1 hour (3600 seconds)
- **Key**: `{endpoint}_{params_hash}`
- **Invalidation**: Time-based only
- **Limits**: No size limit (production: use Redis)

```python
# Example cache key
cache_key = "random_count=10_lang=en"
cache_value = (timestamp, articles_list)

# Validation
if (now - timestamp) < 3600:
    return cached_articles
```

## Error Handling

### Exception Hierarchy

```python
Exception
├── HTTPException (FastAPI)
│   ├── 400 Bad Request (validation errors)
│   ├── 401 Unauthorized (auth failures)
│   ├── 404 Not Found (resource missing)
│   └── 422 Unprocessable Entity (schema errors)
│
├── jwt.InvalidTokenError
│   └── → 401 HTTPException
│
└── sqlalchemy.exc.SQLAlchemyError
    └── → 500 Internal Server Error (unhandled)
```

### Error Response Format

```json
{
  "detail": "Error message or list of validation errors"
}
```

## Async/Await Patterns

All I/O operations are async:

```python
# Database operations
async with async_session() as session:
    result = await session.execute(stmt)
    items = result.scalars().all()

# HTTP requests
async with httpx.AsyncClient() as client:
    response = await client.get(url, params=params)
    data = response.json()

# Endpoints
@router.get("/path")
async def endpoint(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # All operations are awaited
    pass
```

## Performance Optimizations

### Database
- Connection pooling (pool_size=20)
- Proper indexing on foreign keys and filters
- Cursor-based pagination (no OFFSET)
- Eager loading where needed

### Caching
- Wikipedia API response caching (1 hour TTL)
- In-memory cache for fast access
- Production: Consider Redis for distributed cache

### API
- Async request handling
- Minimal data transfer (fields selection)
- Pagination to limit result sets

## Future Enhancements

### Phase 2
- Redis caching layer
- Read replicas for database
- Background job queue (Celery)
- Rate limiting per user
- API analytics

### Phase 3
- Full OAuth2 implementation (Google, GitHub)
- Advanced recommendation algorithm (ML)
- User collaboration features
- Admin dashboard
- Audit logging

### Phase 4
- Microservices architecture
- Message queue (RabbitMQ)
- Real-time notifications (WebSockets)
- Elasticsearch integration
- Multi-region deployment

## Testing Strategy

### Unit Tests
- Service layer logic
- Article processor functions
- Schema validation

### Integration Tests
- Database operations
- Wikipedia client
- Recommendation engine

### E2E Tests
- Full request/response cycles
- Authentication flow
- User interaction workflows

### Performance Tests
- Database query performance
- Cache hit rates
- API response times

## Deployment Considerations

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Strong random string (min 32 chars)
- `CORS_ORIGINS`: Frontend URL
- `SUPPORTED_LANGUAGES`: Active languages

### Server Setup
- Python 3.12+
- PostgreSQL 12+
- Gunicorn with Uvicorn workers
- NGINX reverse proxy
- SSL/TLS certificates

### Monitoring
- Application logs (stdout/stderr)
- Database query logs
- Error tracking (Sentry)
- Performance monitoring (Prometheus/Grafana)

### Backup Strategy
- Daily database backups
- Backup retention: 30 days
- Test restore procedures monthly
