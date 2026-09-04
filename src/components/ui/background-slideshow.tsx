'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'

export interface BackgroundSlideshowProps {
  images: string[]
  className?: string
  style?: React.CSSProperties
  /** Milliseconds each image stays before turning to the next. */
  interval?: number
}

const EASE = [0.16, 1, 0.3, 1] as const

/**
 * A single full-bleed background image that cycles through `images` on a timer.
 * The transition reads like a page being turned over (a 3D flip around the left
 * edge). Falls back to a plain crossfade when the user prefers reduced motion.
 */
export function BackgroundSlideshow({
  images,
  className,
  style,
  interval = 3000,
}: BackgroundSlideshowProps) {
  const reduce = useReducedMotion()
  const slides = images.filter(Boolean)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (slides.length < 2) return
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), interval)
    return () => clearInterval(id)
  }, [slides.length, interval])

  if (slides.length === 0) return null

  return (
    <div
      aria-hidden
      style={style}
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden [perspective:1400px]',
        className,
      )}
    >
      <AnimatePresence initial={false}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <motion.img
          key={index}
          src={slides[index]}
          alt=""
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ transformOrigin: 'left center', backfaceVisibility: 'hidden' }}
          initial={reduce ? { opacity: 0 } : { rotateY: -105, opacity: 0 }}
          animate={reduce ? { opacity: 1 } : { rotateY: 0, opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { rotateY: 0, opacity: 0 }}
          transition={{ duration: reduce ? 0.6 : 0.9, ease: EASE }}
        />
      </AnimatePresence>
    </div>
  )
}
