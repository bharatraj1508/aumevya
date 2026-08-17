'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'

/** Vertical parallax tied to the element's scroll progress through the viewport. */
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
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? ['0%', '0%'] : [`${-speed * 100}%`, `${speed * 100}%`],
  )

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  )
}
