'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { ArticleCard } from '@/types/article'

export function useLike(articleId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      // POST toggles the like on backend, returns { liked: bool }
      return api.post(`/articles/${articleId}/like`, {})
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['articles'] })

      // Optimistically toggle
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
                      isLiked: !article.isLiked,
                      likeCount: article.isLiked
                        ? Math.max(0, (article.likeCount ?? 0) - 1)
                        : (article.likeCount ?? 0) + 1,
                    }
                  : article
              )
            ),
          }
        }
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['articles', 'feed'] })
    },
  })
}

export function useBookmark(articleId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (bookmarked: boolean) => {
      if (bookmarked) {
        return api.post('/bookmarks', { article_id: articleId, bookmarked: true })
      } else {
        return api.delete(`/bookmarks/${articleId}`)
      }
    },
    onMutate: async (bookmarked) => {
      await queryClient.cancelQueries({ queryKey: ['articles'] })

      queryClient.setQueriesData<{ pages: ArticleCard[][] }>(
        { queryKey: ['articles', 'feed'] },
        (old) => {
          if (!old?.pages) return old
          return {
            ...old,
            pages: old.pages.map((page) =>
              page.map((article) =>
                article.id === articleId ? { ...article, isBookmarked: bookmarked } : article
              )
            ),
          }
        }
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
    },
  })
}

export function useNotInterested(articleId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      // No body needed
      return api.post(`/articles/${articleId}/not-interested`, {})
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['articles'] })

      // Remove from feed immediately
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
  // No variables — TanStack Query infers TVariables=void, so mutate() works with no args
  return useMutation({
    mutationFn: async () => {
      return api.post(`/articles/${articleId}/share`, { platform: 'copy' })
    },
  })
}
