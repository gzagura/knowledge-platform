'use client'

import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import {
  ArticleCard,
  ArticleFull,
  PaginatedFeedResponse,
  SearchResponse,
} from '@/types/article'
import { mockArticles, mockArticlesFull } from '@/lib/mock-data'

const ARTICLES_PER_PAGE = 10

export function useArticleFeed(category?: string) {
  return useInfiniteQuery({
    queryKey: ['articles', 'feed', category],
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      try {
        const params = new URLSearchParams({
          limit: String(ARTICLES_PER_PAGE),
          ...(pageParam && { cursor: pageParam }),
          ...(category && { category }),
        })
        return await api.get<PaginatedFeedResponse>(`/articles/feed?${params}`)
      } catch {
        // Fallback mock keeps the same PaginatedFeedResponse shape
        return {
          items: mockArticles,
          nextCursor: null,
          hasMore: false,
        } satisfies PaginatedFeedResponse
      }
    },
    // Return next_cursor (camelCased by api.ts to nextCursor) as the next pageParam,
    // or undefined to signal no more pages.
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
  })
}

export function useArticle(id: string) {
  return useQuery({
    queryKey: ['articles', id],
    queryFn: async (): Promise<ArticleFull> => {
      try {
        return await api.get<ArticleFull>(`/articles/${id}`)
      } catch {
        // Fallback to mock data — fields use the camelCase names from ArticleFull
        return (
          mockArticlesFull[id] ?? {
            id,
            wikipediaId: 0,
            title: 'Article Not Found',
            extract: '',
            category: null,
            readingTimeMinutes: 0,
            isFeatured: false,
            language: 'en',
            isLiked: false,
            isBookmarked: false,
            fullContent: '',
            url: '',
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
        return mockArticles.slice(0, count)
      }
    },
  })
}

export function useSearchArticles(query: string, lang = 'en', limit = 10) {
  return useQuery({
    queryKey: ['search', query, lang, limit],
    queryFn: async (): Promise<SearchResponse> => {
      const params = new URLSearchParams({
        q: query,
        lang,
        limit: String(limit),
      })
      try {
        // Correct endpoint: GET /api/v1/search (not /articles/search)
        return await api.get<SearchResponse>(`/search?${params}`)
      } catch {
        // Fallback mock keeps the SearchResponse shape
        const lowerQuery = query.toLowerCase()
        const filtered = mockArticles.filter(
          (article) =>
            article.title.toLowerCase().includes(lowerQuery) ||
            article.extract.toLowerCase().includes(lowerQuery)
        )
        return {
          query,
          items: filtered.map((a) => ({
            id: a.wikipediaId,
            title: a.title,
            extract: a.extract,
            language: a.language,
          })),
          total: filtered.length,
          language: lang,
        }
      }
    },
    // Only fire when query is at least 2 characters
    enabled: query.trim().length >= 2,
  })
}
