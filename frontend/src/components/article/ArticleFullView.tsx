'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import { useResponsive } from '@/hooks/useMediaQuery'
import { useLike, useBookmark, useNotInterested, useShare } from '@/hooks/useInteractions'
import { InteractionBar } from './InteractionBar'
import { ArticleSkeleton } from '@/components/ui/Skeleton'

interface ArticleFullViewProps {
  articleId: string
  title: string
  content: string
  category: string
  readingTime: number
  liked: boolean
  bookmarked: boolean
  likeCount: number
  url: string
  onClose?: () => void
}

export function ArticleFullView({
  articleId,
  title,
  content,
  category,
  readingTime,
  liked,
  bookmarked,
  likeCount,
  url,
  onClose,
}: ArticleFullViewProps) {
  const [scrollProgress, setScrollProgress] = useState(0)
  const { isMobile } = useResponsive()
  const t = useTranslations('article')
  const likeMutation = useLike(articleId)
  const bookmarkMutation = useBookmark(articleId)
  const notInterestedMutation = useNotInterested(articleId)
  const shareMutation = useShare(articleId)

  // Track scroll progress
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.currentTarget as HTMLElement
      const progress =
        (target.scrollTop /
          (target.scrollHeight - target.clientHeight)) *
        100
      setScrollProgress(progress)
    }

    const container = document.querySelector('[data-article-container]')
    container?.addEventListener('scroll', handleScroll)
    return () => container?.removeEventListener('scroll', handleScroll)
  }, [])

  const handleShare = async () => {
    const shareUrl = url

    if (navigator.share) {
      navigator.share({
        title,
        text: category,
        url: shareUrl,
      })
    } else {
      navigator.clipboard.writeText(shareUrl)
    }

    shareMutation.mutate()
  }

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="fixed inset-0 bg-bg-primary z-50 flex flex-col overflow-hidden"
    >
      {/* Progress Bar */}
      <div
        className="h-1 bg-accent transition-all duration-150"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Header */}
      <div className="border-b border-border px-4 py-4 flex items-center justify-between md:px-6">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-text-primary hover:text-accent transition-colors duration-150"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm">{t('backToFeed')}</span>
        </button>
      </div>

      {/* Content */}
      <div
        data-article-container
        className="flex-1 overflow-y-auto"
      >
        <article className="max-w-2xl mx-auto px-4 py-8 md:px-6 md:py-12">
          {/* Meta */}
          <div className="space-y-2 mb-8">
            <p className="text-xs text-text-tertiary uppercase tracking-wide">
              {category} · {readingTime} {t('readingTime')}
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-text-primary leading-tight">
              {title}
            </h1>
          </div>

          {/* Rich Content */}
          <div
            className="prose prose-invert max-w-none text-text-primary leading-relaxed space-y-4"
            dangerouslySetInnerHTML={{ __html: content }}
            style={{
              color: 'var(--text-primary)',
              fontSize: '16px',
              lineHeight: '1.6',
            }}
          />

          {/* Source */}
          <div className="border-t border-border mt-12 pt-6 text-xs text-text-tertiary">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors duration-150"
            >
              {t('source')} ↗
            </a>
          </div>

          {/* Spacing for mobile interactions */}
          <div className="h-20 md:h-0" />
        </article>
      </div>

      {/* Mobile Bottom Interactions */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-bg-primary px-4 py-4">
          <InteractionBar
            articleId={articleId}
            liked={liked}
            bookmarked={bookmarked}
            likeCount={likeCount}
            onLike={() => likeMutation.mutate()}
            onBookmark={(bookmarked) => bookmarkMutation.mutate(bookmarked)}
            onDismiss={() => notInterestedMutation.mutate()}
            onShare={handleShare}
          />
        </div>
      )}

      {/* Desktop Inline Interactions */}
      {!isMobile && (
        <div className="border-t border-border px-6 py-6">
          <InteractionBar
            articleId={articleId}
            liked={liked}
            bookmarked={bookmarked}
            likeCount={likeCount}
            onLike={() => likeMutation.mutate()}
            onBookmark={(bookmarked) => bookmarkMutation.mutate(bookmarked)}
            onDismiss={() => notInterestedMutation.mutate()}
            onShare={handleShare}
          />
        </div>
      )}
    </motion.div>
  )
}
