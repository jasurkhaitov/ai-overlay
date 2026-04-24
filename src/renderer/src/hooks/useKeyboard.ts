import { useEffect } from 'react'

export interface KeyboardHandlers {
  onScreenshot: () => void
  onToggleVisible: () => void
  onSendToAI: () => void
  onClear: () => void
  onSettings: () => void
  onNavigate: (dir: 'up' | 'down' | 'left' | 'right') => void
}

export function useKeyboard(handlers: KeyboardHandlers, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return

    const handle = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'h') {
        e.preventDefault()
        handlers.onScreenshot()
      }

      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault()
        handlers.onSendToAI()
      }

      if (e.ctrlKey && e.key === 'r') {
        e.preventDefault()
        handlers.onClear()
      }

      if (e.ctrlKey && e.key === ',') {
        e.preventDefault()
        handlers.onSettings()
      }

      if (e.ctrlKey && e.altKey) {
        if (e.key === 'ArrowUp') {
          e.preventDefault()
          handlers.onNavigate('up')
        }
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          handlers.onNavigate('down')
        }
        if (e.key === 'ArrowLeft') {
          e.preventDefault()
          handlers.onNavigate('left')
        }
        if (e.key === 'ArrowRight') {
          e.preventDefault()
          handlers.onNavigate('right')
        }
      }
    }

    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [enabled, handlers])
}
