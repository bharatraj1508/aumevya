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

export type Crop = { x: number; y: number }
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

/** Look up the object-position for a placement (and optional media id). */
export const cropPosition = (crops: CropMap, placement: string, mediaId?: string | null): string =>
  toPosition(crops?.[cropKey(placement, mediaId)])

export const clampPct = (n: number): number => Math.min(100, Math.max(0, n))
