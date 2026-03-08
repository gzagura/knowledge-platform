'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Heart, Bookmark, Circle, Share2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useResponsive } from '@/hooks/useMediaQuery'
import { Snackbar } from '@/components/ui/Snackbar'

interface InteractionBarProps {
  articleId: string
  liked: boolean
  bookmarked: boolean
  likeCount: number
  onLike: (liked: boolean) => void
  onBookmark: (bookmarked: boolean) => void
  onDismiss: () => void
  onShare: () => void
}

export function InteractionBar({
  articleId,
  liked,
  bookmarked,
  likeCount,
  onLike,
  onBookmark,
  onDismiss,
  onShare,
}: InteractionBarProps) {
  const [showUndoSnackbar, setShowUndoSnackbar] = useState(false)
  const [likeScale, setLikeScale] = useState(1)
  const { isMobile } = useResponsive()
  const t = useTranslations('interactions')

  const handleDismiss = () => {
    setShowUndoSnackbar(true)
    onDismiss()
  }

  const handleLike = () => {
    setLikeScale(1.15)
    setTimeout(() => setLikeScale(1), 150)
    onLike(!liked)
  }

  if (isMobile) {
    // Mobile: vertical column on right side
    return (
      <>
        <div className="flex flex-col gap-4 items-center justify-center">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLike}
            className="flex flex-col items-center gap-1"
            animate={{ scale: likeScale }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            <Heart
              className={`w-6 h-6 transition-colors duration-150 ${
                liked ? 'fill-accent text-accent' : 'text-text-primary'
              }`}
            />
            <span className="text-xs text-text-primary font-medium">
              {likeCount}
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onBookmark(!bookmarked)}
          >
            <Bookmark
              className={`w-6 h-6 transition-colors duration-150 ${
                bookmarked
                  ? 'fill-text-primary text-text-primary'
                  : 'text-text-primary'
              }`}
            />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDismiss}
          >
            <Circle className="w-6 h-6 text-text-primary" strokeWidth={1.5} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onShare}
          >
            <Share2 className="w-6 h-6 text-text-primary" strokeWidth={1.5} />
          </motion.button>
        </div>

        {showUndoSnackbar && (
          <Snackbar
            message={t('articleHidden')}
            action={t('undo')}
            onAction={() => {
              onDismiss()
              setShowUndoSnackbar(false)
            }}
            duration={4000}
          />
        )}
      </>
    )
  }

  // Desktop: horizontal row
  return (
    <>
      <div className="flex items-center gap-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLike}
          className="flex items-center gap-2 group"
          animate={{ scale: likeScale }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        >
          <Heart
            className={`w-5 h-5 transition-colors duration-150 ${
              liked ? 'fill-accent text-accent' : 'text-text-primary'
            }`}
          />
          <span className="text-sm text-text-primary font-medium group-hover:text-accent transition-colors duration-150">
            {likeCount}
          </span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onBookmark(!bookmarked)}
          className="flex items-center gap-2 group text-sm"
        >
          <Bookmark
            className={`w-5 h-5 transition-colors duration-150 ${
              bookmarked
                ? 'fill-text-primary text-text-primary'
                : 'text-text-primary'
            }`}
          />
          <span className="text-text-primary group-hover:text-accent transition-colors duration-150">
            {bookmarked ? t('saved') : t('save')}
          </span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDismiss}
        >
          <Circle className="w-5 h-5 text-text-primary" strokeWidth={1.5} />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onShare}
          className="flex items-center gap-2 group text-sm ml-auto"
        >
          <Share2 className="w-5 h-5 text-text-primary" strokeWidth={1.5} />
          <span className="text-text-primary group-hover:text-accent transition-colors duration-150">
            {t('share')}
          </span>
        </motion.button>
      </div>

      {showUndoSnackbar && (
        <Snackbar
          message={t('articleHidden')}
          action={t('undo')}
          onAction={() => {
            onDismiss()
            setShowUndoSnackbar(false)
          }}
          duration={4000}
        />
      )}
    </>
  )
}
