'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { useArticleFeed } from '@/hooks/useArticles'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { ArticleCard } from './ArticleCard'
import { ArticleSkeleton } from '@/components/ui/Skeleton'

interface ArticleFeedProps {
  category?: string
}

export function ArticleFeed({ category }: ArticleFeedProps) {
  const t = useTranslations('feed')
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useArticleFeed(category)

  const observerTarget = useRef<HTMLDivElement>(null)

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  // Keyboard shortcuts
  const handleNextArticle = useCallback(() => {
    window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })
  }, [])

  useKeyboardShortcuts({
    onNext: handleNextArticle,
  })

  if (isLoading) {
    return <ArticleSkeleton />
  }

  if (isError) {
    return (
      <div className="w-full h-dvh flex items-center justify-center">
        <p className="text-text-secondary">{t('error')}</p>
      </div>
    )
  }

  // Each page is a PaginatedFeedResponse — flatten the items arrays across pages
  const articles = data?.pages.flatMap((page) => page.items) ?? []
  // has_more from the most recent page tells us whether more content is available
  const hasMore = data?.pages.at(-1)?.hasMore ?? true

  if (articles.length === 0) {
    return (
      <div className="w-full h-dvh flex items-center justify-center">
        <p className="text-text-secondary">{t('noArticles')}</p>
      </div>
    )
  }

  return (
    <div className="scroll-snap-container">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}

      {isFetchingNextPage && <ArticleSkeleton />}

      {/* Sentinel — the observer fires fetchNextPage when this element is visible */}
      <div ref={observerTarget} className="h-1" aria-hidden="true" />

      {/* End-of-feed indicator — shown when the backend signals no further pages */}
      {!hasMore && !isFetchingNextPage && (
        <div
          className="w-full py-8 flex items-center justify-center"
          role="status"
          aria-live="polite"
        >
          <p className="text-text-tertiary text-sm">{t('endOfFeed')}</p>
        </div>
      )}
    </div>
  )
}
