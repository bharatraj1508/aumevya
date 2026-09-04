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
import { TeamMembers } from './collections/TeamMembers'
import { Gallery } from './collections/Gallery'
import { Videos } from './collections/Videos'
import { Inquiries } from './collections/Inquiries'
import { Courses } from './collections/Courses'

import { Hero } from './globals/Hero'
import { About } from './globals/About'
import { ContactInfo } from './globals/ContactInfo'
import { SeoDefaults } from './globals/SeoDefaults'
import { Cta } from './globals/Cta'
import { Theme } from './globals/Theme'
import { CoursesPage } from './globals/CoursesPage'

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
  collections: [Users, Media, Retreats, Testimonials, TeamMembers, Gallery, Videos, Inquiries, Courses],
  globals: [Hero, About, ContactInfo, SeoDefaults, Cta, Theme, CoursesPage],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.MONGO_URI || '',
    // Shared/free-tier Atlas clusters abort transactions on the slightest
    // write contention, which surfaces as "illegal state transition
    // [TRANSACTION_ABORTED] -> [TRANSACTION_COMMITTED]" on writes (e.g. media
    // uploads). This CMS is single-writer and low-concurrency, so disabling
    // transactions removes the fragility with no practical downside.
    transactionOptions: false,
  }),
  sharp,
})
