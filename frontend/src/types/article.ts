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

export interface SearchArticle {
  id: string
  title: string
  extract: string
  category: string | null
  readingTimeMinutes: number
  language: string
}
