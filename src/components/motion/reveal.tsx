'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { gsap, prefersReducedMotion } from '@/lib/gsap'

type RevealProps = {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
  as?: 'div' | 'section' | 'li' | 'span'
}

/**
 * Scroll-triggered reveal: content slides up and de-blurs into place as it
 * enters the viewport. GSAP + ScrollTrigger, synced to Lenis via the shared
 * ticker (see SmoothScroll). Reduced-motion just fades in with no transform.
 */
export function Reveal({ children, className, delay = 0, y = 28, as = 'div' }: RevealProps) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (prefersReducedMotion()) {
      gsap.set(el, { opacity: 1, y: 0, filter: 'none' })
      return
    }

    const anim = gsap.fromTo(
      el,
      { opacity: 0, y, filter: 'blur(10px)' },
      {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.9,
        delay,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      },
    )

    return () => {
      anim.scrollTrigger?.kill()
      anim.kill()
    }
  }, [delay, y])

  const Tag = as as 'div'
  return (
    <Tag ref={ref as never} className={className} style={{ opacity: 0 }}>
      {children}
    </Tag>
  )
}

/**
 * Wraps a group of <StaggerItem>s and reveals them one after another when the
 * group scrolls into view.
 */
export function StaggerGroup({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const items = el.querySelectorAll<HTMLElement>('[data-stagger-item]')
    if (items.length === 0) return

    if (prefersReducedMotion()) {
      gsap.set(items, { opacity: 1, y: 0, filter: 'none' })
      return
    }

    const anim = gsap.fromTo(
      items,
      { opacity: 0, y: 34, filter: 'blur(10px)' },
      {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.12,
        scrollTrigger: { trigger: el, start: 'top 80%', once: true },
      },
    )

    return () => {
      anim.scrollTrigger?.kill()
      anim.kill()
    }
  }, [])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div data-stagger-item className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  )
}
