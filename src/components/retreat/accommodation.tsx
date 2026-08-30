'use client'

import { createContext, useContext, useMemo, useState } from 'react'
import { Check } from 'lucide-react'
import type { AccommodationId, AccommodationOption } from '@/lib/retreat'
import { formatPrice } from '@/lib/retreat'
import { MediaImage } from '@/components/site/media-image'

type AccommodationContextValue = {
  options: AccommodationOption[]
  /** The current selection, or null when this retreat has no accommodation. */
  selected: AccommodationOption | null
  selectedId: AccommodationId
  setSelectedId: (id: AccommodationId) => void
  /** Full price per person for the current selection, or null when none. */
  finalPrice: number | null
}

const AccommodationContext = createContext<AccommodationContextValue | null>(null)

/**
 * Shares the chosen accommodation between the cards (left column) and the
 * booking card (right column), so selecting an option updates the price.
 * Shared is selected by default. Tolerates an empty `options` list (retreats
 * without accommodation) so it can wrap the page unconditionally.
 */
export function AccommodationProvider({
  options,
  children,
}: {
  options: AccommodationOption[]
  children: React.ReactNode
}) {
  const [selectedId, setSelectedId] = useState<AccommodationId>(() => options[0]?.id ?? 'shared')

  const value = useMemo<AccommodationContextValue>(() => {
    const selected = options.find((o) => o.id === selectedId) ?? options[0] ?? null
    return { options, selected, selectedId, setSelectedId, finalPrice: selected?.total ?? null }
  }, [options, selectedId])

  return <AccommodationContext.Provider value={value}>{children}</AccommodationContext.Provider>
}

/** Read the accommodation selection. Returns null outside a provider. */
export function useAccommodation(): AccommodationContextValue | null {
  return useContext(AccommodationContext)
}

/** The two selectable accommodation cards (radio group). */
export function AccommodationCards() {
  const ctx = useAccommodation()
  if (!ctx || ctx.options.length === 0) return null
  const { options, selectedId, setSelectedId } = ctx

  return (
    <div
      role="radiogroup"
      aria-label="Choose your accommodation"
      className="grid gap-4 sm:grid-cols-2"
    >
      {options.map((opt) => {
        const isSelected = opt.id === selectedId
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => setSelectedId(opt.id)}
            className={`group relative overflow-hidden rounded-2xl border bg-card text-left transition-colors ${
              isSelected
                ? 'border-primary ring-2 ring-primary/25'
                : 'border-border hover:border-primary/40'
            }`}
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
              <MediaImage
                media={opt.image}
                fill
                sizes="(max-width: 640px) 100vw, 320px"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
              <span
                className={`absolute right-3 top-3 flex size-6 items-center justify-center rounded-full border-2 transition-colors ${
                  isSelected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-white/80 bg-black/20'
                }`}
                aria-hidden
              >
                {isSelected && <Check className="size-3.5" strokeWidth={3} />}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 px-4 py-3.5">
              <span className="font-semibold">{opt.label}</span>
              {opt.addOn > 0 ? (
                <span className="inline-flex items-center rounded-lg bg-accent/15 px-2.5 py-1 text-sm font-semibold text-accent-foreground">
                  +{formatPrice(opt.addOn)}
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">Included</span>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
