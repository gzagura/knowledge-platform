'use client'

import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { ArticleCard, ArticleFull, SearchArticle } from '@/types/article'
import { mockArticles, mockArticlesFull } from '@/lib/mock-data'

const ARTICLES_PER_PAGE = 10

export function useArticleFeed(category?: string) {
  return useInfiniteQuery({
    queryKey: ['articles', 'feed', category],
    queryFn: async ({ pageParam = 0 }) => {
      try {
        const params = new URLSearchParams({
          skip: String(pageParam * ARTICLES_PER_PAGE),
          limit: String(ARTICLES_PER_PAGE),
          ...(category && { category }),
        })
        return await api.get<ArticleCard[]>(`/articles/feed?${params}`)
      } catch {
        // Fallback to mock data
        return mockArticles
      }
    },
    getNextPageParam: (lastPage, pages) => {
      return lastPage.length === ARTICLES_PER_PAGE ? pages.length : undefined
    },
    initialPageParam: 0,
  })
}

export function useArticle(id: string) {
  return useQuery({
    queryKey: ['articles', id],
    queryFn: async () => {
      try {
        return await api.get<ArticleFull>(`/articles/${id}`)
      } catch {
        // Fallback to mock data
        return (
          mockArticlesFull[id] || {
            id,
            title: 'Article Not Found',
            extract: '',
            category: '',
            readingTime: 0,
            liked: false,
            bookmarked: false,
            likeCount: 0,
            url: '',
            content: '',
          }
        )
      }
    },
    enabled: !!id,
  })
}

export function useRandomArticles(count: number = 3) {
  return useQuery({
    queryKey: ['articles', 'random', count],
    queryFn: async () => {
      try {
        return await api.get<ArticleCard[]>(`/articles/random?count=${count}`)
      } catch {
        // Fallback to mock data
        return mockArticles.slice(0, count)
      }
    },
  })
}

export function useSearchArticles(query: string) {
  return useQuery({
    queryKey: ['articles', 'search', query],
    queryFn: async () => {
      if (!query.trim()) return []
      try {
        return await api.get<SearchArticle[]>(
          `/articles/search?q=${encodeURIComponent(query)}`
        )
      } catch {
        // Fallback to mock search
        const lowerQuery = query.toLowerCase()
        return mockArticles.filter(
          (article) =>
            article.title.toLowerCase().includes(lowerQuery) ||
            article.extract.toLowerCase().includes(lowerQuery)
        )
      }
    },
    enabled: !!query.trim(),
  })
}
