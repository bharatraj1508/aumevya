'use client'

import { useRef, useState } from 'react'
import type { AspectOption, Crop } from '@/lib/crops'
import {
  ASPECT_RATIOS,
  clampPct,
  clampZoom,
  coverScaleFor,
  cropStyleFromCrop,
  normalizeRotation,
} from '@/lib/crops'
import type { MediaDoc } from './use-media-docs'
import { AspectSelector, CropControls } from './crop-controls'

const DEFAULT: Crop = { x: 50, y: 50 }
const FREE_FRAME_HEIGHT = 240

type CropFrameProps = {
  doc?: MediaDoc
  crop: Crop
  /** The placement's design aspect ratio (width / height) — the live frame shape. */
  aspect: number
  label: string
  isset: boolean
  /** Show the rotate/zoom/aspect controls. Off for fixed-layout collage tiles. */
  controls?: boolean
  /** Aspect boxes to offer; defaults to the full shared list. */
  aspectOptions?: AspectOption[]
  onChange: (c: Crop) => void
  onReset: () => void
}

/**
 * One crop frame: shows a photo cropped to the selected aspect with
 * object-fit: cover, and lets the admin drag it to reposition, zoom to tighten,
 * and rotate to fix orientation. Emits the framing as a {@link Crop} (pan + zoom
 * + rotation + the cover-scale needed to keep a rotated image filling the frame).
 */
export function CropFrame({
  doc,
  crop,
  aspect,
  label,
  isset,
  controls = true,
  aspectOptions = ASPECT_RATIOS,
  onChange,
  onReset,
}: CropFrameProps) {
  const ref = useRef<HTMLDivElement>(null)
  const drag = useRef<{
    startX: number
    startY: number
    crop: Crop
    overflowX: number
    overflowY: number
    rotation: number
    totalScale: number
  } | null>(null)

  // The preview frame's shape. Defaults to the placement ratio; the aspect
  // selector can switch it (preview-only — the live container keeps its design
  // ratio). `null` renders a free-form, fixed-height box.
  const [previewAspect, setPreviewAspect] = useState<number | null>(aspect)

  const c = crop ?? DEFAULT
  const rotation = normalizeRotation(c.rotation ?? 0)

  // Fill-scale for the PREVIEW uses whatever ratio is on screen, so a rotated
  // photo always fills the preview; the stored cover-scale (below) uses the
  // placement ratio, which is what the live site renders at.
  const previewCoverScale = coverScaleFor(previewAspect ?? aspect, rotation)
  const previewStyle = cropStyleFromCrop({ ...c, coverScale: previewCoverScale })

  const onPointerDown = (e: React.PointerEvent) => {
    const el = ref.current
    if (!el || !doc?.width || !doc?.height) return
    const rect = el.getBoundingClientRect()
    // object-fit: cover overflow, computed on the un-rotated image in the frame.
    const scale = Math.max(rect.width / doc.width, rect.height / doc.height)
    const overflowX = doc.width * scale - rect.width
    const overflowY = doc.height * scale - rect.height
    drag.current = {
      startX: e.clientX,
      startY: e.clientY,
      crop: c,
      overflowX,
      overflowY,
      rotation,
      totalScale: clampZoom(c.zoom ?? 1) * previewCoverScale,
    }
    el.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d) return
    const sdx = e.clientX - d.startX
    const sdy = e.clientY - d.startY
    // The photo is visually rotated and magnified; map the screen drag back into
    // the image's own axes (inverse rotation) and undo the magnification so the
    // photo tracks the pointer at any orientation/zoom.
    let dx = sdx
    let dy = sdy
    if (d.rotation === 90) [dx, dy] = [sdy, -sdx]
    else if (d.rotation === 180) [dx, dy] = [-sdx, -sdy]
    else if (d.rotation === 270) [dx, dy] = [-sdy, sdx]
    dx /= d.totalScale
    dy /= d.totalScale
    // Dragging the photo right reveals its left edge → object-position x drops.
    const x = d.overflowX > 1 ? clampPct(d.crop.x - (dx * 100) / d.overflowX) : d.crop.x
    const y = d.overflowY > 1 ? clampPct(d.crop.y - (dy * 100) / d.overflowY) : d.crop.y
    onChange({ ...d.crop, x, y })
  }

  const endDrag = (e: React.PointerEvent) => {
    if (drag.current && ref.current?.hasPointerCapture(e.pointerId)) {
      ref.current.releasePointerCapture(e.pointerId)
    }
    drag.current = null
  }

  const rotate = (deltaDeg: 90 | -90) => {
    const next = normalizeRotation(rotation + deltaDeg)
    // Store the fill-scale against the PLACEMENT ratio so the live site renders
    // a rotated photo without gaps regardless of the preview box.
    onChange({ ...c, rotation: next, coverScale: coverScaleFor(aspect, next) })
  }

  const setZoom = (zoom: number) => onChange({ ...c, zoom: clampZoom(zoom) })

  return (
    <div style={{ width: '100%' }}>
      {controls && (
        <div style={{ marginBottom: 8 }}>
          <AspectSelector options={aspectOptions} selected={previewAspect} onSelect={setPreviewAspect} />
        </div>
      )}
      <div
        ref={ref}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        style={{
          position: 'relative',
          width: '100%',
          ...(previewAspect === null
            ? { height: FREE_FRAME_HEIGHT }
            : { aspectRatio: String(previewAspect) }),
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
              pointerEvents: 'none',
              ...previewStyle,
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
            title="Reset framing"
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
      {controls && doc && (
        <div style={{ marginTop: 8 }}>
          <CropControls zoom={clampZoom(c.zoom ?? 1)} onZoomChange={setZoom} onRotate={rotate} />
        </div>
      )}
      <div
        style={{
          marginTop: 6,
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
