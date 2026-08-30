'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BadgeCheck, CalendarDays, ShieldCheck, Star, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BookingForm } from '@/components/forms/booking-form'
import { dateRange, durationLabel, formatPrice } from '@/lib/retreat'
import { useAccommodation } from '@/components/retreat/accommodation'

type Props = {
  id: string
  title: string
  price: number
  fromDate: string
  toDate: string
  ratings: number
  reviewCount: number
}

export function BookingCard({ id, title, price, fromDate, toDate, ratings, reviewCount }: Props) {
  const [open, setOpen] = useState(false)
  const accommodation = useAccommodation()
  const selected = accommodation?.selected ?? null
  const displayPrice = accommodation?.finalPrice ?? price

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <>
      <div className="rounded-2xl border border-border bg-card p-6 shadow-lg shadow-black/5">
        <p className="text-sm font-medium text-muted-foreground">{durationLabel(fromDate, toDate)}</p>

        <div className="mt-3 flex items-end justify-between gap-3">
          <div>
            <span className="block text-xs uppercase tracking-wide text-muted-foreground">
              {selected ? `${selected.label} · from` : 'from'}
            </span>
            <span className="text-3xl font-bold leading-none">{formatPrice(displayPrice)}</span>
            <span className="text-sm text-muted-foreground"> / person</span>
            {selected && selected.addOn > 0 && (
              <span className="mt-1 block text-xs text-muted-foreground">
                Includes +{formatPrice(selected.addOn)} accommodation add-on
              </span>
            )}
          </div>
          <span className="inline-flex items-center gap-1 rounded-lg bg-accent/15 px-2.5 py-1 text-sm font-semibold text-accent-foreground">
            <Star className="size-4 fill-accent text-accent" />
            {ratings.toFixed(1)}
          </span>
        </div>

        <div className="mt-5 flex items-center gap-2 rounded-xl border border-border bg-muted px-4 py-3 text-sm">
          <CalendarDays className="size-4 text-primary" />
          <span className="font-medium">{dateRange(fromDate, toDate)}</span>
        </div>

        <Button size="lg" className="mt-4 w-full" onClick={() => setOpen(true)}>
          Book Now
        </Button>

        <div className="my-3 flex items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>

        <Button asChild size="lg" variant="outline" className="w-full">
          <Link href="/contact">Contact Host</Link>
        </Button>

        <ul className="mt-5 space-y-2.5 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" /> Free cancellation available
          </li>
          <li className="flex items-center gap-2">
            <BadgeCheck className="size-4 text-primary" /> No booking or credit card fees
          </li>
          {reviewCount > 0 && (
            <li className="flex items-center gap-2">
              <Star className="size-4 text-primary" /> Rated {ratings.toFixed(1)} by {reviewCount}{' '}
              {reviewCount === 1 ? 'guest' : 'guests'}
            </li>
          )}
        </ul>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label={`Book ${title}`}
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="relative my-8 w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl sm:p-8">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>
            <h2 className="text-xl font-bold">Request to book</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Tell us a little about yourself and we&apos;ll confirm your spot on{' '}
              <span className="font-medium text-foreground">{title}</span>.
            </p>
            <div className="mt-6">
              <BookingForm
                services={[{ id, title }]}
                defaultServiceId={id}
                lockService
                accommodation={
                  selected ? { label: selected.label, price: displayPrice } : undefined
                }
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
