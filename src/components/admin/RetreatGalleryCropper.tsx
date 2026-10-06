'use client'

import { useCallback, useMemo } from 'react'
import { FieldLabel, useField } from '@payloadcms/ui'
import type { JSONFieldClientComponent } from 'payload'
import type { Crop, CropMap } from '@/lib/crops'
import { normalizeCrop } from '@/lib/crops'
import { CropFrame } from './crop/crop-frame'
import { toMediaId, useMediaDocs } from './crop/use-media-docs'

/**
 * Gallery crop editor for the retreat detail page.
 *
 * Renders one crop frame per gallery photo and lets the admin reposition, zoom,
 * and rotate each. Crops are stored as a flat map keyed by media id:
 *   { [mediaId]: { x, y, zoom?, rotation?, coverScale? } }
 * Crops live on the retreat (not the media doc) so the same photo can be framed
 * differently in each gallery. The gallery shows every photo at a 4:3 frame —
 * the shape the live collage lead tile and retreat card both use.
 */

// The live collage lead tile and the retreat listing card both render at 4:3.
const GALLERY_ASPECT = 4 / 3

export const RetreatGalleryCropper: JSONFieldClientComponent = ({ field, path }) => {
  const { value, setValue } = useField<CropMap>({ path })
  const crops = useMemo<Record<string, Crop>>(() => (value ?? {}) as Record<string, Crop>, [value])

  // Read the sibling gallery field reactively so the preview tracks uploads.
  const { value: imagesValue } = useField<unknown[]>({ path: 'images' })
  const ids = useMemo<string[]>(
    () =>
      Array.isArray(imagesValue)
        ? imagesValue.map(toMediaId).filter((id): id is string => Boolean(id))
        : [],
    [imagesValue],
  )

  const docs = useMediaDocs(ids)

  const setCrop = useCallback(
    (id: string, crop: Crop) => {
      setValue({ ...crops, [id]: normalizeCrop(crop) })
    },
    [crops, setValue],
  )

  const resetCrop = useCallback(
    (id: string) => {
      if (!crops[id]) return
      const nextCrops = { ...crops }
      delete nextCrops[id]
      setValue(Object.keys(nextCrops).length ? nextCrops : null)
    },
    [crops, setValue],
  )

  return (
    <div className="field-type json">
      <FieldLabel label={field?.label || 'Gallery crop'} path={path} />
      <p className="field-description" style={{ marginBottom: 10 }}>
        This is how each photo is framed in the retreat gallery. Drag to reposition, zoom to tighten
        the crop, and rotate to fix a sideways photo — the area outside the frame is cropped out.
        Changes save with the retreat.
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
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 20,
          }}
        >
          {ids.map((id, i) => (
            <CropFrame
              key={id}
              doc={docs[id]}
              aspect={GALLERY_ASPECT}
              label={`Photo ${i + 1}`}
              crop={crops[id] ?? { x: 50, y: 50 }}
              isset={Boolean(crops[id])}
              onChange={(c) => setCrop(id, c)}
              onReset={() => resetCrop(id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default RetreatGalleryCropper
