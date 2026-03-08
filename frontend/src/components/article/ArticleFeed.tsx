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

  const articles = data?.pages.flat() || []

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

      <div ref={observerTarget} className="h-1" />
    </div>
  )
}
