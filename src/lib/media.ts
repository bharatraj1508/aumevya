import type { Media } from '@/payload-types'

// Pure, client-safe helpers for Payload media relationship fields.
// (Kept out of lib/payload.ts, which is server-only.)

/** Resolve a media relationship field to its served URL (or null). */
export const mediaURL = (m: unknown): string | null => {
  if (m && typeof m === 'object' && 'url' in m) {
    const url = (m as Media).url
    return typeof url === 'string' ? url : null
  }
  return null
}

export const mediaAlt = (m: unknown, fallback = ''): string => {
  if (m && typeof m === 'object' && 'alt' in m) {
    const alt = (m as Media).alt
    return typeof alt === 'string' ? alt : fallback
  }
  return fallback
}

export const mediaDimensions = (m: unknown): { width: number; height: number } => {
  if (m && typeof m === 'object') {
    const media = m as Media
    if (typeof media.width === 'number' && typeof media.height === 'number') {
      return { width: media.width, height: media.height }
    }
  }
  return { width: 1200, height: 800 }
}
