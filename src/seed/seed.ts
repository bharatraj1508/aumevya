import 'dotenv/config'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'
import config from '../payload.config'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const asset = (name: string) => path.resolve(dirname, 'assets', name)

/* ------------------------------------------------------------------ *
 * Lexical rich-text builders
 * Small helpers so seed content can use bold, italic, headings and
 * bullet / numbered lists — matching the formatting the CMS allows.
 * ------------------------------------------------------------------ */
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

  payload.logger.info('Seeding Aumevya content…')

  // 1. Clear existing content collections (keeps users + inquiries intact)
  for (const collection of ['retreats', 'testimonials', 'gallery', 'videos', 'media'] as const) {
    await payload.delete({ collection, where: { id: { exists: true } } })
  }

  // 2. Upload media assets
  const upload = async (file: string, alt: string) => {
    const doc = await payload.create({
      collection: 'media',
      data: { alt },
      filePath: asset(file),
    })
    return doc.id as string
  }

  const heroImg = await upload('hero.svg', 'Sunrise over a calm horizon')
  const aboutImg = await upload('about.svg', 'Peaceful yoga practice')
  const ogImg = await upload('og.svg', 'Aumevya Yoga')
  const hatha = await upload('service-hatha.svg', 'Hatha yoga retreat')
  const vinyasa = await upload('service-vinyasa.svg', 'Vinyasa flow retreat')
  const meditation = await upload('service-meditation.svg', 'Guided meditation retreat')
  const prenatal = await upload('service-prenatal.svg', 'Prenatal yoga retreat')
  const gallery: string[] = []
  for (let n = 1; n <= 6; n++) gallery.push(await upload(`gallery-${n}.svg`, `Studio moment ${n}`))
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
      primaryCtaHref: '/retreats',
      secondaryCtaLabel: 'Explore Retreats',
      secondaryCtaHref: '/retreats',
      backgroundImage: heroImg,
    },
  })

  await payload.updateGlobal({
    slug: 'about',
    data: {
      eyebrow: 'Our Story',
      heading: 'Yoga rooted in tradition, taught for modern life',
      body: doc(
        p(
          'Aumevya Yoga began with a simple belief: that a steady practice can bring calm, strength and clarity to everyday living.',
        ),
        p(
          'Our certified teachers guide small, handpicked retreats — blending classical Hatha foundations with flowing Vinyasa and restorative meditation.',
        ),
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
        'Aumevya Yoga — handpicked Hatha, Vinyasa, meditation and Ayurveda yoga retreats to unplug, de-stress and recharge, for every level.',
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

  // 4. Retreats
  const retreats = [
    {
      title: 'The Healing Journey: A Panchakarma Women’s Retreat',
      slug: 'panchakarma-womens-healing-retreat-khajuraho',
      images: [meditation, gallery[0], gallery[3], gallery[1], gallery[4], aboutImg],
      location: 'Khajuraho, India',
      fromDate: '2026-10-12',
      toDate: '2026-10-18',
      price: 153145,
      ratings: 5,
      featured: true,
      order: 1,
      benefits: ['Deep rest', 'Hormonal balance', 'Reduced stress', 'Emotional release', 'Better sleep'],
      summary: doc(
        p(
          b('A women-only Panchakarma retreat'),
          ' that combines the rejuvenating effects of yoga with the ancient healing principles of ',
          i('Ayurveda'),
          ' — held in a sacred, unhurried space beside the temples of Khajuraho.',
        ),
        p('Over seven days you will:'),
        ol(
          ['Restore your natural rhythm with daily guided practice and rest'],
          ['Receive personalised Ayurvedic treatments and consultations'],
          ['Eat nourishing, dosha-balancing vegetarian meals'],
          ['Reconnect with a small circle of women on the same journey'],
        ),
      ),
      whatIncludes: [
        '6 nights accommodation',
        'All Ayurvedic meals',
        'Daily yoga & meditation',
        'Panchakarma treatments',
        'Ayurvedic doctor consultation',
        'Airport transfer',
      ],
      notIncluded: ['Flights', 'Travel insurance', 'Personal expenses', 'Additional spa treatments'],
      retreatExperience: doc(
        p(
          'Mornings open gently with pranayama and a slow ',
          b('Hatha'),
          ' practice as the temples catch first light. Afternoons are yours — for treatments, rest, or quiet walks through the gardens.',
        ),
        p(
          'This is not a bootcamp. It is a ',
          i('deliberate slowing down'),
          ' — a week designed around your body’s need to repair.',
        ),
      ),
      programItinerary: [
        {
          title: 'Day 1 · Arrival & Grounding',
          timeline: [
            { time: '3:00 PM', description: 'Arrival, welcome drink and room check-in.' },
            { time: '5:00 PM', description: 'Opening circle and intention setting.' },
            { time: '7:00 PM', description: 'Nourishing welcome dinner.' },
          ],
        },
        {
          title: 'Day 2 · Assessment & Ease',
          timeline: [
            { time: '7:00 AM', description: 'Pranayama and gentle Hatha practice.' },
            { time: '9:00 AM', description: 'Ayurvedic breakfast.' },
            { time: '11:00 AM', description: 'One-to-one consultation with the Ayurvedic doctor.' },
            { time: '4:00 PM', description: 'First Panchakarma treatment.' },
          ],
        },
        {
          title: 'Day 3 · Deep Rest',
          timeline: [
            { time: '7:00 AM', description: 'Restorative yoga and yoga nidra.' },
            { time: '10:00 AM', description: 'Abhyanga (warm oil massage).' },
            { time: '6:00 PM', description: 'Guided meditation and journaling.' },
          ],
        },
      ],
      specialities: doc(
        h('h3', 'What makes this retreat special'),
        ul(
          [b('Women-only'), ' — a safe, sacred space held by female facilitators.'],
          [b('Authentic Panchakarma'), ' supervised by a registered Ayurvedic physician.'],
          [b('Tiny groups'), ' — never more than 10 guests.'],
        ),
      ),
      food: doc(
        p(
          'All meals are ',
          b('sattvic'),
          ', vegetarian and cooked to balance your dosha — fresh, local and free from processed sugar.',
        ),
        ul(
          ['Warm spiced breakfasts to kindle digestion'],
          ['Seasonal thali lunches'],
          ['Light, early dinners of kitchari and soups'],
        ),
      ),
      facilitation: doc(
        p(
          b('Dr. Kavya Menon'),
          ' is a registered Ayurvedic physician with over 15 years guiding women through Panchakarma. She is joined by ',
          b('Ananya Rao'),
          ', a senior Hatha teacher and yoga therapist.',
        ),
      ),
      locationInformation: doc(
        p(
          'The retreat is set in a heritage wellness estate a short drive from the ',
          b('Khajuraho temples'),
          ', surrounded by gardens and birdsong.',
        ),
        p(i('Nearest airport: Khajuraho (HJR), 20 minutes away. Complimentary transfer included.')),
      ),
      availableFacilities: [
        'Free Wifi',
        'Swimming pool',
        'Ayurvedic spa',
        'Vegetarian restaurant',
        'Garden',
        'Yoga shala',
        'Parking',
      ],
      retreatReviews: [
        {
          reviewerName: 'Misael Kumar',
          rating: 5,
          reviewDescription:
            'The most restorative week of my life. The treatments and the women who held the space were extraordinary.',
        },
        {
          reviewerName: 'Priya Sharma',
          rating: 5,
          reviewDescription:
            'I arrived exhausted and left glowing. The food alone was worth the trip — everything was intentional.',
        },
        {
          reviewerName: 'Elena Rossi',
          rating: 4.5,
          reviewDescription:
            'Beautifully organised and deeply personal. Dr. Kavya’s consultation changed how I eat at home.',
        },
      ],
    },
    {
      title: 'Himalayan Hatha & Meditation Retreat',
      slug: 'himalayan-hatha-meditation-retreat-rishikesh',
      images: [hatha, gallery[2], gallery[5], heroImg, gallery[0]],
      location: 'Rishikesh, India',
      fromDate: '2026-09-05',
      toDate: '2026-09-11',
      price: 98500,
      ratings: 4.8,
      featured: true,
      order: 2,
      benefits: ['Stronger practice', 'Mental clarity', 'Spinal health', 'Inner calm'],
      summary: doc(
        p(
          'A grounding week of ',
          b('classical Hatha yoga'),
          ' on the banks of the Ganges — the birthplace of yoga. For practitioners who want to build a steady, sustainable foundation.',
        ),
        ul(
          ['Twice-daily asana with detailed alignment'],
          ['Traditional pranayama and meditation'],
          ['Evening Ganga aarti and philosophy talks'],
        ),
      ),
      whatIncludes: [
        '6 nights accommodation',
        'All vegetarian meals',
        'Daily yoga & meditation',
        'Philosophy sessions',
        'Ganga aarti visit',
      ],
      notIncluded: ['Flights', 'Travel insurance', 'Visa fees', 'Personal expenses'],
      retreatExperience: doc(
        p(
          'Wake to the sound of the river. Practice as mist lifts off the foothills. This retreat pairs ',
          i('rigorous, traditional teaching'),
          ' with the quiet magic of Rishikesh.',
        ),
      ),
      programItinerary: [
        {
          title: 'Day 1 · Arrival',
          timeline: [
            { time: '2:00 PM', description: 'Check-in and riverside orientation.' },
            { time: '6:00 PM', description: 'Ganga aarti ceremony.' },
          ],
        },
        {
          title: 'Day 2 · Foundations',
          timeline: [
            { time: '6:00 AM', description: 'Pranayama and morning Hatha.' },
            { time: '8:00 AM', description: 'Breakfast.' },
            { time: '5:00 PM', description: 'Alignment workshop.' },
          ],
        },
      ],
      specialities: doc(
        p('Taught in the ', b('traditional gurukul style'), ' by teachers from a lineage of Himalayan yogis.'),
      ),
      food: doc(p('Simple, ', b('sattvic'), ' vegetarian meals served three times a day, plus herbal teas.')),
      facilitation: doc(
        p(b('Yogi Devendra'), ' has taught Hatha in Rishikesh for over 20 years and trains teachers worldwide.'),
      ),
      locationInformation: doc(
        p('A peaceful ashram-style stay in ', b('Tapovan, Rishikesh'), ', minutes from the Lakshman Jhula bridge.'),
      ),
      availableFacilities: ['Free Wifi', 'Rooftop yoga shala', 'Cafe', 'Library', 'River access'],
      retreatReviews: [
        {
          reviewerName: 'Tom Fischer',
          rating: 5,
          reviewDescription: 'My practice transformed in a week. The alignment detail was next level.',
        },
        {
          reviewerName: 'Aditi Nair',
          rating: 4.5,
          reviewDescription: 'Rishikesh is pure magic and the teaching was authentic and humble.',
        },
      ],
    },
    {
      title: 'Vinyasa & Surf Flow Retreat',
      slug: 'vinyasa-surf-flow-retreat-goa',
      images: [vinyasa, gallery[4], gallery[1], gallery[3], heroImg],
      location: 'Agonda, Goa, India',
      fromDate: '2026-11-14',
      toDate: '2026-11-19',
      price: 87000,
      ratings: 4.7,
      featured: true,
      order: 3,
      benefits: ['Energy & vitality', 'Core strength', 'Fun & connection', 'Ocean therapy'],
      summary: doc(
        p(
          'Sun, sand and ',
          b('dynamic Vinyasa'),
          ' — mornings on the mat, afternoons in the waves. A joyful, active retreat on Goa’s quietest beach.',
        ),
      ),
      whatIncludes: [
        '5 nights beachfront accommodation',
        'Daily Vinyasa flow',
        '3 surf lessons',
        'Breakfast & dinner',
        'Sunset beach meditation',
      ],
      notIncluded: ['Flights', 'Lunch', 'Surfboard damage deposit', 'Personal expenses'],
      retreatExperience: doc(
        p('Flow with the tide. ', i('Strong, breath-led sequences'), ' to open the body, then learn to read and ride the ocean.'),
      ),
      programItinerary: [
        {
          title: 'Day 1 · Arrival & Sunset Flow',
          timeline: [
            { time: '4:00 PM', description: 'Beach house check-in.' },
            { time: '6:00 PM', description: 'Gentle welcome flow at sunset.' },
          ],
        },
        {
          title: 'Day 2 · Flow & Surf',
          timeline: [
            { time: '7:00 AM', description: 'Energising Vinyasa.' },
            { time: '10:00 AM', description: 'First surf lesson.' },
            { time: '6:30 PM', description: 'Restorative stretch and beach meditation.' },
          ],
        },
      ],
      specialities: doc(
        ul(
          [b('Beachfront'), ' — roll out your mat with your toes in the sand.'],
          [b('All levels'), ' surf coaching from certified local instructors.'],
        ),
      ),
      food: doc(
        p('Fresh tropical breakfasts and ', b('coastal vegetarian dinners'), ' — think Goan curries, fruit and coconut.'),
      ),
      facilitation: doc(p(b('Maya D’Souza'), ', a 500-hour Vinyasa teacher, leads alongside Goa’s Wave School surf crew.')),
      locationInformation: doc(p('Right on ', b('Agonda Beach'), ' in South Goa — calm, clean and far from the crowds.')),
      availableFacilities: ['Free Wifi', 'Beachfront deck', 'Surfboards', 'Outdoor shower', 'Cafe'],
      retreatReviews: [
        {
          reviewerName: 'Jonas Weber',
          rating: 5,
          reviewDescription: 'Best week of my year. Yoga + surf is the perfect combination and Agonda is paradise.',
        },
        {
          reviewerName: 'Sara Lin',
          rating: 4.5,
          reviewDescription: 'Stood up on the board by day two! Maya’s flows were exactly the right intensity.',
        },
      ],
    },
    {
      title: 'Ayurveda Detox & Yoga Retreat',
      slug: 'ayurveda-detox-yoga-retreat-kerala',
      images: [prenatal, gallery[5], gallery[2], aboutImg, gallery[0]],
      location: 'Kovalam, Kerala, India',
      fromDate: '2026-12-06',
      toDate: '2026-12-14',
      price: 176000,
      ratings: 4.9,
      featured: false,
      order: 4,
      benefits: ['Full-body detox', 'Improved digestion', 'Weight balance', 'Renewed energy'],
      summary: doc(
        p(
          'An eight-day ',
          b('Ayurvedic cleanse'),
          ' in the backwaters of Kerala — gentle yoga, therapeutic treatments and a fully guided detox diet.',
        ),
        p('Ideal if you feel ', i('sluggish, depleted or ready to reset'), ' from the inside out.'),
      ),
      whatIncludes: [
        '8 nights accommodation',
        'Full detox meal plan',
        'Daily gentle yoga',
        'Daily Ayurvedic treatments',
        'Doctor consultations',
        'Herbal medicines',
      ],
      notIncluded: ['Flights', 'Travel insurance', 'Excursions', 'Personal expenses'],
      retreatExperience: doc(
        p('A ', b('supervised cleanse'), ' — not a fast. Each day balances rest, movement and treatment so your body can let go safely.'),
      ),
      programItinerary: [
        {
          title: 'Day 1 · Consultation',
          timeline: [
            { time: '11:00 AM', description: 'Arrival and check-in.' },
            { time: '3:00 PM', description: 'Detailed Ayurvedic assessment.' },
          ],
        },
        {
          title: 'Day 2 · Cleanse Begins',
          timeline: [
            { time: '6:30 AM', description: 'Gentle yoga and kriya.' },
            { time: '9:00 AM', description: 'Detox breakfast.' },
            { time: '11:00 AM', description: 'Synchronised massage (Pizhichil).' },
          ],
        },
      ],
      specialities: doc(
        p('One of the few retreats offering a ', b('full 8-day medically supervised detox'), ' with daily physician review.'),
      ),
      food: doc(
        p('A ', b('staged detox diet'), ' of light, warm, easily digestible foods:'),
        ul(['Herbal teas and rice congee'], ['Steamed vegetables and kitchari'], ['Fresh coconut water']),
      ),
      facilitation: doc(p(b('Dr. Suresh Nair'), ' leads a team of Ayurvedic physicians and therapists at this dedicated wellness centre.')),
      locationInformation: doc(p('A serene clifftop centre overlooking the Arabian Sea at ', b('Kovalam'), ', 20 minutes from Trivandrum airport.')),
      availableFacilities: ['Free Wifi', 'Infinity pool', 'Full Ayurvedic clinic', 'Restaurant', 'Meditation hall', 'Sea view rooms'],
      retreatReviews: [
        {
          reviewerName: 'Hannah Müller',
          rating: 5,
          reviewDescription: 'I have never felt so light and clear. Truly medical-grade Ayurveda with so much care.',
        },
        {
          reviewerName: 'Rohan Mehta',
          rating: 5,
          reviewDescription: 'The physicians were exceptional. This is a genuine detox, not a spa holiday.',
        },
      ],
    },
    {
      title: 'Silent Meditation & Breathwork Retreat',
      slug: 'silent-meditation-breathwork-retreat-dharamshala',
      images: [meditation, gallery[3], gallery[1], gallery[5], heroImg],
      location: 'Dharamshala, India',
      fromDate: '2026-09-25',
      toDate: '2026-09-29',
      price: 64000,
      ratings: 4.6,
      featured: false,
      order: 5,
      benefits: ['Mental stillness', 'Reduced anxiety', 'Focus', 'Emotional clarity'],
      summary: doc(
        p(
          'A ',
          b('four-day silent retreat'),
          ' in the Himalayan foothills of Dharamshala — guided meditation, ',
          i('pranayama'),
          ' and long stretches of noble silence to quiet the mind.',
        ),
      ),
      whatIncludes: [
        '4 nights accommodation',
        'All meals',
        'Guided meditation sessions',
        'Breathwork workshops',
        'One-to-one check-ins',
      ],
      notIncluded: ['Flights', 'Travel insurance', 'Personal expenses'],
      retreatExperience: doc(
        p('Silence is the teacher. With phones set aside, days move through ', b('sitting, walking and breath'), ' — a rare chance to truly rest the mind.'),
      ),
      programItinerary: [
        {
          title: 'Day 1 · Entering Silence',
          timeline: [
            { time: '4:00 PM', description: 'Arrival and orientation.' },
            { time: '7:00 PM', description: 'Silence begins after dinner.' },
          ],
        },
        {
          title: 'Day 2 · Breath & Stillness',
          timeline: [
            { time: '6:00 AM', description: 'Silent sitting meditation.' },
            { time: '9:00 AM', description: 'Breathwork workshop.' },
            { time: '5:00 PM', description: 'Walking meditation in the pines.' },
          ],
        },
      ],
      specialities: doc(p('A genuine ', b('noble-silence container'), ' — supported, never austere, with daily private check-ins.')),
      food: doc(p('Warm, simple ', b('vegetarian meals'), ' eaten mindfully in silence.')),
      facilitation: doc(p(b('Tenzin Palmo'), ', a meditation teacher trained in the Tibetan tradition, guides the retreat.')),
      locationInformation: doc(p('Held at a mountain centre above ', b('McLeod Ganj'), ', with sweeping views of the Dhauladhar range.')),
      availableFacilities: ['Meditation hall', 'Garden', 'Library', 'Mountain-view rooms', 'Tea house'],
      retreatReviews: [
        {
          reviewerName: 'Claire Dubois',
          rating: 5,
          reviewDescription: 'Four days of silence gave me more than years of talking therapy. Profound and gentle.',
        },
        {
          reviewerName: 'Vikram Singh',
          rating: 4,
          reviewDescription: 'Challenging at first, then deeply freeing. The breathwork sessions were a highlight.',
        },
      ],
    },
  ]

  for (const r of retreats) {
    await payload.create({ collection: 'retreats', data: { ...r, published: true } })
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
      quote: 'I came for flexibility and stayed for the calm. Best decision I made this year.',
      avatar: avatars.r,
      rating: 5,
      order: 2,
    },
    {
      name: 'Meera K.',
      role: 'Meditation retreat',
      quote: 'The silent retreat made me feel strong and supported through a hard season.',
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
  for (let n = 0; n < gallery.length; n++) {
    await payload.create({
      collection: 'gallery',
      data: {
        image: gallery[n],
        caption: `Aumevya studio moment ${n + 1}`,
        category: categories[n],
        order: n + 1,
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
