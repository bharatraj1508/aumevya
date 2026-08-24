import Link from 'next/link'
import { CalendarDays, Heart, MapPin, Star } from 'lucide-react'
import type { Retreat } from '@/payload-types'
import { coverImage, dateRange, durationLabel, formatPrice } from '@/lib/retreat'
import { MediaImage } from './media-image'

export function RetreatCard({ retreat }: { retreat: Retreat }) {
  const reviews = retreat.retreatReviews?.length ?? 0
  return (
    <Link
      href={`/retreats/${retreat.slug}`}
      className="group flex h-full flex-col rounded-3xl border border-border bg-card p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      {/* Padded, rounded cover — inset from the card edges */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
        <MediaImage
          media={coverImage(retreat)}
          fill
          sizes="(min-width: 768px) 33vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {retreat.featured && (
          <span className="absolute left-3 top-3 rounded-full bg-foreground/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-background backdrop-blur">
            Featured
          </span>
        )}
        <span
          aria-hidden
          className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-card/95 text-muted-foreground shadow-sm transition-colors group-hover:text-primary"
        >
          <Heart className="size-4" />
        </span>
      </div>

      <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
        <h3 className="line-clamp-2 text-xl font-bold leading-tight tracking-tight">
          {retreat.title}
        </h3>

        <div className="mt-3 space-y-2 text-[15px] text-muted-foreground">
          <p className="flex items-center gap-2">
            <MapPin className="size-[18px] shrink-0" />
            <span className="truncate">{retreat.location}</span>
          </p>
          <p className="flex items-center gap-2">
            <CalendarDays className="size-[18px] shrink-0" />
            <span>{dateRange(retreat.fromDate, retreat.toDate) || durationLabel(retreat.fromDate, retreat.toDate)}</span>
          </p>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <span className="inline-flex items-center gap-1.5">
            <Star className="size-[18px] fill-primary text-primary" />
            <span className="text-lg font-bold text-foreground">{retreat.ratings.toFixed(2)}</span>
            <span className="text-sm text-muted-foreground">
              ({reviews} {reviews === 1 ? 'review' : 'reviews'})
            </span>
          </span>
          <span className="text-right leading-tight">
            <span className="block text-[11px] uppercase tracking-wide text-muted-foreground">
              from
            </span>
            <span className="font-bold text-foreground">{formatPrice(retreat.price)}</span>
          </span>
        </div>
      </div>
    </Link>
  )
}
