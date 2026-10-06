'use client'

import { useCallback, useMemo } from 'react'
import { FieldLabel, useField } from '@payloadcms/ui'
import type { JSONFieldClientComponent } from 'payload'
import type { Crop, CropMap, CropperConfig, Placement } from '@/lib/crops'
import { cropKey, normalizeCrop } from '@/lib/crops'
import { CropFrame } from './crop-frame'
import { toMediaId, useMediaDocs } from './use-media-docs'

/**
 * Config-driven crop editor shared by every single- and multi-image field.
 *
 * Reads its configuration (which sibling image field to frame, and the list of
 * placements with their aspect ratios) from the field's `admin.custom`, then
 * renders a draggable preview frame per image × placement. The value is a flat
 * JSON map of object-position crops keyed via `cropKey`.
 */
export const ImageCropper: JSONFieldClientComponent = ({ field, path }) => {
  const config = (field?.admin?.custom as CropperConfig | undefined) ?? undefined
  const { value, setValue } = useField<CropMap>({ path })
  const crops = useMemo<Record<string, Crop>>(() => (value ?? {}) as Record<string, Crop>, [value])

  const imageField = config?.imageField ?? 'image'
  const placements = useMemo<Placement[]>(() => config?.placements ?? [], [config])

  // Resolve the image field relative to this field's own path, so the cropper
  // works at any depth — top-level ("image") or inside an array/block row
  // ("tabs.2.items.0.image").
  const imagePath = useMemo(() => {
    const parts = String(path).split('.')
    parts[parts.length - 1] = imageField
    return parts.join('.')
  }, [path, imageField])

  const { value: imageValue } = useField<unknown>({ path: imagePath })
  const ids = useMemo<string[]>(() => {
    if (config?.multi) {
      return Array.isArray(imageValue)
        ? imageValue.map(toMediaId).filter((id): id is string => Boolean(id))
        : []
    }
    const single = toMediaId(imageValue)
    return single ? [single] : []
  }, [imageValue, config?.multi])

  const docs = useMediaDocs(ids)

  const setCrop = useCallback(
    (key: string, crop: Crop) => {
      setValue({ ...crops, [key]: normalizeCrop(crop) })
    },
    [crops, setValue],
  )

  const resetCrop = useCallback(
    (key: string) => {
      if (!crops[key]) return
      const next = { ...crops }
      delete next[key]
      setValue(Object.keys(next).length ? next : null)
    },
    [crops, setValue],
  )

  const label = field?.label || 'Image crop'

  if (!config || placements.length === 0) {
    return (
      <div className="field-type json">
        <FieldLabel label={label} path={path} />
        <div className="field-description">Crop editor is not configured.</div>
      </div>
    )
  }

  const multi = Boolean(config.multi)

  return (
    <div className="field-type json">
      <FieldLabel label={label} path={path} />
      <p className="field-description" style={{ marginBottom: 10 }}>
        Drag each photo to choose which part stays in view — the area outside the frame is
        cropped out. Each frame mirrors how and where the photo appears on the site. Changes save
        with the record.
      </p>

      {ids.length === 0 ? (
        <div
          style={{
            padding: '1.5rem',
            textAlign: 'center',
            color: 'var(--theme-elevation-500)',
            border: '1px dashed var(--theme-elevation-150)',
            borderRadius: 'var(--style-radius-m, 6px)',
          }}
        >
          Upload the image above to set its crop.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {ids.map((id, i) => (
            <div key={id}>
              {multi && (
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    marginBottom: 8,
                    color: 'var(--theme-elevation-700)',
                  }}
                >
                  Photo {i + 1}
                </div>
              )}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${placements.length}, minmax(0, 1fr))`,
                  gap: 12,
                  maxWidth: placements.length > 1 ? '100%' : 360,
                }}
              >
                {placements.map((p) => {
                  const key = cropKey(p.key, multi ? id : undefined)
                  return (
                    <CropFrame
                      key={key}
                      doc={docs[id]}
                      aspect={p.aspect}
                      label={p.label}
                      crop={crops[key] ?? { x: 50, y: 50 }}
                      isset={Boolean(crops[key])}
                      onChange={(c) => setCrop(key, c)}
                      onReset={() => resetCrop(key)}
                    />
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ImageCropper
