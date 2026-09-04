'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useLenis } from 'lenis/react'
import { Star, X } from 'lucide-react'
import type { Course } from '@/payload-types'
import { priceLabel } from '@/lib/course'
import { Button } from '@/components/ui/button'
import { MediaImage } from '@/components/site/media-image'
import { RichText } from '@/components/RichText'

/** A rich-text "about" is only worth expanding if it has real content —
 * a document of empty paragraphs would reveal blank space. */
function hasAbout(about: Course['about']): boolean {
  const children = about?.root?.children
  if (!children?.length) return false
  return children.some(
    (node) => Array.isArray(node.children) && (node.children as unknown[]).length > 0,
  )
}

/** External links open in a new tab; internal paths use client routing. */
function BookNowButton({ href, className }: { href: string; className?: string }) {
  const isExternal = /^https?:\/\//.test(href)
  const stop = (e: React.MouseEvent) => e.stopPropagation()
  if (isExternal) {
    return (
      <Button asChild className={className} onClick={stop}>
        <a href={href} target="_blank" rel="noopener noreferrer">
          Book Now
        </a>
      </Button>
    )
  }
  return (
    <Button asChild className={className} onClick={stop}>
      <Link href={href}>Book Now</Link>
    </Button>
  )
}

function RatingBadge({ value, className }: { value: number; className?: string }) {
  return (
    <span className={className}>
      <Star className="size-[18px] fill-primary text-primary" />
      <span className="text-base font-bold text-foreground">{value.toFixed(1)}</span>
    </span>
  )
}

export function CourseCard({ course }: { course: Course }) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const reduce = useReducedMotion()
  const lenis = useLenis()

  // The overlay is portaled to <body>; only render it once mounted on the client.
  useEffect(() => setMounted(true), [])
  const bookNowHref = course.bookNowLink?.trim() || '/contact'
  const showAbout = hasAbout(course.about)
  const layoutId = `course-card-${course.id}`
  const spring = reduce
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 260, damping: 30 }

  // While expanded: pause Lenis (which otherwise hijacks wheel/touch on the
  // whole window) so the background stays put, and close on Escape. The overlay
  // itself carries `data-lenis-prevent` so it scrolls natively.
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    lenis?.stop()
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      lenis?.start()
    }
  }, [open, lenis])

  return (
    <>
      {/* Collapsed card in the grid. Clicking anywhere on it expands. */}
      <motion.article
        layoutId={layoutId}
        onClick={() => setOpen(true)}
        transition={spring}
        style={{ borderRadius: 24 }}
        className="group flex h-full cursor-pointer flex-col overflow-hidden border border-border bg-card p-3 shadow-sm transition-shadow duration-300 hover:shadow-lg"
      >
        <motion.div
          layoutId={`${layoutId}-image`}
          transition={spring}
          className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-2xl"
        >
          <MediaImage
            media={course.image}
            fill
            sizes="(min-width: 1024px) 32rem, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {course.featured && (
            <span className="absolute left-4 top-4 rounded-full bg-foreground/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-background backdrop-blur">
              Featured
            </span>
          )}
        </motion.div>

        <div className="flex flex-1 flex-col px-3 pb-2 pt-5">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-2xl font-bold leading-tight tracking-tight">{course.name}</h3>
            <RatingBadge value={course.ratings} className="mt-1 inline-flex shrink-0 items-center gap-1.5" />
          </div>

          <p className="mt-3 line-clamp-2 text-[15px] leading-relaxed text-muted-foreground">
            {course.summary}
          </p>

          {showAbout && (
            <span className="mt-3 inline-flex w-fit items-center text-sm font-semibold text-primary">
              Read more
            </span>
          )}

          <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-6">
            <span className="leading-tight">
              <span className="block text-[11px] uppercase tracking-wide text-muted-foreground">
                from
              </span>
              <span className="text-xl font-bold text-foreground">{priceLabel(course.price)}</span>
            </span>
            <BookNowButton href={bookNowHref} className="rounded-full px-8" />
          </div>
        </div>
      </motion.article>

      {/* Expanded overlay — faded-black backdrop + the same card morphed to
          the centre of the screen. Clicking the backdrop dismisses it.
          Portaled to <body> so the fixed backdrop isn't trapped by an
          ancestor's transform (from the scroll-reveal / layout animation). */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.25 }}
            onClick={() => setOpen(false)}
            data-lenis-prevent
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm sm:p-6"
          >
            <motion.article
              layoutId={layoutId}
              transition={spring}
              style={{ borderRadius: 24 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={course.name}
              className="relative flex h-[85vh] w-full max-w-xl flex-col overflow-hidden border border-border bg-card shadow-2xl"
            >
              {/* Header — pinned image */}
              <motion.div
                layoutId={`${layoutId}-image`}
                transition={spring}
                className="relative aspect-[16/10] w-full shrink-0 overflow-hidden"
              >
                <MediaImage media={course.image} fill sizes="36rem" className="object-cover" />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full bg-card/90 text-foreground shadow-sm backdrop-blur transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <X className="size-4" />
                </button>
              </motion.div>

              {/* Body + footer fade in after the morph so nothing looks stretched. */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: reduce ? 0 : 0.2, delay: reduce ? 0 : 0.15 }}
                className="flex min-h-0 flex-1 flex-col"
              >
                {/* Middle — the only scrollable region */}
                <div
                  data-lenis-prevent
                  className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-6 md:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-2xl font-bold leading-tight tracking-tight md:text-3xl">
                      {course.name}
                    </h3>
                    <RatingBadge value={course.ratings} className="mt-1 inline-flex shrink-0 items-center gap-1.5" />
                  </div>

                  <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                    {course.summary}
                  </p>

                  <RichText
                    data={course.about}
                    className="mt-4 max-w-none text-[15px] leading-relaxed text-muted-foreground"
                  />
                </div>

                {/* Footer — pinned Book Now CTA */}
                <div className="flex shrink-0 flex-wrap items-end justify-between gap-4 border-t border-border bg-card px-6 py-4 md:px-8">
                  <span className="leading-tight">
                    <span className="block text-[11px] uppercase tracking-wide text-muted-foreground">
                      from
                    </span>
                    <span className="text-xl font-bold text-foreground">
                      {priceLabel(course.price)}
                    </span>
                  </span>
                  <BookNowButton href={bookNowHref} className="rounded-full px-8" />
                </div>
              </motion.div>
            </motion.article>
          </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  )
}
