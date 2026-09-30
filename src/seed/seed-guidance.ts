/**
 * Idempotent, guidance-only seed — safe to run on production.
 *
 * Upserts the two guidance sessions by title, sets the Guidance Page cover and
 * the Guidance Booking config (three default slots + open-date rule). Nothing is
 * deleted, so running it repeatedly is safe. Media is reused by alt text and
 * only uploaded if missing.
 *
 * Run locally:   npm run seed:guidance
 */
import 'dotenv/config'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'
import config from '../payload.config'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const asset = (name: string) => path.resolve(dirname, 'assets', name)

/* Lexical rich-text builders (mirrors seed-courses.ts) */
type Node = { type: string; version: number; [k: string]: unknown }
const BOLD = 1
const txt = (text: string, format = 0): Node => ({
  type: 'text',
  text,
  format,
  style: '',
  mode: 'normal',
  detail: 0,
  version: 1,
})
const b = (text: string) => txt(text, BOLD)
type Inline = string | Node
const inline = (c: Inline): Node => (typeof c === 'string' ? txt(c) : c)
const p = (...children: Inline[]): Node => ({
  type: 'paragraph',
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr',
  textFormat: 0,
  children: children.map(inline),
})
const h = (tag: 'h2' | 'h3', ...children: Inline[]): Node => ({
  type: 'heading',
  tag,
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr',
  children: children.map(inline),
})
const listItem = (children: Inline[], value: number): Node => ({
  type: 'listitem',
  value,
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr',
  children: children.map(inline),
})
const list = (listType: 'bullet' | 'number', items: Inline[][]): Node => ({
  type: 'list',
  listType,
  start: 1,
  tag: listType === 'bullet' ? 'ul' : 'ol',
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr',
  children: items.map((item, idx) => listItem(item, idx + 1)),
})
const ul = (...items: Inline[][]) => list('bullet', items)
const doc = (...blocks: Node[]) => ({
  root: {
    type: 'root',
    format: '' as const,
    indent: 0,
    version: 1,
    direction: 'ltr' as const,
    children: blocks,
  },
})

const run = async () => {
  const payload = await getPayload({ config })
  payload.logger.info('Seeding guidance (idempotent, no wipe)…')

  // Reuse media by alt text; only upload from assets if it is missing.
  const media = async (file: string, alt: string) => {
    const existing = await payload.find({
      collection: 'media',
      where: { alt: { equals: alt } },
      limit: 1,
    })
    if (existing.docs[0]) return existing.docs[0].id as string
    const created = await payload.create({ collection: 'media', data: { alt }, filePath: asset(file) })
    return created.id as string
  }

  const coverImage = await media('guidance-cover.svg', 'Guidance page cover')
  const images = {
    oneOnOne: await media('guidance-oneonone.svg', 'One-on-One Mentorship guidance'),
    lifePath: await media('guidance-lifepath.svg', 'Life Path & Purpose guidance'),
  }

  const guidance = [
    {
      title: 'One-on-One Mentorship',
      image: images.oneOnOne,
      featured: true,
      order: 1,
      summary:
        'Personal, focused sessions with a senior teacher to refine your practice and answer what books cannot.',
      about: doc(
        p(
          'Some questions only surface on the mat, in the moment. ',
          b('One-on-one mentorship'),
          ' gives you a senior teacher’s full attention — to see your practice clearly and guide your next step.',
        ),
      ),
      tabs: [
        {
          title: 'What to expect',
          content: doc(
            h('h3', 'A session shaped around you'),
            ul(
              ['A gentle assessment of where your practice is today'],
              ['Hands-on refinement of alignment and breath'],
              ['A simple, personal home practice you can actually keep'],
              ['Space to ask anything — philosophy, injuries, motivation'],
            ),
          ),
        },
        {
          title: 'Who it’s for',
          content: doc(
            p(
              'Beginners who want a confident start, and experienced practitioners working through a plateau, an injury, or a deeper question.',
            ),
          ),
        },
      ],
    },
    {
      title: 'Life Path & Purpose',
      image: images.lifePath,
      featured: false,
      order: 2,
      summary:
        'Reflective mentoring that brings yogic philosophy into everyday decisions, direction and balance.',
      about: doc(
        p(
          'Yoga is more than posture. ',
          b('Life Path & Purpose'),
          ' sessions draw on yogic philosophy to help you meet everyday decisions with more clarity and calm.',
        ),
      ),
      tabs: [
        {
          title: 'What we explore',
          content: doc(
            ul(
              ['Grounding practices for stress and overwhelm'],
              ['Applying the yamas and niyamas to real choices'],
              ['Building steady daily rhythms that support you'],
            ),
          ),
        },
      ],
    },
  ]

  // Upsert by title: update in place if it exists, otherwise create. No deletes.
  let created = 0
  let updated = 0
  for (const g of guidance) {
    const existing = await payload.find({
      collection: 'guidance',
      where: { title: { equals: g.title } },
      limit: 1,
    })
    if (existing.docs[0]) {
      await payload.update({
        collection: 'guidance',
        id: existing.docs[0].id,
        data: { ...g, published: true },
      })
      updated++
    } else {
      await payload.create({ collection: 'guidance', data: { ...g, published: true } })
      created++
    }
  }

  // Guidance Page cover / heading.
  await payload.updateGlobal({
    slug: 'guidance-page',
    data: {
      coverImage,
      eyebrow: 'Personalised mentorship',
      heading: 'Guidance',
      subheading:
        'One-on-one sessions and expert direction to deepen your practice and steady your path.',
    },
  })

  // Booking config — three default slots + open the next three months
  // (weekdays + Saturdays). "Quarter" gives a healthy set of dates out of the
  // box; admins can narrow it to this month or a custom range any time.
  await payload.updateGlobal({
    slug: 'guidance-booking-config',
    data: {
      slots: [
        { title: 'Morning', startTime: '10:00', endTime: '12:00' },
        { title: 'Afternoon', startTime: '14:00', endTime: '16:00' },
        { title: 'Evening', startTime: '18:00', endTime: '20:00' },
      ],
      availability: {
        rangeType: 'quarter',
        includeSaturdays: true,
        includeSundays: false,
      },
    },
  })

  payload.logger.info(
    `Guidance seeded — ${created} created, ${updated} updated. Page + booking config set.`,
  )
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
