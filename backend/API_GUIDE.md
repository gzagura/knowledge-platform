# API Usage Guide

## Quick Start

### 1. Login/Create Account
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe",
    "provider": "local"
  }'
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar_url": null,
    "preferred_language": "en",
    "ui_language": "en",
    "preferred_reading_time": 5,
    "theme": "auto",
    "created_at": "2024-01-15T10:30:00"
  }
}
```

### 2. Get Current User Profile (with auth)
```bash
curl -X GET http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Update User Preferences
```bash
curl -X PATCH http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "preferred_language": "uk",
    "preferred_reading_time": 10,
    "theme": "dark"
  }'
```

### 4. Set User Interests
```bash
curl -X PUT http://localhost:8000/api/v1/users/me/interests \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "interests": ["Science", "Technology", "History", "Philosophy"]
  }'
```

### 5. Get Personalized Feed (with interests)
```bash
# Explore mode (70% interests + 30% random)
curl -X GET "http://localhost:8000/api/v1/articles/feed?mode=explore&reading_time=5&lang=en&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Deepen mode (100% interests)
curl -X GET "http://localhost:8000/api/v1/articles/feed?mode=deepen&reading_time=5&lang=en&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
{
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "wikipedia_id": 12345,
      "title": "Quantum Mechanics",
      "extract": "Quantum mechanics is the fundamental theory of nature...",
      "category": "Science",
      "reading_time_minutes": 5,
      "is_featured": true,
      "image_url": "https://...",
      "language": "en",
      "is_liked": false,
      "is_bookmarked": true,
      "fun_fact": "The first quantum mechanics was developed in the 1920s."
    }
  ],
  "next_cursor": "550e8400-e29b-41d4-a716-446655440001",
  "has_more": true
}
```

### 6. Get Anonymous Feed (no auth required)
```bash
curl -X GET "http://localhost:8000/api/v1/articles/feed?mode=explore&reading_time=5&lang=en&limit=10"
```

### 7. Get Random Articles
```bash
curl -X GET "http://localhost:8000/api/v1/articles/random?lang=en&count=5"
```

### 8. Get Full Article
```bash
curl -X GET http://localhost:8000/api/v1/articles/550e8400-e29b-41d4-a716-446655440001 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "wikipedia_id": 12345,
  "title": "Quantum Mechanics",
  "extract": "Quantum mechanics is the fundamental theory of nature...",
  "full_content": "<p>Quantum mechanics is the fundamental theory...</p>",
  "category": "Science",
  "reading_time_minutes": 5,
  "is_featured": true,
  "image_url": "https://...",
  "language": "en",
  "is_liked": false,
  "is_bookmarked": true,
  "fun_fact": "The first quantum mechanics was developed in the 1920s."
}
```

### 9. Like an Article
```bash
curl -X POST http://localhost:8000/api/v1/articles/550e8400-e29b-41d4-a716-446655440001/like \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
{
  "message": "Article liked"
}
```

### 10. Unlike an Article
```bash
curl -X DELETE http://localhost:8000/api/v1/articles/550e8400-e29b-41d4-a716-446655440001/like \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 11. Mark as Not Interested
```bash
curl -X POST http://localhost:8000/api/v1/articles/550e8400-e29b-41d4-a716-446655440001/not-interested \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "feedback": "not_interested"
  }'
```

### 12. Share an Article
```bash
curl -X POST http://localhost:8000/api/v1/articles/550e8400-e29b-41d4-a716-446655440001/share \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "twitter"
  }'
```

### 13. Add Bookmark
```bash
curl -X POST http://localhost:8000/api/v1/bookmarks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "article_id": "550e8400-e29b-41d4-a716-446655440001"
  }'
```

### 14. List Bookmarks
```bash
curl -X GET "http://localhost:8000/api/v1/bookmarks?limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 15. Remove Bookmark
```bash
curl -X DELETE http://localhost:8000/api/v1/bookmarks/550e8400-e29b-41d4-a716-446655440001 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 16. Search Articles
```bash
curl -X GET "http://localhost:8000/api/v1/search?q=quantum%20physics&lang=en&limit=10"
```

Response:
```json
{
  "query": "quantum physics",
  "items": [
    {
      "id": 12345,
      "title": "Quantum Mechanics",
      "extract": "Quantum mechanics is...",
      "language": "en"
    }
  ],
  "total": 42,
  "language": "en"
}
```

### 17. Refresh Token
```bash
curl -X POST http://localhost:8000/api/v1/auth/refresh \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Query Parameters

### Feed Endpoint (`GET /api/v1/articles/feed`)
- `mode` (string): "explore" or "deepen" (default: "explore")
- `reading_time` (integer): 1-60 minutes (default: 5)
- `lang` (string): "en", "uk", or "ru" (default: "en")
- `limit` (integer): 1-100 articles (default: 10)
- `cursor` (string, optional): For pagination

### Random Articles Endpoint (`GET /api/v1/articles/random`)
- `lang` (string): "en", "uk", or "ru" (default: "en")
- `count` (integer): 1-50 articles (default: 5)

### Search Endpoint (`GET /api/v1/search`)
- `q` (string): Search query (required, 1-200 chars)
- `lang` (string): "en", "uk", or "ru" (default: "en")
- `limit` (integer): 1-50 results (default: 10)

### Bookmarks Endpoint (`GET /api/v1/bookmarks`)
- `limit` (integer): 1-100 bookmarks (default: 10)

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Invalid request parameters"
}
```

### 401 Unauthorized
```json
{
  "detail": "Not authenticated"
}
```

### 404 Not Found
```json
{
  "detail": "Article not found"
}
```

### 422 Unprocessable Entity
```json
{
  "detail": [
    {
      "loc": ["body", "interests"],
      "msg": "at least 1 item required",
      "type": "value_error.list.min_items"
    }
  ]
}
```

## Language Support

All endpoints support these languages:
- **en** - English
- **uk** - Ukrainian
- **ru** - Russian

## Authentication

All endpoints requiring authentication use Bearer token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Token expires after 1440 minutes (24 hours) by default. Use `/api/v1/auth/refresh` to get a new token.

## Pagination

The feed endpoint uses cursor-based pagination:

1. First request: Don't provide `cursor` parameter
2. Response includes `next_cursor` and `has_more`
3. Next request: Use `next_cursor` from previous response
4. Continue until `has_more` is false

## Rate Limiting

No rate limiting is implemented in this MVP. In production, consider:
- Limiting requests per user
- Caching frequently accessed articles
- Setting up API gateway rate limiting

## Testing

You can test the API using:

### cURL (shown above)

### Python requests
```python
import requests

# Login
response = requests.post(
    'http://localhost:8000/api/v1/auth/login',
    json={'email': 'user@example.com', 'name': 'John', 'provider': 'local'}
)
token = response.json()['access_token']

# Get feed
headers = {'Authorization': f'Bearer {token}'}
response = requests.get(
    'http://localhost:8000/api/v1/articles/feed?mode=explore',
    headers=headers
)
articles = response.json()['items']
```

### JavaScript/Fetch
```javascript
// Login
const response = await fetch('http://localhost:8000/api/v1/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({email: 'user@example.com', name: 'John', provider: 'local'})
});
const {access_token} = await response.json();

// Get feed
const feedResponse = await fetch('http://localhost:8000/api/v1/articles/feed?mode=explore', {
  headers: {'Authorization': `Bearer ${access_token}`}
});
const {items} = await feedResponse.json();
```
