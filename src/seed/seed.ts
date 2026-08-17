import 'dotenv/config'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'
import config from '../payload.config'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const asset = (name: string) => path.resolve(dirname, 'assets', name)

// Minimal valid Lexical rich-text value from plain paragraphs.
const rt = (...paragraphs: string[]) => ({
  root: {
    type: 'root',
    format: '' as const,
    indent: 0,
    version: 1,
    direction: 'ltr' as const,
    children: paragraphs.map((text) => ({
      type: 'paragraph',
      format: '' as const,
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      textFormat: 0,
      children: [
        { type: 'text', text, format: 0, style: '', mode: 'normal', detail: 0, version: 1 },
      ],
    })),
  },
})

const run = async () => {
  const payload = await getPayload({ config })

  payload.logger.info('Seeding Aumevya content…')

  // 1. Clear existing content collections (keeps users + inquiries intact)
  for (const collection of ['services', 'testimonials', 'gallery', 'videos', 'media'] as const) {
    await payload.delete({ collection, where: { id: { exists: true } } })
  }

  // 2. Upload media assets
  const upload = async (file: string, alt: string) => {
    const doc = await payload.create({
      collection: 'media',
      data: { alt },
      filePath: asset(file),
    })
    return doc.id
  }

  const heroImg = await upload('hero.svg', 'Sunrise over a calm horizon')
  const aboutImg = await upload('about.svg', 'Peaceful yoga practice')
  const ogImg = await upload('og.svg', 'Aumevya Yoga')
  const svc = {
    hatha: await upload('service-hatha.svg', 'Hatha yoga retreat'),
    vinyasa: await upload('service-vinyasa.svg', 'Vinyasa flow retreat'),
    meditation: await upload('service-meditation.svg', 'Guided meditation retreat'),
    prenatal: await upload('service-prenatal.svg', 'Prenatal yoga retreat'),
  }
  const gallery = []
  for (let i = 1; i <= 6; i++) gallery.push(await upload(`gallery-${i}.svg`, `Studio moment ${i}`))
  const avatars = {
    a: await upload('avatar-1.svg', 'Ananya'),
    r: await upload('avatar-2.svg', 'Rahul'),
    m: await upload('avatar-3.svg', 'Meera'),
  }

  // 3. Globals
  await payload.updateGlobal({
    slug: 'hero',
    data: {
      eyebrow: 'Aumevya Yoga',
      heading: 'Handpicked yoga retreats to unplug, de-stress & recharge',
      subheading:
        'Curated, small-group experiences led by teachers we trust. Step away from the noise and come back to yourself — for every body, every level.',
      primaryCtaLabel: 'Find Your Retreat',
      primaryCtaHref: '/services',
      secondaryCtaLabel: 'Explore Retreats',
      secondaryCtaHref: '/services',
      backgroundImage: heroImg,
    },
  })

  await payload.updateGlobal({
    slug: 'about',
    data: {
      eyebrow: 'Our Story',
      heading: 'Yoga rooted in tradition, taught for modern life',
      body: rt(
        'Aumevya Yoga began with a simple belief: that a steady practice can bring calm, strength and clarity to everyday living.',
        'Our certified teachers guide small, handpicked retreats — blending classical Hatha foundations with flowing Vinyasa and restorative meditation.',
      ),
      image: aboutImg,
      highlights: [
        { value: '10+', label: 'Years of teaching' },
        { value: '2,000+', label: 'Guests guided' },
        { value: '15', label: 'Retreats a year' },
      ],
    },
  })

  await payload.updateGlobal({
    slug: 'contact-info',
    data: {
      email: 'hello@aumevya.com',
      phone: '+91 98765 43210',
      whatsapp: '+91 98765 43210',
      address: 'Aumevya Yoga Studio\n2nd Floor, Green Meadows\nBengaluru, Karnataka 560001',
      mapEmbedUrl: '',
      hours: [
        { days: 'Mon – Fri', time: '6:00 AM – 9:00 PM' },
        { days: 'Sat – Sun', time: '7:00 AM – 12:00 PM' },
      ],
      socials: {
        instagram: 'https://instagram.com',
        facebook: 'https://facebook.com',
        youtube: 'https://youtube.com',
      },
    },
  })

  await payload.updateGlobal({
    slug: 'seo-defaults',
    data: {
      siteName: 'Aumevya Yoga',
      titleTemplate: '%s · Aumevya Yoga',
      description:
        'Aumevya Yoga — handpicked Hatha, Vinyasa, meditation and prenatal yoga retreats to unplug, de-stress and recharge, for every level.',
      ogImage: ogImg,
    },
  })

  await payload.updateGlobal({
    slug: 'cta',
    data: {
      heading: 'Begin your practice today',
      subheading: 'Your first retreat is the hardest step. We will guide the rest.',
      buttonLabel: 'Book Your First Retreat',
      buttonHref: '/contact',
    },
  })

  // 4. Services
  const services = [
    {
      title: 'Hatha Grounding Retreat',
      summary: 'Slow, foundational postures to build strength, alignment and calm.',
      image: svc.hatha,
      location: 'Rishikesh, India',
      duration: '3 days',
      level: 'All Levels',
      featured: true,
      order: 1,
    },
    {
      title: 'Vinyasa Flow Retreat',
      summary: 'Dynamic, breath-linked sequences that build heat and fluid movement.',
      image: svc.vinyasa,
      location: 'Goa, India',
      duration: '5 days',
      level: 'Intermediate',
      featured: true,
      order: 2,
    },
    {
      title: 'Meditation & Breathwork Retreat',
      summary: 'Guided pranayama and stillness to quiet the mind and restore focus.',
      image: svc.meditation,
      location: 'Dharamshala, India',
      duration: 'Weekend',
      level: 'All Levels',
      featured: true,
      order: 3,
    },
    {
      title: 'Prenatal Nurture Retreat',
      summary: 'Gentle, safe practice to support strength and ease through pregnancy.',
      image: svc.prenatal,
      location: 'Bengaluru, India',
      duration: '2 days',
      level: 'Beginner',
      featured: false,
      order: 4,
    },
  ]
  for (const s of services) {
    await payload.create({
      collection: 'services',
      data: {
        ...s,
        level: s.level as 'All Levels' | 'Beginner' | 'Intermediate' | 'Advanced',
        description: rt(
          `The ${s.title} at Aumevya is run in small, handpicked groups so every guest receives attention and adjustment.`,
        ),
        published: true,
      },
    })
  }

  // 5. Testimonials
  const testimonials = [
    {
      name: 'Ananya S.',
      role: 'Student, 2 years',
      quote:
        'Aumevya changed my relationship with stress. The teachers are patient and the space feels genuinely peaceful.',
      avatar: avatars.a,
      rating: 5,
      order: 1,
    },
    {
      name: 'Rahul M.',
      role: 'Vinyasa regular',
      quote:
        'I came for flexibility and stayed for the calm. Best decision I made this year.',
      avatar: avatars.r,
      rating: 5,
      order: 2,
    },
    {
      name: 'Meera K.',
      role: 'Prenatal retreat',
      quote:
        'The prenatal retreat made me feel strong and supported through my whole pregnancy.',
      avatar: avatars.m,
      rating: 5,
      order: 3,
    },
  ]
  for (const t of testimonials) {
    await payload.create({ collection: 'testimonials', data: { ...t, published: true } })
  }

  // 6. Gallery
  const categories = ['Studio', 'Retreats', 'Community', 'Nature', 'Events', 'Studio'] as const
  for (let i = 0; i < gallery.length; i++) {
    await payload.create({
      collection: 'gallery',
      data: {
        image: gallery[i],
        caption: `Aumevya studio moment ${i + 1}`,
        category: categories[i],
        order: i + 1,
      },
    })
  }

  payload.logger.info('✅ Seed complete.')
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
