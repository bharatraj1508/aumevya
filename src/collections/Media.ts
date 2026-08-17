import type { CollectionConfig } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

// Local disk storage (Phase 1). Files live in <project-root>/media and are served
// by Payload at /api/media/file/<filename>. When Cloudinary env vars are added later,
// the plugin (payload.config.ts) takes over and sets disableLocalStorage automatically.
export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  upload: {
    staticDir: path.resolve(dirname, '../../media'),
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
}
