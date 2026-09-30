import type { Guidance, GuidanceBookingConfig } from '@/payload-types'
import type { CourseSection } from '@/lib/course'
import { hasRichText } from '@/lib/course'

export type GuidanceSlot = {
  title: string
  startTime: string
  endTime: string
  /** Human label combining the two times, e.g. "10:00 AM – 12:00 PM". */
  timeLabel: string
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

/** Build the display-ready slot list from the booking config. */
export function resolveSlots(config: GuidanceBookingConfig | null | undefined): GuidanceSlot[] {
  return (config?.slots ?? [])
    .filter((s) => s.title?.trim() && s.startTime && s.endTime)
    .map((s) => ({
      title: s.title,
      startTime: s.startTime,
      endTime: s.endTime,
      timeLabel: `${formatTime(s.startTime)} – ${formatTime(s.endTime)}`,
    }))
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
