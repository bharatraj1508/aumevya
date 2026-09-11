'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import { Check } from 'lucide-react'
import type { Media } from '@/payload-types'
import { formatPrice } from '@/lib/retreat'
import { cn } from '@/lib/utils'
import { MediaImage } from '@/components/site/media-image'

export type CourseAccommodationOption = {
  id: string
  name: string
  image: string | Media
  description?: string | null
  /** Full price for this option (base price + any add-on). */
  total: number
  /** Extra on top of the base price (0 when priced at base). */
  addOn: number
}

type Ctx = {
  options: CourseAccommodationOption[]
  selectedId: string | null
  setSelectedId: (id: string) => void
  selected: CourseAccommodationOption | null
  /** Price to charge: the selected option's total, or the base price. */
  currentPrice: number
}

const AccommodationContext = createContext<Ctx | null>(null)

export function useCourseAccommodation() {
  return useContext(AccommodationContext)
}

/** Shares the chosen accommodation between the cards and the enroll card, so a
 * selection updates the displayed price. Defaults to the base-priced option. */
export function CourseAccommodationProvider({
  basePrice,
  options,
  children,
}: {
  basePrice: number
  options: CourseAccommodationOption[]
  children: ReactNode
}) {
  const initial = options.find((o) => o.addOn === 0)?.id ?? options[0]?.id ?? null
  const [selectedId, setSelectedId] = useState<string | null>(initial)
  const selected = options.find((o) => o.id === selectedId) ?? null
  const currentPrice = selected ? selected.total : basePrice

  return (
    <AccommodationContext.Provider
      value={{ options, selectedId, setSelectedId, selected, currentPrice }}
    >
      {children}
    </AccommodationContext.Provider>
  )
}

/** Selectable accommodation cards (single choice). Reads options from context. */
export function CourseAccommodationCards({ intro }: { intro?: string | null }) {
  const ctx = useCourseAccommodation()
  if (!ctx || ctx.options.length === 0) return null
  const { options, selectedId, setSelectedId } = ctx

  return (
    <div>
      {intro && (
        <p className="mb-6 text-[15px] leading-relaxed text-muted-foreground md:text-base">{intro}</p>
      )}
      <div
        role="radiogroup"
        aria-label="Choose your accommodation"
        className="grid gap-5 sm:grid-cols-2"
      >
        {options.map((opt) => {
          const on = opt.id === selectedId
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setSelectedId(opt.id)}
              className={cn(
                'group relative overflow-hidden rounded-2xl border bg-card text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                on ? 'border-primary ring-2 ring-primary/25' : 'border-border hover:border-primary/40',
              )}
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <MediaImage
                  media={opt.image}
                  fill
                  sizes="(max-width: 640px) 100vw, 400px"
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
                <span
                  aria-hidden
                  className={cn(
                    'absolute right-3 top-3 flex size-6 items-center justify-center rounded-full border-2 transition-colors',
                    on
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-white/80 bg-black/20',
                  )}
                >
                  {on && <Check className="size-3.5" strokeWidth={3} />}
                </span>
                {opt.addOn === 0 && (
                  <span className="absolute left-3 top-3 rounded-full bg-primary/90 px-2.5 py-1 text-xs font-semibold text-primary-foreground backdrop-blur">
                    Included in base price
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-3 px-5 py-4">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">{opt.name}</p>
                  {opt.description && (
                    <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                      {opt.description}
                    </p>
                  )}
                </div>
                <span className="shrink-0 text-right leading-tight">
                  <span className="block font-bold text-foreground">
                    {opt.total > 0 ? formatPrice(opt.total) : 'Free'}
                  </span>
                  {opt.addOn > 0 && (
                    <span className="text-xs text-muted-foreground">
                      +{formatPrice(opt.addOn)} add-on
                    </span>
                  )}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
