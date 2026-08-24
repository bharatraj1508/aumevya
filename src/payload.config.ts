import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { payloadCloudinaryPlugin } from '@jhb.software/payload-cloudinary-plugin'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig, type Plugin } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Retreats } from './collections/Retreats'
import { Testimonials } from './collections/Testimonials'
import { Gallery } from './collections/Gallery'
import { Videos } from './collections/Videos'
import { Inquiries } from './collections/Inquiries'

import { Hero } from './globals/Hero'
import { About } from './globals/About'
import { ContactInfo } from './globals/ContactInfo'
import { SeoDefaults } from './globals/SeoDefaults'
import { Cta } from './globals/Cta'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Cloudinary is enabled only when credentials are present (deferred to later).
// Without them Payload uses local disk storage (see collections/Media.ts).
const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env
const cloudinaryEnabled = Boolean(
  CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET,
)

const plugins: Plugin[] = []
if (cloudinaryEnabled) {
  plugins.push(
    payloadCloudinaryPlugin({
      collections: { media: true },
      cloudName: CLOUDINARY_CLOUD_NAME!,
      credentials: {
        apiKey: CLOUDINARY_API_KEY!,
        apiSecret: CLOUDINARY_API_SECRET!,
      },
      folder: 'aumevya',
      clientUploads: true,
      useFilename: true,
    }),
  )
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: '· Aumevya',
    },
  },
  collections: [Users, Media, Retreats, Testimonials, Gallery, Videos, Inquiries],
  globals: [Hero, About, ContactInfo, SeoDefaults, Cta],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || '',
  }),
  sharp,
  plugins,
})
