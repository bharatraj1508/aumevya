'use client'

import Link from 'next/link'
import { Star } from 'lucide-react'
import { formatPrice, priceDisplay, priceDisplayWithAddOn } from '@/lib/retreat'
import { bookingMessage } from '@/lib/whatsapp-link'
import { Button } from '@/components/ui/button'
import { PriceTag } from '@/components/site/price-tag'
import { useCourseAccommodation } from '@/components/site/course-accommodation'
import { useWhatsAppLink } from '@/components/site/whatsapp'

const WHATSAPP_URL = /^https?:\/\/(wa\.me|api\.whatsapp\.com)\//

/** Compact enroll panel — price, rating and the Book Now / Enroll action.
 * Lives in the sticky journey rail on desktop and above the content on mobile.
 * When the course has selectable accommodation, the price tracks the choice.
 * Enroll opens WhatsApp with the course details unless `bookNowLink` points to
 * an external non-WhatsApp URL (a wa.me link still gets the detailed message). */
export function CourseEnrollCard({
  courseName,
  price,
  discountPercent,
  ratings,
  bookNowLink,
  featured,
}: {
  courseName: string
  price: number
  discountPercent?: number | null
  ratings: number
  bookNowLink?: string | null
  featured?: boolean | null
}) {
  const acc = useCourseAccommodation()
  const hasOptions = Boolean(acc && acc.options.length > 0)
  // Base price with its discount. With accommodation, show the selected total and
  // strike the equivalent original total (base-only discount → no "% off" on the
  // combined total to avoid implying the add-on is discounted too).
  const base = priceDisplay(price, discountPercent)
  const displayPrice = hasOptions ? acc!.currentPrice : base.price
  // Course accommodation totals are always discountedBase + addOn, so this is safe.
  const display = hasOptions ? priceDisplayWithAddOn(base, displayPrice - base.price) : base
  const selectedName = acc?.selected?.name
  const isFree = displayPrice <= 0

  const waLink = useWhatsAppLink()
  const externalLink = bookNowLink?.trim()
  const href =
    externalLink && /^https?:\/\//.test(externalLink) && !WHATSAPP_URL.test(externalLink)
      ? externalLink
      : waLink(
          bookingMessage(
            [
              ['Course', courseName],
              ['Accommodation', selectedName],
              ['Price', isFree ? 'Free' : formatPrice(displayPrice)],
            ],
            isFree ? 'Namaste, please book my seat.' : undefined,
          ),
        )

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
          <PriceTag display={display} size="lg" />
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
        <a href={href} target="_blank" rel="noopener noreferrer">
          {isFree ? 'Start learning' : 'Enroll now'}
        </a>
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
