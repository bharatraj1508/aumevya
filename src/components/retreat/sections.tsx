import { Check, Clock, Minus, Star } from 'lucide-react'
import type { Retreat } from '@/payload-types'

/** A titled content block that doubles as a scroll anchor for the section nav. */
export function Section({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-32 border-b border-border py-8 first:pt-0">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  )
}

export function Stars({ rating, className = '' }: { rating: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`size-4 ${i < Math.round(rating) ? 'fill-accent text-accent' : 'text-border'}`}
        />
      ))}
    </span>
  )
}

/** Included / facilities lists rendered as check chips. */
export function TagList({
  items,
  tone = 'include',
}: {
  items: string[]
  tone?: 'include' | 'exclude' | 'neutral'
}) {
  const Icon = tone === 'exclude' ? Minus : Check
  const iconColor =
    tone === 'exclude' ? 'text-muted-foreground' : tone === 'neutral' ? 'text-primary' : 'text-primary'
  return (
    <ul className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-[15px] leading-relaxed">
          <Icon className={`mt-0.5 size-4 shrink-0 ${iconColor}`} />
          <span className={tone === 'exclude' ? 'text-muted-foreground' : 'text-foreground'}>
            {item}
          </span>
        </li>
      ))}
    </ul>
  )
}

export function BenefitPills({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((b, i) => (
        <span
          key={i}
          className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1.5 text-sm font-medium text-primary"
        >
          {b}
        </span>
      ))}
    </div>
  )
}

type Day = NonNullable<Retreat['programItinerary']>[number]

export function Itinerary({ days }: { days: Day[] }) {
  return (
    <div className="space-y-3">
      {days.map((day, i) => (
        <details
          key={day.id ?? i}
          open={i === 0}
          className="group rounded-xl border border-border bg-card px-5 py-4 [&_summary::-webkit-details-marker]:hidden"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
            <span className="flex items-center gap-3 font-semibold">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {i + 1}
              </span>
              {day.title || `Day ${i + 1}`}
            </span>
            <span className="text-muted-foreground transition-transform group-open:rotate-45">
              <span className="text-xl leading-none">+</span>
            </span>
          </summary>
          {day.timeline && day.timeline.length > 0 && (
            <ol className="mt-4 space-y-4 border-l border-dashed border-border pl-5">
              {day.timeline.map((slot, j) => (
                <li key={slot.id ?? j} className="relative">
                  <span className="absolute -left-[1.4rem] top-1 size-2.5 rounded-full bg-primary ring-4 ring-card" />
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-primary">
                    <Clock className="size-3.5" />
                    {slot.time}
                  </p>
                  <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">
                    {slot.description}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </details>
      ))}
    </div>
  )
}

type Review = NonNullable<Retreat['retreatReviews']>[number]

export function ReviewList({ reviews }: { reviews: Review[] }) {
  const initials = (name: string) =>
    name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase()
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {reviews.map((r, i) => (
        <figure key={r.id ?? i} className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {initials(r.reviewerName)}
            </span>
            <div className="min-w-0">
              <figcaption className="truncate font-semibold">{r.reviewerName}</figcaption>
              <Stars rating={r.rating} className="mt-0.5" />
            </div>
          </div>
          <blockquote className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
            “{r.reviewDescription}”
          </blockquote>
        </figure>
      ))}
    </div>
  )
}
