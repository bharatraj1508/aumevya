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
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
}
