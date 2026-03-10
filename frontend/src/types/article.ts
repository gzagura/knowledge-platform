export interface ArticleCard {
  id: string
  wikipediaId: number
  title: string
  extract: string
  category: string | null
  readingTimeMinutes: number
  isFeatured: boolean
  imageUrl?: string | null
  language: string
  isLiked: boolean
  isBookmarked: boolean
  funFact?: string | null
  url?: string | null
  // UI-only helpers (computed or from optimistic updates)
  likeCount?: number
}

export interface ArticleFull extends ArticleCard {
  fullContent?: string | null
  content?: string | null  // alias — some API versions return this key directly
}

// Cursor-paginated response from GET /api/v1/articles/feed
export interface PaginatedFeedResponse {
  items: ArticleCard[]
  nextCursor: string | null   // snake_case "next_cursor" transformed to camelCase by api.ts
  hasMore: boolean            // snake_case "has_more" transformed by api.ts
}

// Single item returned by GET /api/v1/search
// Note: id here is wikipedia_id (integer), not an internal UUID
export interface SearchResultItem {
  id: number
  title: string
  extract: string
  language: string
}

// Full response envelope from GET /api/v1/search
export interface SearchResponse {
  query: string
  items: SearchResultItem[]
  total: number
  language: string
}

/** @deprecated Use SearchResultItem / SearchResponse — kept to avoid breaking any stale imports */
export interface SearchArticle {
  id: string
  title: string
  extract: string
  category: string | null
  readingTimeMinutes: number
  language: string
}
