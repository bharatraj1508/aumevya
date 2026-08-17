'use client'

import { ReactLenis } from 'lenis/react'
import type { ReactNode } from 'react'

/**
 * Momentum smooth-scroll for the whole public site (the "expensive" feel).
 * Lenis disables itself automatically when the OS requests reduced motion.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        duration: 1.2,
        smoothWheel: true,
      }}
    >
      {children}
    </ReactLenis>
  )
}
