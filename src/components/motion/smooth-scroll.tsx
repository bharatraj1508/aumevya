'use client'

import { ReactLenis, type LenisRef } from 'lenis/react'
import { useEffect, useRef, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { gsap, ScrollTrigger } from '@/lib/gsap'

/**
 * Momentum smooth-scroll for the whole public site, driven by GSAP's ticker so
 * Lenis and every ScrollTrigger share a single RAF loop. Without this, scrubbed
 * GSAP animations (e.g. the pinned gallery) drift a frame behind Lenis and feel
 * laggy. Lenis disables itself automatically under prefers-reduced-motion.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<LenisRef>(null)

  useEffect(() => {
    function update(time: number) {
      lenisRef.current?.lenis?.raf(time * 1000)
    }
    gsap.ticker.add(update)
    gsap.ticker.lagSmoothing(0)

    const lenis = lenisRef.current?.lenis
    lenis?.on('scroll', ScrollTrigger.update)

    return () => {
      gsap.ticker.remove(update)
      lenis?.off('scroll', ScrollTrigger.update)
    }
  }, [])

  return (
    <>
      <ScrollProgress />
      <ReactLenis
        root
        ref={lenisRef}
        options={{ autoRaf: false, lerp: 0.1, duration: 1.2, smoothWheel: true }}
      >
        {children}
      </ReactLenis>
    </>
  )
}

/**
 * Thin gradient bar that tracks reading progress down the page. Hidden on the
 * landing page, which is intentionally kept free of any scroll indicator.
 */
function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const hidden = pathname === '/'

  useEffect(() => {
    if (hidden) return
    const el = ref.current
    if (!el) return
    gsap.set(el, { scaleX: 0, transformOrigin: 'left center' })
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => gsap.set(el, { scaleX: self.progress }),
    })
    return () => st.kill()
  }, [hidden])

  if (hidden) return null

  return (
    <div
      ref={ref}
      aria-hidden
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-primary via-accent to-primary"
    />
  )
}
