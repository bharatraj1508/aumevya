'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useLenis } from 'lenis/react'
import { Star, X } from 'lucide-react'
import type { Course, Media } from '@/payload-types'
import { priceLabel } from '@/lib/course'
import { formatPrice } from '@/lib/retreat'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { MediaImage } from '@/components/site/media-image'
import { RichText } from '@/components/RichText'

type RichTextDoc = Course['about']

/** A tab in the detail popup. The admin picks its shape (a "block") in the CMS;
 * this is the normalised view the modal renders. */
type DetailTab =
  | { kind: 'content'; label: string; content: RichTextDoc }
  | {
      kind: 'itinerary'
      label: string
      intro?: string | null
      items: { id?: string | null; heading: string; description: string }[]
    }
  | {
      kind: 'gallery'
      label: string
      intro?: string | null
      items: {
        id?: string | null
        name: string
        price?: number | null
        image: string | Media
        description?: string | null
      }[]
    }

/** A rich-text document is only worth showing if it has real content —
 * a document of empty paragraphs would reveal blank space. */
function hasRichText(doc: RichTextDoc): boolean {
  const children = doc?.root?.children
  if (!children?.length) return false
  return children.some(
    (node) => Array.isArray(node.children) && (node.children as unknown[]).length > 0,
  )
}

/** Normalise the admin's tab blocks into a flat list the modal can render,
 * dropping any that are empty. The "about" doc leads as the "Overview" tab. */
function buildDetailTabs(course: Course): DetailTab[] {
  const tabs: DetailTab[] = []
  if (hasRichText(course.about)) {
    tabs.push({ kind: 'content', label: 'Overview', content: course.about })
  }
  for (const block of course.tabs ?? []) {
    if (!block.label?.trim()) continue
    if (block.blockType === 'contentTab') {
      if (hasRichText(block.content)) {
        tabs.push({ kind: 'content', label: block.label, content: block.content })
      }
    } else if (block.blockType === 'itineraryTab') {
      if (block.items?.length) {
        tabs.push({ kind: 'itinerary', label: block.label, intro: block.intro, items: block.items })
      }
    } else if (block.blockType === 'galleryTab') {
      if (block.items?.length) {
        tabs.push({ kind: 'gallery', label: block.label, intro: block.intro, items: block.items })
      }
    }
  }
  return tabs
}

