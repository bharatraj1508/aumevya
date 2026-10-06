import type { Guidance, GuidanceBookingConfig } from '@/payload-types'
import type { CourseSection } from '@/lib/course'
import { hasRichText } from '@/lib/course'
import { formatPrice } from '@/lib/retreat'

/** Price label for a session: "Free" at 0, otherwise the ₹ amount. */
const sessionPriceLabel = (price: number): string => (price <= 0 ? 'Free' : formatPrice(price))

/** The three fixed slot categories, matching the Guidance `slots` group keys. */
export type SlotCategory = 'morning' | 'afternoon' | 'evening'

/** A single bookable start time: the raw "HH:MM" plus a friendly "9:00 AM". */
export type SlotTime = { raw: string; label: string }

/** One category's bookable start times, in display order. */
export type GuidanceSlotCategory = {
  category: SlotCategory
  label: 'Morning' | 'Afternoon' | 'Evening'
  times: SlotTime[]
}

/** A display-ready session package built from a Guidance `packages` row. */
export type SessionPackage = {
  /** Payload array-row id (stable React key + booking reference). */
  id: string
  name: string
  durationMinutes: number
  /** e.g. "30 min". */
  durationLabel: string
  price: number
  /** Formatted current price, e.g. "₹2,500" or "Free". */
  priceLabel: string
  /** Raw "was" price when discounted, else null. */
  originalPrice: number | null
  /** Formatted strike-through price, or null when not discounted. */
  originalPriceLabel: string | null
  /** Whole-number percent off, or null when not discounted. */
  discountPercent: number | null
  badge: 'most-popular' | 'best-value' | null
  tagline: string | null
  features: string[]
}

const CATEGORY_LABELS: Record<SlotCategory, GuidanceSlotCategory['label']> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
}

/** An open day the user can pick, grouped for display by month. */
export type OpenDate = {
  /** ISO date, `YYYY-MM-DD`. */
  value: string
  /** Day of month, e.g. "4". */
  day: string
  /** Short weekday, e.g. "Mon". */
  weekday: string
  /** Month + year, e.g. "October 2026" — used to group the picker. */
  month: string
}

/** Normalise the guidance tabs into content sections, leading with "Overview". */
export function buildGuidanceSections(guidance: Guidance): CourseSection[] {
  const sections: CourseSection[] = []
  if (hasRichText(guidance.about)) {
    sections.push({ kind: 'content', label: 'Overview', content: guidance.about })
  }
  for (const tab of guidance.tabs ?? []) {
    if (!tab.title?.trim()) continue
    if (hasRichText(tab.content)) {
      sections.push({ kind: 'content', label: tab.title, content: tab.content })
    }
  }
  return sections
}

/** Format a stored "HH:MM" (24h) time as a friendly "10:00 AM". */
export function formatTime(hhmm?: string | null): string {
  if (!hhmm) return ''
  const [h, m] = hhmm.split(':').map((n) => Number(n))
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm
  const period = h < 12 ? 'AM' : 'PM'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`
}

/**
 * Build the three fixed slot categories (Morning/Afternoon/Evening) for a
 * guidance, each with its discrete start times sorted and formatted. Empty
 * categories are still returned so the UI can decide whether to show them.
 */
export function resolveGuidanceSlots(guidance: Guidance): GuidanceSlotCategory[] {
  const groups = guidance.slots
  return (['morning', 'afternoon', 'evening'] as const).map((category) => {
    const entries = groups?.[category] ?? []
    const times = entries
      .map((e) => e.time)
      .filter((t): t is string => Boolean(t?.trim()))
      .sort() // "HH:MM" sorts chronologically as text
      .map((raw) => ({ raw, label: formatTime(raw) }))
    return { category, label: CATEGORY_LABELS[category], times }
  })
}

/** The flat set of valid "HH:MM" start times for one category of a guidance. */
export function slotTimesFor(guidance: Guidance, category: SlotCategory): string[] {
  return resolveGuidanceSlots(guidance).find((c) => c.category === category)?.times.map((t) => t.raw) ?? []
}

/** Build the display-ready session packages from a guidance's `packages`. */
export function buildSessionPackages(guidance: Guidance): SessionPackage[] {
  return (guidance.packages ?? []).map((p, i) => {
    const hasDiscount = typeof p.originalPrice === 'number' && p.originalPrice > p.price && p.price >= 0
    return {
      id: p.id ?? `pkg-${i}`,
      name: p.name,
      durationMinutes: p.duration,
      durationLabel: `${p.duration} min`,
      price: p.price,
      priceLabel: sessionPriceLabel(p.price),
      originalPrice: hasDiscount ? (p.originalPrice as number) : null,
      originalPriceLabel: hasDiscount ? formatPrice(p.originalPrice as number) : null,
      discountPercent: hasDiscount
        ? Math.round((1 - p.price / (p.originalPrice as number)) * 100)
        : null,
      badge: p.badge && p.badge !== 'none' ? p.badge : null,
      tagline: p.tagline?.trim() ? p.tagline : null,
      features: (p.features ?? []).map((f) => f.text).filter((t): t is string => Boolean(t?.trim())),
    }
  })
}

/** A UTC calendar date as `YYYY-MM-DD`, avoiding any timezone drift. */
function isoDate(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(
    d.getUTCDate(),
  ).padStart(2, '0')}`
}

