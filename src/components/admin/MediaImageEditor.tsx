'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Cropper, { type Area } from 'react-easy-crop'
import { RotateCcw, RotateCw } from 'lucide-react'
import { FieldLabel, useDocumentInfo } from '@payloadcms/ui'
import type { UIFieldClientComponent } from 'payload'
import { getCroppedImageBlob } from '@/lib/crop-image'

// Destructive Media editor shown on the media edit view. The admin picks an
// aspect box, zooms/pans, and rotates; on Apply the result is baked to a canvas
// and PATCHed back to the media record, which replaces the stored file for every
// place the image is used. Replaces Payload's native crop drawer (disabled on
// the collection).

type MediaDoc = {
  id: string
  url?: string
  filename?: string
  mimeType?: string
  width?: number
  height?: number
  updatedAt?: string
}

// react-easy-crop always crops to a ratio (no free-form box). "Original" keeps
// the photo's own proportions — rotate without reshaping.
const RATIOS: { label: string; value: number | 'original' }[] = [
  { label: '16:9', value: 16 / 9 },
  { label: '4:3', value: 4 / 3 },
  { label: '9:16', value: 9 / 16 },
  { label: '4:5', value: 4 / 5 },
  { label: '16:10', value: 16 / 10 },
  { label: '1:1', value: 1 },
  { label: 'Original', value: 'original' },
]

const pill = (active: boolean): React.CSSProperties => ({
  padding: '3px 10px',
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 600,
  border: `1px solid ${active ? 'var(--theme-elevation-800)' : 'var(--theme-elevation-200)'}`,
  background: active ? 'var(--theme-elevation-800)' : 'var(--theme-elevation-0)',
  color: active ? 'var(--theme-elevation-0)' : 'var(--theme-elevation-700)',
  cursor: 'pointer',
})

const iconBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 30,
  height: 30,
  borderRadius: 6,
  border: '1px solid var(--theme-elevation-200)',
  background: 'var(--theme-elevation-0)',
  color: 'var(--theme-elevation-700)',
  cursor: 'pointer',
}

export const MediaImageEditor: UIFieldClientComponent = ({ field }) => {
  const { id } = useDocumentInfo()
  const router = useRouter()

  const [doc, setDoc] = useState<MediaDoc | null>(null)
  const [open, setOpen] = useState(false)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [ratio, setRatio] = useState<number | 'original'>('original')
  const [areaPixels, setAreaPixels] = useState<Area | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load the saved media doc (url + dimensions + mime) so we can crop its file.
  const loadDoc = useCallback(async () => {
    if (!id) return
    try {
      const res = await fetch(`/api/media/${id}?depth=0`, { credentials: 'include' })
      if (res.ok) setDoc((await res.json()) as MediaDoc)
    } catch {
      /* editor just stays hidden if the fetch fails */
    }
  }, [id])

  useEffect(() => {
    void loadDoc()
  }, [loadDoc])

  const naturalAspect = doc?.width && doc?.height ? doc.width / doc.height : 1
  const aspect = ratio === 'original' ? naturalAspect : ratio

  // Cache-bust the editor image so it reflects the latest saved file.
  const imageSrc = useMemo(
    () => (doc?.url ? `${doc.url}?v=${encodeURIComponent(doc.updatedAt ?? '')}` : null),
    [doc?.url, doc?.updatedAt],
  )

  const reset = () => {
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setRotation(0)
    setRatio('original')
    setError(null)
  }

  const apply = async () => {
    if (!imageSrc || !areaPixels || !doc) return
    setBusy(true)
    setError(null)
    try {
      const blob = await getCroppedImageBlob(
        imageSrc,
        areaPixels,
        rotation,
        doc.mimeType || 'image/jpeg',
      )
      const body = new FormData()
      body.append('file', blob, doc.filename || 'image')
      body.append('_payload', JSON.stringify({}))
      const res = await fetch(`/api/media/${doc.id}`, {
        method: 'PATCH',
        body,
        credentials: 'include',
      })
      if (!res.ok) throw new Error(`Save failed (${res.status})`)
      setOpen(false)
      reset()
      await loadDoc()
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the edited image')
    } finally {
      setBusy(false)
    }
  }

  // Only a saved image can be edited (we re-upload its file). Nothing to show
  // on a brand-new, unsaved media record.
  if (!id || !doc?.url) return null

  return (
    <div className="field-type ui" style={{ marginTop: 8 }}>
      <FieldLabel label={field?.label || 'Edit image (crop · zoom · rotate)'} />

      {!open ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="btn btn--style-secondary btn--size-small"
          >
            Crop, zoom &amp; rotate
          </button>
          <span style={{ fontSize: 12, color: 'var(--theme-elevation-500)' }}>
            Edits replace the stored file everywhere this image is used.
          </span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 560 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {RATIOS.map((r) => (
              <button
                key={r.label}
                type="button"
                onClick={() => setRatio(r.value)}
                style={pill(ratio === r.value)}
              >
                {r.label}
              </button>
            ))}
          </div>

          <div
            style={{
              position: 'relative',
              width: '100%',
              height: 360,
              background: 'var(--theme-elevation-100)',
              borderRadius: 'var(--style-radius-m, 6px)',
              overflow: 'hidden',
            }}
          >
            {imageSrc && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={aspect}
                minZoom={1}
                maxZoom={5}
                zoomSpeed={0.2}
                restrictPosition={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
                onCropComplete={(_area, pixels) => setAreaPixels(pixels)}
              />
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 5 }}>
              <button
                type="button"
                style={iconBtn}
                title="Rotate left"
                onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
              >
                <RotateCcw size={15} />
              </button>
              <button
                type="button"
                style={iconBtn}
                title="Rotate right"
                onClick={() => setRotation((r) => (r + 90) % 360)}
              >
                <RotateCw size={15} />
              </button>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 140 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--theme-elevation-600)' }}>
                Zoom
              </span>
              <input
                type="range"
                min={1}
                max={5}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                style={{ flex: 1, cursor: 'pointer' }}
              />
            </label>
          </div>

          {error && (
            <div style={{ fontSize: 12, color: 'var(--theme-error-500, #c53030)' }}>{error}</div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className="btn btn--style-primary btn--size-small"
              disabled={busy || !areaPixels}
              onClick={apply}
            >
              {busy ? 'Saving…' : 'Apply'}
            </button>
            <button
              type="button"
              className="btn btn--style-secondary btn--size-small"
              disabled={busy}
              onClick={() => {
                setOpen(false)
                reset()
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn--style-secondary btn--size-small"
              disabled={busy}
              onClick={reset}
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MediaImageEditor
