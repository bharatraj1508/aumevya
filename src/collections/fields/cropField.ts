import type { Field } from 'payload'
import type { CropperConfig } from '@/lib/crops'

/**
 * Builds a JSON field backed by the shared drag-to-reposition crop editor.
 * Place it as a sibling of the image field it frames; `config.imageField` names
 * that sibling and `config.placements` lists each on-site frame (key + aspect).
 */
export const cropField = (
  name: string,
  config: CropperConfig,
  opts?: { label?: string; description?: string },
): Field => ({
  name,
  type: 'json',
  label: opts?.label ?? 'Image crop',
  admin: {
    custom: config as unknown as Record<string, unknown>,
    description: opts?.description,
    components: {
      Field: '/components/admin/crop/image-cropper#ImageCropper',
    },
  },
})
