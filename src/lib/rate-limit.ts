import 'server-only'

type Entry = { count: number; reset: number }
const store = new Map<string, Entry>()

/**
 * Simple in-memory fixed-window limiter — enough to blunt form spam in Phase 1.
 * Note: state is per server instance, so on serverless it is best-effort, not
 * a hard global guarantee. Swap for Upstash/Redis if abuse becomes an issue.
 */
export function rateLimit(
  key: string,
  { limit = 5, windowMs = 60_000 }: { limit?: number; windowMs?: number } = {},
): { ok: boolean; remaining: number } {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.reset) {
    store.set(key, { count: 1, reset: now + windowMs })
    return { ok: true, remaining: limit - 1 }
  }

  entry.count += 1
  if (entry.count > limit) return { ok: false, remaining: 0 }
  return { ok: true, remaining: limit - entry.count }
}

// Opportunistic cleanup so the map can't grow unbounded.
export function sweepRateLimit() {
  const now = Date.now()
  for (const [key, entry] of store) if (now > entry.reset) store.delete(key)
}
