import type { CollectionConfig } from 'payload'
import path from 'path'

// Local disk storage. Files live in <cwd>/media and are served by Payload at
// /api/media/file/<filename>. Resolved from the working directory so it points at
// /app/media inside the container — mount that path as a volume to persist uploads.
export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  upload: {
    staticDir: path.resolve(process.cwd(), 'media'),
    // Payload's native crop/focal drawer is replaced by our MediaImageEditor
    // (aspect presets + zoom + rotate), wired via the `imageEditor` UI field.
    crop: false,
    focalPoint: false,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'imageEditor',
      type: 'ui',
      label: 'Edit image (crop · zoom · rotate)',
      admin: {
        components: {
          Field: '/components/admin/MediaImageEditor#MediaImageEditor',
        },
      },
    },
  ],
}
