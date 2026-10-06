// Shared, client-safe contract for the admin image-crop system.
//
// Admins drag a photo inside a preview frame to choose which part stays in view;
// the result is stored as a CSS object-position percentage and applied on the
// site. Percentages are resolution-independent, so a single crop holds at every
// screen size for a given placement.
//
// One image can be shown in several *placements* (e.g. a small card and a tall
// detail header), each with its own framing. Crops are stored in a flat JSON map
// keyed by placement — and, for multi-image fields (hero, galleries), also by the
// media id. Both the admin editor and the frontend resolve keys through the
// helpers here so the two sides never drift.

import type { CSSProperties } from 'react'

// A crop is a framing instruction applied non-destructively on the frontend:
//   • x, y      — CSS object-position percentage (which part stays in view)
//   • zoom      — magnify ≥ 1 (tighten the crop), applied as transform: scale
//   • rotation  — 0 | 90 | 180 | 270 degrees, applied as transform: rotate
//   • coverScale— extra scale so a rotated image still fills its fixed-aspect
//                 container (admin-computed from the placement's design ratio)
// All fields beyond x/y are optional; a legacy `{ x, y }` crop renders identically.
export type Crop = {
  x: number
  y: number
  zoom?: number
  rotation?: number
  coverScale?: number
}
export type CropMap = Record<string, Crop> | null | undefined

/** A frame the admin crops into: a stored key + a human label + preview aspect (w/h). */
export type Placement = { key: string; label: string; aspect: number }

/** Config passed to the admin cropper via a field's `admin.custom`. */
export type CropperConfig = {
  /** Sibling field holding the image(s) this cropper frames. */
  imageField: string
  /** True when `imageField` is a hasMany upload (hero, galleries). */
  multi?: boolean
  placements: Placement[]
}

export const CENTER = '50% 50%'

/** Composite storage key: "<placement>" for single images, "<id>::<placement>" for many. */
export const cropKey = (placement: string, mediaId?: string | null): string =>
  mediaId ? `${mediaId}::${placement}` : placement

/** A crop → CSS object-position string, defaulting to centered. */
export const toPosition = (c?: Crop | null): string =>
  c ? `${clampPct(c.x)}% ${clampPct(c.y)}%` : CENTER

export const clampPct = (n: number): number => Math.min(100, Math.max(0, n))

/**
 * Trim a crop down to only the fields that differ from the identity framing, so
 * a plain pan-only crop stays the lean legacy `{ x, y }` shape (and renders
 * byte-identically). Shared by every editor that writes a crop.
 */
export const normalizeCrop = (crop: Crop): Crop => {
  const next: Crop = { x: clampPct(crop.x), y: clampPct(crop.y) }
  if (crop.zoom && crop.zoom !== 1) next.zoom = crop.zoom
  if (crop.rotation) {
    next.rotation = crop.rotation
    if (crop.coverScale && crop.coverScale !== 1) next.coverScale = crop.coverScale
  }
  return next
}

/** Zoom is a magnify factor; below 1 would leave gaps, above 5 is unusable. */
export const clampZoom = (z: number): number => Math.min(5, Math.max(1, z))

/** Snap any angle to the nearest quarter-turn in [0, 360). */
export const normalizeRotation = (r: number): number =>
  ((Math.round(r / 90) * 90) % 360 + 360) % 360

/**
 * Extra uniform scale needed so an image rotated a quarter-turn still fully
 * covers its fixed-aspect container. The rotated element box swaps width/height,
 * so it must grow by the larger of the aspect ratio and its reciprocal. A
 * half-turn (0/180) keeps the box shape, so no compensation is needed.
 */
export const coverScaleFor = (aspect: number, rotation: number): number =>
  normalizeRotation(rotation) % 180 === 0 ? 1 : Math.max(aspect, 1 / aspect)

/**
 * The CSS for one crop: `object-position` for the pan, plus a `transform`
 * (rotate + scale) for rotation and zoom. Returns position only when there is
 * no rotation or zoom, so legacy `{ x, y }` crops produce the exact same style
 * as before.
 */
export const cropStyleFromCrop = (c?: Crop | null): CSSProperties => {
  const objectPosition = toPosition(c)
  const zoom = clampZoom(c?.zoom ?? 1)
  const rotation = normalizeRotation(c?.rotation ?? 0)
  const scale = zoom * (c?.coverScale ?? 1)

  const parts: string[] = []
  if (rotation) parts.push(`rotate(${rotation}deg)`)
  if (scale !== 1) parts.push(`scale(${scale})`)
  if (parts.length === 0) return { objectPosition }
  return { objectPosition, transform: parts.join(' '), transformOrigin: 'center center' }
}

/** Look up the full crop style (position + transform) for a placement. */
export const cropStyle = (
  crops: CropMap,
  placement: string,
  mediaId?: string | null,
): CSSProperties => cropStyleFromCrop(crops?.[cropKey(placement, mediaId)])

/** An aspect-ratio choice for the admin crop editor; `null` = free-form box. */
export type AspectOption = { label: string; value: number | null }

/**
 * The aspect boxes offered in the editor — every ratio the live design uses,
 * plus a free-form option. Kept here so admin and frontend share one list.
 */
export const ASPECT_RATIOS: AspectOption[] = [
  { label: '16:9', value: 16 / 9 },
  { label: '4:3', value: 4 / 3 },
  { label: '9:16', value: 9 / 16 },
  { label: '4:5', value: 4 / 5 },
  { label: '16:10', value: 16 / 10 },
  { label: '1:1', value: 1 },
  { label: 'Free', value: null },
]
