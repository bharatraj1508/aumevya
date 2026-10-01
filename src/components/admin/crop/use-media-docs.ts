'use client'

import { useEffect, useState } from 'react'

export type MediaDoc = { id: string; url: string; width?: number; height?: number; alt?: string }

/** Normalise an upload-field entry (id string or populated doc) to its id. */
export const toMediaId = (entry: unknown): string | null => {
  if (typeof entry === 'string') return entry
  if (entry && typeof entry === 'object' && 'id' in entry) {
    const id = (entry as { id: unknown }).id
    return typeof id === 'string' ? id : null
  }
  return null
}

/**
 * Fetch the Payload media docs (url + natural dimensions) for the given ids.
 * Dimensions are needed so the crop editor can replicate object-fit: cover and
 * map a drag to the right pan range. Results are cached across renders.
 */
export function useMediaDocs(ids: string[]): Record<string, MediaDoc> {
  const [docs, setDocs] = useState<Record<string, MediaDoc>>({})
  const idsKey = ids.join(',')

  useEffect(() => {
    const current = idsKey ? idsKey.split(',') : []
    if (current.length === 0) return
    let cancelled = false
    const missing = current.filter((id) => !docs[id])
    if (missing.length === 0) return
    Promise.all(
      missing.map((id) =>
        fetch(`/api/media/${id}?depth=0`, { credentials: 'include' })
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null),
      ),
    ).then((results) => {
      if (cancelled) return
      const next: Record<string, MediaDoc> = {}
      results.forEach((doc) => {
        if (doc?.id && doc?.url) {
          next[doc.id] = {
            id: doc.id,
            url: doc.url,
            width: doc.width,
            height: doc.height,
            alt: doc.alt,
          }
        }
      })
      if (Object.keys(next).length > 0) setDocs((prev) => ({ ...prev, ...next }))
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey])

  return docs
}
