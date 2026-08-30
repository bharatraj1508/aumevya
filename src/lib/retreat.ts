import type { Retreat } from '@/payload-types'

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

/** Build the two selectable options with computed pricing. */
export function accommodationOptions(
  retreat: Pick<Retreat, 'accommodation' | 'price'>,
): AccommodationOption[] {
  const a = retreat.accommodation
  const shared =
    a?.sharedPriceMode === 'custom' && typeof a.sharedPrice === 'number'
      ? a.sharedPrice
      : retreat.price
  const addOn = a?.privateAddOn ?? 0
  return [
    { id: 'shared', label: 'Shared', image: a?.sharedImage ?? null, total: shared, addOn: 0 },
    { id: 'private', label: 'Private', image: a?.privateImage ?? null, total: retreat.price + addOn, addOn },
  ]
}
