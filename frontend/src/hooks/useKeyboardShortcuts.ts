'use client'

import { useEffect } from 'react'

interface ShortcutHandlers {
  onLike?: () => void
  onSave?: () => void
  onDismiss?: () => void
  onNext?: () => void
  onRead?: () => void
  onNavigateUp?: () => void
  onNavigateDown?: () => void
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't trigger if user is typing in input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      switch (e.key.toLowerCase()) {
        case 'l':
          e.preventDefault()
          handlers.onLike?.()
          break
        case 's':
          e.preventDefault()
          handlers.onSave?.()
          break
        case 'd':
          e.preventDefault()
          handlers.onDismiss?.()
          break
        case ' ':
          e.preventDefault()
          handlers.onNext?.()
          break
        case 'enter':
          e.preventDefault()
          handlers.onRead?.()
          break
        case 'arrowup':
          e.preventDefault()
          handlers.onNavigateUp?.()
          break
        case 'arrowdown':
          e.preventDefault()
          handlers.onNavigateDown?.()
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handlers])
}
