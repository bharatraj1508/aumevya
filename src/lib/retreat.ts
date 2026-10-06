import type { CSSProperties } from 'react'
import type { Retreat } from '@/payload-types'
import { cropStyle, type CropMap } from '@/lib/crops'

/** Number of nights between the from/to dates (min 0). */
export function nights(from?: string | null, to?: string | null): number {
  if (!from || !to) return 0
  const ms = new Date(to).getTime() - new Date(from).getTime()
  if (Number.isNaN(ms)) return 0
  return Math.max(0, Math.round(ms / 86_400_000))
}

/** "7 days / 6 nights" style duration label derived from the dates. */
export function durationLabel(from?: string | null, to?: string | null): string {
  const n = nights(from, to)
  const days = n + 1
  return `${days} ${days === 1 ? 'day' : 'days'} / ${n} ${n === 1 ? 'night' : 'nights'}`
}

/** "12 – 18 Mar 2026" style compact date range. */
export function dateRange(from?: string | null, to?: string | null): string {
  if (!from || !to) return ''
  const f = new Date(from)
  const t = new Date(to)
  const sameMonth = f.getMonth() === t.getMonth() && f.getFullYear() === t.getFullYear()
  const day = (d: Date) => d.getDate()
  const mon = (d: Date) => d.toLocaleDateString('en-GB', { month: 'short' })
  const year = (d: Date) => d.getFullYear()
  if (sameMonth) return `${day(f)}–${day(t)} ${mon(t)} ${year(t)}`
  if (f.getFullYear() === t.getFullYear())
    return `${day(f)} ${mon(f)} – ${day(t)} ${mon(t)} ${year(t)}`
  return `${day(f)} ${mon(f)} ${year(f)} – ${day(t)} ${mon(t)} ${year(t)}`
}

/** Localised Indian-rupee price, no decimals. e.g. ₹1,53,145 */
export function formatPrice(price?: number | null): string {
  if (price == null) return ''
  return `₹${price.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

/** Clamp a discount percentage to a sane 0–100 range (0 when unset). */
export function clampDiscount(pct?: number | null): number {
  if (!pct || pct <= 0) return 0
  return Math.min(100, pct)
}

/** Apply a percentage discount to a base price, rounded to whole rupees. */
export function discountedPrice(base: number, pct?: number | null): number {
  const d = clampDiscount(pct)
  return d ? Math.round(base * (1 - d / 100)) : base
}

/**
 * Resolve a base price + optional percentage discount into everything the UI
 * needs to show an Amazon-style price: the effective price, its label, and —
 * only when discounted — the struck-through original and the percent off.
 */
export type PriceDisplay = {
  /** Effective (discounted) price. */
  price: number
  /** Formatted effective price, "Free" at 0. */
  priceLabel: string
  /** Original base price when discounted, else null. */
  original: number | null
  /** Formatted struck-through original, else null. */
  originalLabel: string | null
  /** Whole-number percent off (1–100) when discounted, else null. */
  discountPercent: number | null
}

export function priceDisplay(base: number, pct?: number | null): PriceDisplay {
  const d = clampDiscount(pct)
  const price = d ? Math.round(base * (1 - d / 100)) : base
  return {
    price,
    priceLabel: price <= 0 ? 'Free' : formatPrice(price),
    original: d ? base : null,
    originalLabel: d ? formatPrice(base) : null,
    discountPercent: d ? Math.round(d) : null,
  }
}

/**
 * Add a full-price accommodation add-on to a discounted base. The add-on isn't
 * discounted, so the combined total strikes through `original + addOn` but drops
 * the "% off" tag (the percentage no longer applies to the whole total). An
 * add-on of 0 returns the base untouched, keeping its "% off".
 */
export function priceDisplayWithAddOn(base: PriceDisplay, addOn: number): PriceDisplay {
  if (addOn <= 0) return base
  const price = base.price + addOn
  return {
    price,
    priceLabel: price <= 0 ? 'Free' : formatPrice(price),
    original: base.original != null ? base.original + addOn : null,
    originalLabel: base.original != null ? formatPrice(base.original + addOn) : null,
    discountPercent: null,
  }
}

/** Cover image is the first item of the gallery. */
export function coverImage(retreat: Pick<Retreat, 'images'>): Retreat['images'][number] | undefined {
  return retreat.images?.[0]
}

// ── Accommodation ──────────────────────────────────────────────────────────
// Two fixed options (Shared / Private). Shared is the base price (or a custom
// override); Private is the base price plus an add-on. Both need an image to
// appear on the site.

export type AccommodationId = 'shared' | 'private'

export type AccommodationOption = {
  id: AccommodationId
  label: string
  /** Payload media relationship (populated) or null. */
  image: NonNullable<Retreat['accommodation']>['sharedImage'] | null
  /** Admin-chosen crop as a CSS style (position + any zoom/rotation). */
  cropStyle: CSSProperties
  /** Full price per person for this option. */
  total: number
  /** Amount added on top of the base price (0 for Shared). */
  addOn: number
}

/** The site only shows accommodation once both option images are uploaded. */
export function hasAccommodation(retreat: Pick<Retreat, 'accommodation'>): boolean {
  const a = retreat.accommodation
  return Boolean(a?.sharedImage && a?.privateImage)
}

/** Build the two selectable options with computed pricing. The discount applies
 * to the base price only; a custom Shared price is an explicit override (not
 * discounted) and add-ons stay full. */
export function accommodationOptions(
  retreat: Pick<Retreat, 'accommodation' | 'price' | 'discountPercent'>,
): AccommodationOption[] {
  const a = retreat.accommodation
  const effectiveBase = discountedPrice(retreat.price, retreat.discountPercent)
  const shared =
    a?.sharedPriceMode === 'custom' && typeof a.sharedPrice === 'number'
      ? a.sharedPrice
      : effectiveBase
  const addOn = a?.privateAddOn ?? 0
  return [
    {
      id: 'shared',
      label: 'Shared',
      image: a?.sharedImage ?? null,
      cropStyle: cropStyle(a?.sharedImageCrop as CropMap, 'card'),
      total: shared,
      addOn: 0,
    },
    {
      id: 'private',
      label: 'Private',
      image: a?.privateImage ?? null,
      cropStyle: cropStyle(a?.privateImageCrop as CropMap, 'card'),
      total: effectiveBase + addOn,
      addOn,
    },
  ]
}
