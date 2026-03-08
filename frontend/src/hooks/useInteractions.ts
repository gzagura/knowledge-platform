'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { ArticleCard } from '@/types/article'

export function useLike(articleId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (liked: boolean) => {
      return api.post(`/articles/${articleId}/like`, { liked })
    },
    onMutate: async (liked) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['articles'] })

      queryClient.setQueriesData<{ pages: ArticleCard[][] }>(
        { queryKey: ['articles', 'feed'] },
        (old) => {
          if (!old?.pages) return old
          return {
            ...old,
            pages: old.pages.map((page) =>
              page.map((article) =>
                article.id === articleId
                  ? {
                      ...article,
                      liked,
                      likeCount: liked
                        ? article.likeCount + 1
                        : Math.max(0, article.likeCount - 1),
                    }
                  : article
              )
            ),
          }
        }
      )
    },
  })
}

export function useBookmark(articleId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (bookmarked: boolean) => {
      return api.post(`/articles/${articleId}/bookmark`, { bookmarked })
    },
    onMutate: async (bookmarked) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['articles'] })

      queryClient.setQueriesData<{ pages: ArticleCard[][] }>(
        { queryKey: ['articles', 'feed'] },
        (old) => {
          if (!old?.pages) return old
          return {
            ...old,
            pages: old.pages.map((page) =>
              page.map((article) =>
                article.id === articleId ? { ...article, bookmarked } : article
              )
            ),
          }
        }
      )
    },
  })
}

export function useNotInterested(articleId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      return api.post(`/articles/${articleId}/not-interested`)
    },
    onMutate: async () => {
      // Optimistic update - remove from feed
      await queryClient.cancelQueries({ queryKey: ['articles'] })

      queryClient.setQueriesData<{ pages: ArticleCard[][] }>(
        { queryKey: ['articles', 'feed'] },
        (old) => {
          if (!old?.pages) return old
          return {
            ...old,
            pages: old.pages.map((page) =>
              page.filter((article) => article.id !== articleId)
            ),
          }
        }
      )
    },
  })
}

export function useShare(articleId: string) {
  return useMutation({
    mutationFn: async (data?: Record<string, unknown>) => {
      return api.post(`/articles/${articleId}/share`, data)
    },
  })
}
