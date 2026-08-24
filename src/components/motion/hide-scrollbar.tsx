'use client'

import { useEffect } from 'react'

/**
 * Hides the browser scrollbar for as long as it is mounted. Rendered only on
 * the landing page, so other routes keep their scrollbar. Scrolling still works
 * (wheel, touch, keyboard, Lenis) — only the visual track is hidden.
 */
export function HideScrollbar() {
  useEffect(() => {
    const root = document.documentElement
    root.classList.add('no-scrollbar')
    document.body.classList.add('no-scrollbar')
    return () => {
      root.classList.remove('no-scrollbar')
      document.body.classList.remove('no-scrollbar')
    }
  }, [])

  return null
}
