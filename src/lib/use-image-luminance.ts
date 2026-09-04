'use client'

import { useEffect, useState } from 'react'

/**
 * Relative luminance (0 = black, 1 = white) of an sRGB channel triplet.
 * Rec. 709 coefficients — cheap and good enough for a contrast decision.
 */
function luminance(r: number, g: number, b: number): number {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
}

/**
 * Samples the average luminance of the central band of each image — the region
 * the hero copy sits over. Returns one luminance per URL (null while pending or
 * if the pixels can't be read, e.g. a CORS-tainted canvas).
 *
 * Runs client-side only and is gated by `enabled` so we skip the work on desktop
 * where the adaptive treatment doesn't apply.
 */
export function useImageLuminance(urls: string[], enabled = true): (number | null)[] {
  const key = urls.join('|')
  const [lums, setLums] = useState<(number | null)[]>(() => urls.map(() => null))

  useEffect(() => {
    if (!enabled || urls.length === 0) {
      setLums(urls.map(() => null))
      return
    }

    let cancelled = false
    const results: (number | null)[] = urls.map(() => null)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { willReadFrequently: true })

    const sample = (url: string, i: number) =>
      new Promise<void>((resolve) => {
        if (!ctx) return resolve()
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.decoding = 'async'
        img.onload = () => {
          try {
            const w = 32
            const h = 32
            canvas.width = w
            canvas.height = h
            ctx.drawImage(img, 0, 0, w, h)
            // Central band (rows 30%–75%) where the subheading & trust row live.
            const y0 = Math.floor(h * 0.3)
            const y1 = Math.floor(h * 0.75)
            const { data } = ctx.getImageData(0, y0, w, y1 - y0)
            let sum = 0
            let n = 0
            for (let p = 0; p < data.length; p += 4) {
              sum += luminance(data[p], data[p + 1], data[p + 2])
              n++
            }
            results[i] = n > 0 ? sum / n : null
          } catch {
            // Tainted canvas / read blocked — leave null so we fall back safely.
            results[i] = null
          }
          resolve()
        }
        img.onerror = () => resolve()
        img.src = url
      })

    Promise.all(urls.map(sample)).then(() => {
      if (!cancelled) setLums(results)
    })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled])

  return lums
}
