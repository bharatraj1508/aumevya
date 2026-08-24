import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
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
    url: process.env.MONGO_URI || '',
  }),
  sharp,
})
