export interface ArticleCard {
  id: string
  title: string
  extract: string
  category: string
  readingTime: number
  image?: string
  funFact?: string
  liked: boolean
  bookmarked: boolean
  likeCount: number
}

export interface ArticleFull extends ArticleCard {
  content: string
  url: string
  author?: string
  lastModified?: string
  views?: number
}

export interface SearchArticle {
  id: string
  title: string
  extract: string
  category: string
  readingTime: number
}