/** Today at UTC midnight — the earliest bookable day. */
function todayUTC(): Date {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
}

/**
 * Compute the open calendar dates from the booking config's availability rule.
 * Dates are inclusive of today, filtered by the weekend toggles, and capped so
 * a misconfiguration can never produce an unbounded list.
 */
export function computeOpenDates(config: GuidanceBookingConfig | null | undefined): OpenDate[] {
  const availability = config?.availability
  if (!availability) return []

  const start = todayUTC()
  let end: Date

  if (availability.rangeType === 'quarter') {
    // The same day three months out, clamping the day so a shorter target month
    // (e.g. today the 31st → 3 months later) never overflows into the next one.
    const q = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 3, 1))
    const lastDay = new Date(Date.UTC(q.getUTCFullYear(), q.getUTCMonth() + 1, 0)).getUTCDate()
    end = new Date(
      Date.UTC(q.getUTCFullYear(), q.getUTCMonth(), Math.min(start.getUTCDate(), lastDay)),
    )
  } else if (availability.rangeType === 'custom') {
    if (!availability.customStart || !availability.customEnd) return []
    const cs = new Date(availability.customStart)
    const ce = new Date(availability.customEnd)
    if (Number.isNaN(cs.getTime()) || Number.isNaN(ce.getTime())) return []
    const customStart = new Date(Date.UTC(cs.getUTCFullYear(), cs.getUTCMonth(), cs.getUTCDate()))
    // Never open a date in the past even if the admin set an earlier start.
    if (customStart > start) start.setTime(customStart.getTime())
    end = new Date(Date.UTC(ce.getUTCFullYear(), ce.getUTCMonth(), ce.getUTCDate()))
  } else {
    // 'month' — today through the last day of the current month.
    end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0))
  }

  if (end < start) return []

  const includeSat = availability.includeSaturdays ?? true
  const includeSun = availability.includeSundays ?? false

  const dates: OpenDate[] = []
  const cursor = new Date(start)
  const MAX_DAYS = 400 // safety cap
  for (let i = 0; i <= MAX_DAYS && cursor <= end; i++) {
    const dow = cursor.getUTCDay() // 0 = Sun, 6 = Sat
    const skip = (dow === 6 && !includeSat) || (dow === 0 && !includeSun)
    if (!skip) {
      dates.push({
        value: isoDate(cursor),
        day: String(cursor.getUTCDate()),
        weekday: cursor.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }),
        month: cursor.toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
          timeZone: 'UTC',
        }),
      })
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }
  return dates
}

/** Pretty label for a booked date, e.g. "Mon, 04 Oct 2026". Accepts either a
 * plain `YYYY-MM-DD` or a full ISO timestamp (as read back from the DB). */
export function formatBookingDate(iso?: string | null): string {
  if (!iso) return ''
  const d = new Date(`${iso.slice(0, 10)}T00:00:00Z`)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}
