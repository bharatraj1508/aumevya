import Link from 'next/link'
import type { GuidanceSlot, OpenDate } from '@/lib/guidance'
import { GuidanceBookingModal } from '@/components/site/guidance-booking-modal'

/**
 * Compact panel with the Book Guidance CTA — sticky on desktop, above the
 * content on mobile. Wraps the booking modal with a little supporting copy.
 */
export function GuidanceBookCard({
  title,
  slug,
  slots,
  openDates,
}: {
  title: string
  slug: string
  slots: GuidanceSlot[]
  openDates: OpenDate[]
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <p className="text-sm font-medium text-muted-foreground">One-on-one mentorship</p>
      <p className="mt-2 text-lg font-semibold text-foreground">
        Book a session that fits your schedule.
      </p>
      <GuidanceBookingModal
        title={title}
        slots={slots}
        openDates={openDates}
        guidanceSlug={slug}
        className="mt-5 h-11 w-full rounded-full text-base"
      />
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Have a question?{' '}
        <Link href="/contact" className="font-medium text-primary underline">
          Talk to us
        </Link>
      </p>
    </div>
  )
}
