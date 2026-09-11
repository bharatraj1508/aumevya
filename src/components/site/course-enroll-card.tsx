'use client'

import Link from 'next/link'
import { Star } from 'lucide-react'
import { priceLabel } from '@/lib/course'
import { Button } from '@/components/ui/button'
import { useCourseAccommodation } from '@/components/site/course-accommodation'

/** Compact enroll panel — price, rating and the Book Now / Enroll action.
 * Lives in the sticky journey rail on desktop and above the content on mobile.
 * When the course has selectable accommodation, the price tracks the choice. */
export function CourseEnrollCard({
  price,
  ratings,
  bookNowLink,
  featured,
}: {
  price: number
  ratings: number
  bookNowLink?: string | null
  featured?: boolean | null
}) {
  const acc = useCourseAccommodation()
  const hasOptions = Boolean(acc && acc.options.length > 0)
  const displayPrice = hasOptions ? acc!.currentPrice : price
  const selectedName = acc?.selected?.name
  const isFree = displayPrice <= 0

  const href = bookNowLink?.trim() || '/contact'
  const isExternal = /^https?:\/\//.test(href)

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      {featured && (
        <span className="mb-4 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
          Featured course
        </span>
      )}
      <div className="flex items-end justify-between gap-3">
        <span className="min-w-0 leading-tight">
          <span className="block text-[11px] uppercase tracking-wide text-muted-foreground">
            {hasOptions ? 'Total per person' : isFree ? 'Price' : 'from'}
          </span>
          <span className="text-3xl font-bold text-foreground">{priceLabel(displayPrice)}</span>
          {selectedName && (
            <span className="mt-0.5 block truncate text-xs text-muted-foreground">{selectedName}</span>
          )}
        </span>
        <span className="inline-flex shrink-0 items-center gap-1.5">
          <Star className="size-4 fill-accent text-accent" />
          <span className="font-semibold">{ratings.toFixed(1)}</span>
        </span>
      </div>

      <Button asChild className="mt-5 h-11 w-full rounded-full text-base">
        {isExternal ? (
          <a href={href} target="_blank" rel="noopener noreferrer">
            {isFree ? 'Start learning' : 'Enroll now'}
          </a>
        ) : (
          <Link href={href}>{isFree ? 'Start learning' : 'Enroll now'}</Link>
        )}
      </Button>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        Have a question?{' '}
        <Link href="/contact" className="font-medium text-primary underline">
          Talk to us
        </Link>
      </p>
    </div>
  )
}
