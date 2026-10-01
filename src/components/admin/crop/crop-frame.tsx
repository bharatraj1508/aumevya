'use client'

import { useRef } from 'react'
import type { Crop } from '@/lib/crops'
import { clampPct } from '@/lib/crops'
import type { MediaDoc } from './use-media-docs'

const DEFAULT: Crop = { x: 50, y: 50 }

type CropFrameProps = {
  doc?: MediaDoc
  crop: Crop
  /** Preview frame aspect ratio (width / height), mirroring the live container. */
  aspect: number
  label: string
  isset: boolean
  onChange: (c: Crop) => void
  onReset: () => void
}

/**
 * One draggable preview frame: shows a photo cropped to `aspect` with
 * object-fit: cover, and lets the admin grab and drag it to choose which part
 * stays in view. Emits the framing as object-position percentages.
 */
export function CropFrame({ doc, crop, aspect, label, isset, onChange, onReset }: CropFrameProps) {
  const ref = useRef<HTMLDivElement>(null)
  const drag = useRef<{
    startX: number
    startY: number
    crop: Crop
    overflowX: number
    overflowY: number
  } | null>(null)

  const onPointerDown = (e: React.PointerEvent) => {
    const el = ref.current
    if (!el || !doc?.width || !doc?.height) return
    const rect = el.getBoundingClientRect()
    // Replicate object-fit: cover to find how far the image overflows the frame
    // on each axis — that overflow is the range a drag can pan across.
    const scale = Math.max(rect.width / doc.width, rect.height / doc.height)
    const overflowX = doc.width * scale - rect.width
    const overflowY = doc.height * scale - rect.height
    drag.current = { startX: e.clientX, startY: e.clientY, crop, overflowX, overflowY }
    el.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.startX
    const dy = e.clientY - d.startY
    // Dragging the photo right reveals its left edge → object-position x drops.
    const x = d.overflowX > 1 ? clampPct(d.crop.x - (dx * 100) / d.overflowX) : d.crop.x
    const y = d.overflowY > 1 ? clampPct(d.crop.y - (dy * 100) / d.overflowY) : d.crop.y
    onChange({ x, y })
  }

  const endDrag = (e: React.PointerEvent) => {
    if (drag.current && ref.current?.hasPointerCapture(e.pointerId)) {
      ref.current.releasePointerCapture(e.pointerId)
    }
    drag.current = null
  }

  const c = crop ?? DEFAULT

  return (
    <div style={{ width: '100%' }}>
      <div
        ref={ref}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: String(aspect),
          overflow: 'hidden',
          borderRadius: 'var(--style-radius-m, 6px)',
          background: 'var(--theme-elevation-100)',
          cursor: doc ? 'grab' : 'default',
          touchAction: 'none',
          userSelect: 'none',
        }}
      >
        {doc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={doc.url}
            alt={doc.alt || label}
            draggable={false}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: `${c.x}% ${c.y}%`,
              pointerEvents: 'none',
            }}
          />
        ) : (
          <div
            style={{
              display: 'flex',
              height: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--theme-elevation-400)',
              fontSize: 12,
            }}
          >
            Loading…
          </div>
        )}
        {isset && (
          <button
            type="button"
            onClick={onReset}
            title="Reset to centered"
            style={{
              position: 'absolute',
              top: 6,
              right: 6,
              padding: '2px 8px',
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 600,
              color: '#fff',
              background: 'rgba(0,0,0,0.55)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Reset
          </button>
        )}
      </div>
      <div
        style={{
          marginTop: 4,
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--theme-elevation-600)',
        }}
      >
        {label}
      </div>
    </div>
  )
}
