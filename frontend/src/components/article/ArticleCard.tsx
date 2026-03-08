'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { ArticleCard as ArticleCardType } from '@/types/article'
import { CategoryLabel } from './CategoryLabel'
import { InteractionBar } from './InteractionBar'
import { useLike, useBookmark, useNotInterested, useShare } from '@/hooks/useInteractions'
import { Snackbar } from '@/components/ui/Snackbar'

interface ArticleCardProps {
  article: ArticleCardType
  showInteractions?: boolean
}

export function ArticleCard({
  article,
  showInteractions = true,
}: ArticleCardProps) {
  const [showCopiedSnackbar, setShowCopiedSnackbar] = useState(false)
  const router = useRouter()
  const locale = useLocale()
  const likeMutation = useLike(article.id)
  const bookmarkMutation = useBookmark(article.id)
  const notInterestedMutation = useNotInterested(article.id)
  const shareMutation = useShare(article.id)

  const handleShare = async () => {
    const url = `${window.location.origin}/${locale}/article/${article.id}`
    if (navigator.share) {
      navigator.share({ title: article.title, text: article.extract, url })
    } else {
      navigator.clipboard.writeText(url)
      setShowCopiedSnackbar(true)
      shareMutation.mutate()
    }
  }

  return (
    <>
      <div className="w-full min-h-dvh flex flex-col justify-center items-center px-4 py-8 gap-6 scroll-snap-child">
        <div className="w-full max-w-2xl space-y-6">
          {/* Category & Reading Time */}
          <CategoryLabel
            category={article.category}
            readingTimeMinutes={article.readingTimeMinutes}
          />

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary leading-tight line-clamp-2">
            {article.title}
          </h1>

          {/* Extract */}
          <p className="text-base md:text-lg text-text-secondary leading-relaxed line-clamp-4">
            {article.extract}
          </p>

          {/* Fun Fact */}
          {article.funFact && (
            <div className="pl-4 border-l-2 border-accent">
              <p className="text-sm text-text-secondary italic">
                💡 {article.funFact}
              </p>
            </div>
          )}

          {/* Read More */}
          <button
            onClick={() => router.push(`/${locale}/article/${article.id}`)}
            className="text-accent font-medium text-sm hover:opacity-75 transition-opacity duration-150"
          >
            Read more →
          </button>

          {/* Interactions */}
          {showInteractions && (
            <div className="pt-4 border-t border-border mt-6">
              <InteractionBar
                articleId={article.id}
                liked={article.isLiked}
                bookmarked={article.isBookmarked}
                likeCount={article.likeCount ?? 0}
                onLike={(liked) => likeMutation.mutate(liked)}
                onBookmark={(bookmarked) => bookmarkMutation.mutate(bookmarked)}
                onDismiss={() => notInterestedMutation.mutate()}
                onShare={handleShare}
              />
            </div>
          )}
        </div>
      </div>

      {showCopiedSnackbar && (
        <Snackbar message="Link copied to clipboard" duration={2000} />
      )}
    </>
  )
}