/** Renders a single tab's body according to its kind. */
function CourseTabContent({ tab }: { tab: DetailTab }) {
  if (tab.kind === 'content') {
    return (
      <RichText
        data={tab.content}
        className="mt-5 max-w-none text-[15px] leading-relaxed text-muted-foreground"
      />
    )
  }

  if (tab.kind === 'itinerary') {
    return (
      <div className="mt-5">
        {tab.intro && (
          <p className="text-[15px] leading-relaxed text-muted-foreground">{tab.intro}</p>
        )}
        <ol className={cn('space-y-6 border-l border-border pl-6', tab.intro && 'mt-5')}>
          {tab.items.map((item, i) => (
            <li key={item.id ?? i} className="relative">
              <span className="absolute -left-[30px] top-1.5 size-3 rounded-full border-2 border-primary bg-card" />
              <h4 className="font-semibold text-foreground">{item.heading}</h4>
              <p className="mt-1 whitespace-pre-line text-[15px] leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    )
  }

  return (
    <div className="mt-5">
      {tab.intro && (
        <p className="text-[15px] leading-relaxed text-muted-foreground">{tab.intro}</p>
      )}
      <div className={cn('grid gap-4 sm:grid-cols-2', tab.intro && 'mt-4')}>
        {tab.items.map((item, i) => (
          <figure
            key={item.id ?? i}
            className="overflow-hidden rounded-2xl border border-border bg-card"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
              <MediaImage
                media={item.image}
                fill
                sizes="(max-width: 640px) 100vw, 320px"
                className="object-cover"
              />
            </div>
            <figcaption className="flex items-center justify-between gap-3 px-4 py-3.5">
              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground">{item.name}</p>
                {item.description && (
                  <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                )}
              </div>
              {typeof item.price === 'number' && item.price > 0 && (
                <span className="inline-flex shrink-0 items-center rounded-lg bg-accent/15 px-2.5 py-1 text-sm font-semibold text-accent-foreground">
                  {formatPrice(item.price)}
                </span>
              )}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
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
  const [activeTab, setActiveTab] = useState(0)
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const reduce = useReducedMotion()
  const lenis = useLenis()

  // The overlay is portaled to <body>; only render it once mounted on the client.
  useEffect(() => setMounted(true), [])
  const bookNowHref = course.bookNowLink?.trim() || '/contact'

  // The whole modal body is one scroll region. A zero-height sentinel sits just
  // below the banner; when it scrolls out of the region the sticky header is
  // pinned, which docks the banner into a small top-left thumbnail. Using the
  // sentinel (not a pixel threshold) keeps this correct at any banner height.
  const scrollRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const root = scrollRef.current
    const sentinel = sentinelRef.current
    if (!root || !sentinel) return
    const io = new IntersectionObserver(
      ([entry]) => setCollapsed(!entry.isIntersecting),
      { root, threshold: 0 },
    )
    io.observe(sentinel)
    return () => io.disconnect()
  }, [open])

  // The detail popup is tab-driven: the "about" doc becomes the first "Overview"
  // tab, followed by whatever tabs (Normal, Itinerary, Gallery) the admin added.
  // Empty tabs are dropped so a blank tab never appears.
  const detailTabs = buildDetailTabs(course)
  const hasDetail = detailTabs.length > 0
  const openModal = () => {
    setActiveTab(0)
    setCollapsed(false)
    setOpen(true)
  }
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
        onClick={openModal}
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

          {hasDetail && (
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
              className="relative flex h-[85vh] w-full max-w-xl flex-col overflow-hidden border border-border bg-card shadow-2xl md:max-w-3xl lg:max-w-5xl"
            >
              {/* Close — always visible, so it survives the banner collapse. */}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="absolute right-4 top-4 z-20 flex size-9 items-center justify-center rounded-full bg-card/90 text-foreground shadow-sm backdrop-blur transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <X className="size-4" />
              </button>

              {/* Body + footer fade in after the open morph so nothing looks
                  stretched. Everything below the close button lives in ONE
                  scroll region so a wheel anywhere over the modal works. */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: reduce ? 0 : 0.2, delay: reduce ? 0 : 0.12 }}
                className="flex min-h-0 flex-1 flex-col"
              >
                <div
                  ref={scrollRef}
                  data-lenis-prevent
                  className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  {/* Banner — scrolls up and out of view. */}
                  <motion.div
                    layoutId={`${layoutId}-image`}
                    transition={spring}
                    className="relative h-[34vh] max-h-80 w-full overflow-hidden"
                  >
                    <MediaImage
                      media={course.image}
                      fill
                      sizes="(min-width: 1024px) 64rem, (min-width: 768px) 48rem, 100vw"
                      className="object-cover"
                    />
                  </motion.div>

                  {/* Sentinel — its exit from the scroll region docks the thumbnail. */}
                  <div ref={sentinelRef} aria-hidden className="h-px w-full" />

                  {/* Sticky header — title, subtitle and tabs pin to the top; a
                      small thumbnail slides in once the banner has scrolled away. */}
                  <div className="sticky top-0 z-10 bg-card px-6 pt-5 md:px-8">
                    <div className="flex items-start">
                      <AnimatePresence initial={false}>
                        {collapsed && (
                          <motion.div
                            key="thumb"
                            initial={{ opacity: 0, width: 0, marginRight: 0, scale: 0.7 }}
                            animate={{ opacity: 1, width: 60, marginRight: 16, scale: 1 }}
                            exit={{ opacity: 0, width: 0, marginRight: 0, scale: 0.7 }}
                            transition={spring}
                            className="relative aspect-square shrink-0 self-start overflow-hidden rounded-xl"
                          >
                            <MediaImage media={course.image} fill sizes="80px" className="object-cover" />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="text-2xl font-bold leading-tight tracking-tight md:text-3xl">
                            {course.name}
                          </h3>
                          <RatingBadge value={course.ratings} className="mt-1 inline-flex shrink-0 items-center gap-1.5" />
                        </div>

                        <p className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-muted-foreground">
                          {course.summary}
                        </p>
                      </div>
                    </div>

                    {/* Tab bar — only when there's more than one tab to switch
                        between. Its bottom border spans to the padded edges and
                        forms the divider under the pinned header. */}
                    {detailTabs.length > 1 && (
                      <div
                        role="tablist"
                        aria-label="Course details"
                        className="-mx-6 mt-5 flex gap-6 overflow-x-auto border-b border-border px-6 md:-mx-8 md:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                      >
                        {detailTabs.map((tab, i) => (
                          <button
                            key={i}
                            type="button"
                            role="tab"
                            aria-selected={i === activeTab}
                            onClick={() => setActiveTab(i)}
                            className={cn(
                              'relative shrink-0 whitespace-nowrap py-3 text-sm font-semibold transition-colors focus-visible:outline-none',
                              i === activeTab
                                ? 'text-primary'
                                : 'text-muted-foreground hover:text-foreground',
                            )}
                          >
                            {tab.label}
                            {i === activeTab && (
                              <motion.span
                                layoutId={`${layoutId}-tabindicator`}
                                transition={spring}
                                className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary"
                              />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Tab content */}
                  <div className="px-6 pb-6 md:px-8">
                    {hasDetail && (
                      <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: reduce ? 0 : 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: reduce ? 0 : 0.2 }}
                      >
                        <CourseTabContent tab={detailTabs[activeTab]} />
                      </motion.div>
                    )}
                  </div>
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
