'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { gsap, prefersReducedMotion } from '@/lib/gsap'

/**
 * Vertical parallax tied to the element's scroll progress through the viewport.
 * GSAP scrub, synced to Lenis via the shared ticker (see SmoothScroll), so the
 * movement tracks the smooth-scroll position instead of drifting behind it.
 */
export function Parallax({
  children,
  className,
  speed = 0.15,
}: {
  children: ReactNode
  className?: string
  speed?: number
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return

    const shift = speed * 100
    const anim = gsap.fromTo(
      el,
      { yPercent: -shift },
      {
        yPercent: shift,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      },
    )

    return () => {
      anim.scrollTrigger?.kill()
      anim.kill()
    }
  }, [speed])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
