'use client'

import { useEffect, useState } from 'react'
import { useLenis } from 'lenis/react'
import { cn } from '@/lib/utils'

type RailItem = { id: string; label: string }

/**
 * The course page's signature element: a vertical "learning path" — numbered
 * nodes joined by a line, one per section. Highlights the section in view and
 * smooth-scrolls on click. Hidden when there's only one section.
 */
export function CourseJourneyRail({ items }: { items: RailItem[] }) {
  const [active, setActive] = useState(items[0]?.id)
  const lenis = useLenis()

  useEffect(() => {
    const els = items
      .map((it) => document.getElementById(it.id))
      .filter((el): el is HTMLElement => Boolean(el))
    if (!els.length) return
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      // Trigger the active band around the upper-middle of the viewport.
      { rootMargin: '-25% 0px -65% 0px', threshold: 0 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [items])

  const go = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    if (lenis) lenis.scrollTo(el, { offset: -112 })
    else el.scrollIntoView({ behavior: 'smooth' })
  }

  if (items.length < 2) return null

  return (
    <nav aria-label="Course contents" className="relative">
      <span
        aria-hidden
        className="absolute bottom-4 left-[0.875rem] top-4 w-px bg-border"
      />
      <ol className="space-y-1">
        {items.map((item, i) => {
          const on = item.id === active
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => go(item.id)}
                aria-current={on ? 'true' : undefined}
                className="group flex w-full items-center gap-3 rounded-lg py-2 pr-2 text-left"
              >
                <span
                  className={cn(
                    'relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border font-mono text-[0.7rem] font-bold transition-colors',
                    on
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-muted-foreground group-hover:border-primary/50',
                  )}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span
                  className={cn(
                    'text-sm font-semibold transition-colors',
                    on ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
                  )}
                >
                  {item.label}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
