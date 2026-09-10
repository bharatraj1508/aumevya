/**
 * Idempotent, courses-only seed — safe to run on production.
 *
 * Unlike `seed.ts` (which WIPES every content collection), this script only
 * touches the `courses` collection and upserts each course by name: existing
 * courses are updated in place, new ones are created. Nothing is deleted, so
 * running it repeatedly is safe. Media is reused by alt text and only uploaded
 * if missing.
 *
 * Run locally:   npm run seed:courses
 * Run on a VPS:  docker compose --profile tools run --rm seeder
 */
import 'dotenv/config'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'
import config from '../payload.config'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const asset = (name: string) => path.resolve(dirname, 'assets', name)

/* Lexical rich-text builders (mirrors seed.ts) */
type Node = { type: string; version: number; [k: string]: unknown }
const BOLD = 1
const ITALIC = 2
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
const i = (text: string) => txt(text, ITALIC)
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
const ol = (...items: Inline[][]) => list('number', items)
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
  payload.logger.info('Seeding courses (idempotent, no wipe)…')

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

  const courseImages = {
    hatha: await media('course-hatha.svg', 'Foundations of Hatha Yoga course'),
    vinyasa: await media('course-vinyasa.svg', 'Vinyasa Flow Mastery course'),
    meditation: await media('course-meditation.svg', 'Meditation & Mindfulness course'),
    pranayama: await media('course-pranayama.svg', 'Pranayama & Breathwork course'),
    ayurveda: await media('course-ayurveda.svg', 'Ayurveda for Everyday Living course'),
  }
  // Room photos for the accommodation-style gallery tab.
  const room1 = await media('gallery-1.svg', 'Studio moment 1')
  const room2 = await media('gallery-2.svg', 'Studio moment 2')
  const room3 = await media('gallery-3.svg', 'Studio moment 3')

  const courses = [
    {
      name: 'Foundations of Hatha Yoga',
      image: courseImages.hatha,
      price: 6999,
      ratings: 4.8,
      featured: true,
      order: 1,
      bookNowLink: '/contact',
      summary:
        'An 8-week beginner course covering the classical asanas, alignment and breath that every practice is built on.',
      about: doc(
        p(
          'This is where a lifelong practice begins. Over ',
          b('eight guided weeks'),
          ' you will build a calm, capable body and a steady mind — starting from the very first pose.',
        ),
        h('h3', 'What you will learn'),
        ul(
          ['The 20 foundational asanas, with detailed alignment cues'],
          ['Safe entry, holding and exit for each posture'],
          [b('Ujjayi breath'), ' and how to pair movement with breath'],
          ['A short daily home practice you can actually keep'],
        ),
        p('Complete beginners, and returning practitioners who want to rebuild a clean, injury-free foundation.'),
      ),
      tabs: [
        {
          blockType: 'itineraryTab' as const,
          label: 'Itinerary',
          intro: 'A typical day on the residential immersion, from sunrise to lights-out.',
          items: [
            { heading: '6:00 AM · Wake & Warm-up', description: 'Herbal tea, then Ujjayi breath and gentle warm-ups to greet the day.' },
            { heading: '7:00 AM · Morning Practice', description: 'Guided Hatha practice with detailed alignment for every posture.' },
            { heading: '9:00 AM · Breakfast', description: 'A sattvic breakfast followed by rest and quiet time.' },
            { heading: '11:00 AM · Theory Workshop', description: 'Philosophy and asana theory — the "why" behind the practice.' },
            { heading: '1:00 PM · Lunch & Rest', description: 'Lunch and free time by the garden.' },
            { heading: '4:30 PM · Restorative Session', description: 'Restorative practice and pranayama to unwind.' },
            { heading: '6:30 PM · Dinner & Meditation', description: 'Dinner, followed by candle-lit meditation before rest.' },
          ],
        },
        {
          blockType: 'galleryTab' as const,
          label: 'Accommodation',
          intro: 'Stay in our peaceful garden retreat — simple, clean rooms designed for rest and reflection.',
          items: [
            { name: 'Twin-Sharing Room', price: 0, image: room1, description: 'Two single beds, shared en-suite bathroom.' },
            { name: 'Private Room', price: 3500, image: room2, description: 'Your own room with en-suite bathroom and garden view.' },
            { name: 'Garden Cottage', price: 6000, image: room3, description: 'A standalone cottage for complete quiet and privacy.' },
          ],
        },
        {
          blockType: 'contentTab' as const,
          label: "What's Included",
          content: doc(
            ul(
              ['All guided sessions and printable practice sheets'],
              ['Three sattvic vegetarian meals a day'],
              ['A yoga mat and props for the duration'],
              ['Certificate of completion'],
            ),
          ),
        },
      ],
    },
    {
      name: 'Vinyasa Flow Mastery',
      image: courseImages.vinyasa,
      price: 9499,
      ratings: 4.9,
      featured: true,
      order: 2,
      bookNowLink: '/contact',
      summary:
        'Intermediate sequencing, transitions and strong dynamic flows to move with breath, grace and power.',
      about: doc(
        p(
          'Take your practice off the ground and into ',
          b('effortless, breath-led movement'),
          '. This intermediate course teaches you not just the poses, but how to ',
          i('link them intelligently'),
          '.',
        ),
      ),
      tabs: [
        {
          blockType: 'contentTab' as const,
          label: 'Curriculum',
          content: doc(
            h('h3', 'Twelve weeks, twelve flows'),
            ol(
              ['Weeks 1–3 · Sun salutations and building a rhythmic base'],
              ['Weeks 4–6 · Standing sequences and hip openers'],
              ['Weeks 7–9 · Transitions: chaturanga, jump-backs, arm balances'],
              ['Weeks 10–12 · Peak-pose sequencing and leading your own class'],
            ),
          ),
        },
        {
          blockType: 'contentTab' as const,
          label: "What's Included",
          content: doc(
            ul(
              ['12 full-length flow classes (20–75 minutes)'],
              ['Downloadable sequencing templates'],
              ['Lifetime access to all recordings'],
              ['Private community group for feedback'],
            ),
          ),
        },
      ],
    },
    {
      name: 'Meditation & Mindfulness',
      image: courseImages.meditation,
      price: 0,
      ratings: 4.7,
      featured: false,
      order: 3,
      bookNowLink: '/contact',
      summary:
        'A free 21-day introduction to sitting practice — build calm, focus and a habit that lasts.',
      about: doc(
        p(
          'You do not need an hour or a mountain-top. This ',
          b('free 21-day course'),
          ' shows you how just ten quiet minutes a day can change your relationship with a busy mind.',
        ),
      ),
      tabs: [
        {
          blockType: 'contentTab' as const,
          label: 'Daily Schedule',
          content: doc(
            p('Ten minutes is all it takes. Do it whenever suits you — most people prefer first thing in the morning.'),
            ul(
              [b('Minute 0–2'), ' · Settling in and posture check'],
              [b('Minute 2–8'), ' · Guided practice for the day'],
              [b('Minute 8–10'), ' · Reflection and journalling prompt'],
            ),
          ),
        },
        {
          blockType: 'contentTab' as const,
          label: 'FAQ',
          content: doc(
            h('h3', 'Do I need any experience?'),
            p('None at all. This course is designed for absolute beginners.'),
            h('h3', 'What if I miss a day?'),
            p('Simply resume where you left off. Consistency matters more than a perfect streak.'),
            h('h3', 'Is it really free?'),
            p('Yes — all 21 days of guided audio are free, forever.'),
          ),
        },
      ],
    },
    {
      name: 'Pranayama & Breathwork',
      image: courseImages.pranayama,
      price: 5499,
      ratings: 4.6,
      featured: false,
      order: 4,
      bookNowLink: '/contact',
      summary:
        'Master the classical breathing techniques that regulate energy, steady the nervous system and deepen focus.',
      about: doc(
        p(
          'The breath is the bridge between body and mind. This course opens the ',
          b('traditional science of pranayama'),
          ' in a safe, progressive way.',
        ),
      ),
      tabs: [
        {
          blockType: 'contentTab' as const,
          label: 'Curriculum',
          content: doc(
            h('h3', 'A progressive path'),
            ul(
              ['Module 1 · The mechanics of the breath and the nervous system'],
              [b('Module 2'), ' · Nadi Shodhana and finding balance'],
              [b('Module 3'), ' · Energising breaths — Kapalabhati and Bhastrika'],
              [b('Module 4'), ' · Calming breaths and building a daily ritual'],
            ),
          ),
        },
      ],
    },
    {
      name: 'Ayurveda for Everyday Living',
      image: courseImages.ayurveda,
      price: 7999,
      ratings: 4.8,
      featured: false,
      order: 5,
      bookNowLink: '/contact',
      summary:
        'Discover your dosha and build daily food, sleep and movement routines that keep you balanced year-round.',
      about: doc(
        p(
          'Ayurveda is the ',
          b('sister science of yoga'),
          ' — 5,000 years of practical wisdom for living in tune with your own nature and the seasons.',
        ),
      ),
      tabs: [
        {
          blockType: 'itineraryTab' as const,
          label: 'Daily Routine',
          intro: 'Dinacharya — a sample day tuned to your dosha once you complete the quiz.',
          items: [
            { heading: 'Morning', description: 'Wake before sunrise, scrape the tongue, warm water with lemon, then a short walk.' },
            { heading: 'Midday', description: 'The largest meal of the day — kitchari, seasonal vegetables and ghee.' },
            { heading: 'Evening', description: 'A light, warm soup taken early, then wind down away from screens.' },
          ],
        },
        {
          blockType: 'contentTab' as const,
          label: "What's Included",
          content: doc(
            ul(
              ['A guided dosha-discovery quiz'],
              ['Seasonal recipe booklet (PDF)'],
              ['Daily-routine planner template'],
              ['Lifetime access to all lessons'],
            ),
          ),
        },
      ],
    },
  ]

  // Upsert by name: update in place if it exists, otherwise create. No deletes.
  let created = 0
  let updated = 0
  for (const c of courses) {
    const existing = await payload.find({
      collection: 'courses',
      where: { name: { equals: c.name } },
      limit: 1,
    })
    if (existing.docs[0]) {
      await payload.update({
        collection: 'courses',
        id: existing.docs[0].id,
        data: { ...c, published: true },
      })
      updated++
    } else {
      await payload.create({ collection: 'courses', data: { ...c, published: true } })
      created++
    }
  }

  payload.logger.info(`Courses seeded — ${created} created, ${updated} updated.`)
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
