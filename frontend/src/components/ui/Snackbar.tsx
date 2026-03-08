'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface SnackbarProps {
  message: string
  action?: string
  onAction?: () => void
  duration?: number
}

export function Snackbar({
  message,
  action,
  onAction,
  duration = 4000,
}: SnackbarProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), duration)
    return () => clearTimeout(timer)
  }, [duration])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50"
        >
          <div className="bg-text-primary text-bg-primary rounded-lg px-4 py-3 flex items-center justify-between gap-3 shadow-lg">
            <span className="text-sm font-medium">{message}</span>
            {action && onAction && (
              <button
                onClick={onAction}
                className="text-sm font-medium underline hover:opacity-75 transition-opacity duration-150"
              >
                {action}
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
