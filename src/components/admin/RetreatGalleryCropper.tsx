'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FieldLabel, useField } from '@payloadcms/ui'
import type { JSONFieldClientComponent } from 'payload'

/**
 * Drag-to-reposition gallery editor for the retreat detail page.
 *
 * Renders the exact collage the website shows (one large lead photo + a 2×2
 * grid of supporting tiles) and lets the admin grab each photo and drag it
 * inside its tile to choose which part stays in view and which gets cropped —
 * like repositioning a cover photo.
 *
 * The result is stored as CSS object-position percentages, keyed by media id:
 *   { [mediaId]: { x, y } }   // x, y in 0–100
 * Percentages are resolution-independent, so the chosen framing holds at every
 * screen size on the live site. Crops live on the retreat (not the media doc)
 * so the same photo can be framed differently in each gallery.
 */

type Crop = { x: number; y: number }
type Crops = Record<string, Crop>
type MediaDoc = { id: string; url: string; width?: number; height?: number; alt?: string }

const DEFAULT: Crop = { x: 50, y: 50 }
const clamp = (n: number) => Math.min(100, Math.max(0, n))

/** Normalise an upload-field entry (id string or populated doc) to its id. */
const toId = (entry: unknown): string | null => {
  if (typeof entry === 'string') return entry
  if (entry && typeof entry === 'object' && 'id' in entry) {
    const id = (entry as { id: unknown }).id
    return typeof id === 'string' ? id : null
  }
  return null
}

export const RetreatGalleryCropper: JSONFieldClientComponent = ({ field, path }) => {
  const { value, setValue } = useField<Crops>({ path })
  const crops = useMemo<Crops>(() => (value ?? {}) as Crops, [value])

  // Read the sibling gallery field reactively so the preview tracks uploads.
  const { value: imagesValue } = useField<unknown[]>({ path: 'images' })
  const ids = Array.isArray(imagesValue)
    ? imagesValue.map(toId).filter((id): id is string => Boolean(id))
    : []
  const idsKey = ids.join(',')

  const [docs, setDocs] = useState<Record<string, MediaDoc>>({})

  // Fetch the media docs (url + natural dimensions) for the current gallery.
  useEffect(() => {
    if (ids.length === 0) {
      setDocs({})
      return
    }
    let cancelled = false
    const missing = ids.filter((id) => !docs[id])
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
          next[doc.id] = { id: doc.id, url: doc.url, width: doc.width, height: doc.height, alt: doc.alt }
        }
      })
      if (Object.keys(next).length > 0) setDocs((prev) => ({ ...prev, ...next }))
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey])

  const setCrop = useCallback(
    (id: string, crop: Crop) => {
      setValue({ ...crops, [id]: { x: clamp(crop.x), y: clamp(crop.y) } })
    },
    [crops, setValue],
  )

  const resetCrop = useCallback(
    (id: string) => {
      if (!crops[id]) return
      const next = { ...crops }
      delete next[id]
      setValue(Object.keys(next).length ? next : null)
    },
    [crops, setValue],
  )

  const lead = ids[0]
  const rest = ids.slice(1, 5)

  const tile = (id: string, label: string, big: boolean) => (
    <CropTile
      key={id}
      id={id}
      label={label}
      big={big}
      doc={docs[id]}
      crop={crops[id] ?? DEFAULT}
      onChange={(c) => setCrop(id, c)}
      onReset={() => resetCrop(id)}
      isset={Boolean(crops[id])}
    />
  )

  return (
    <div className="field-type json">
      <FieldLabel label={field?.label || 'Gallery crop'} path={path} />
      <p className="field-description" style={{ marginBottom: 10 }}>
        This is how the photo gallery appears on the retreat page. Drag any photo to choose
        which part stays in view — the shaded area outside each tile is cropped out. Changes
        save with the retreat.
      </p>

      {ids.length === 0 ? (
        <div
          style={{
            padding: '2rem',
            textAlign: 'center',
            color: 'var(--theme-elevation-500)',
            border: '1px dashed var(--theme-elevation-150)',
            borderRadius: 'var(--style-radius-m, 6px)',
          }}
        >
          Add photos to the gallery above to start setting their crops.
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 8, height: 340, width: '100%' }}>
          <div style={{ flex: 1, minWidth: 0 }}>{lead && tile(lead, 'Photo 1', true)}</div>
          {rest.length > 0 && (
            <div
              style={{
                flex: 1,
                minWidth: 0,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gridTemplateRows: '1fr 1fr',
                gap: 8,
              }}
            >
              {rest.map((id, i) => tile(id, `Photo ${i + 2}`, false))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

type CropTileProps = {
  id: string
  label: string
  big: boolean
  doc?: MediaDoc
  crop: Crop
  isset: boolean
  onChange: (c: Crop) => void
  onReset: () => void
}

function CropTile({ label, doc, crop, isset, onChange, onReset }: CropTileProps) {
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
    // Replicate object-fit: cover to find how much of the image overflows the
    // tile on each axis; that overflow is the range a drag can pan across.
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
    const x = d.overflowX > 1 ? clamp(d.crop.x - (dx * 100) / d.overflowX) : d.crop.x
    const y = d.overflowY > 1 ? clamp(d.crop.y - (dy * 100) / d.overflowY) : d.crop.y
    onChange({ x, y })
  }

  const endDrag = (e: React.PointerEvent) => {
    if (drag.current && ref.current?.hasPointerCapture(e.pointerId)) {
      ref.current.releasePointerCapture(e.pointerId)
    }
    drag.current = null
  }

  return (
    <div
      ref={ref}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      style={{
        position: 'relative',
        height: '100%',
        width: '100%',
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
            objectPosition: `${crop.x}% ${crop.y}%`,
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

      <span
        style={{
          position: 'absolute',
          top: 6,
          left: 6,
          padding: '2px 8px',
          borderRadius: 999,
          fontSize: 11,
          fontWeight: 600,
          color: '#fff',
          background: 'rgba(0,0,0,0.55)',
          pointerEvents: 'none',
        }}
      >
        {label}
      </span>

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
  )
}

export default RetreatGalleryCropper
