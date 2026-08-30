import type { GlobalConfig } from 'payload'

export const Hero: GlobalConfig = {
  slug: 'hero',
  label: 'Hero Section',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      label: 'Eyebrow / Kicker',
      admin: { description: 'Small text above the headline, e.g. "Aumevya Yoga".' },
    },
    {
      name: 'heading',
      type: 'text',
      required: true,
      admin: { description: 'Main headline. Keep it short and evocative.' },
    },
    {
      name: 'subheading',
      type: 'textarea',
      admin: { description: 'One or two supporting sentences.' },
    },
    {
      name: 'primaryCtaLabel',
      type: 'text',
      defaultValue: 'Book Now',
    },
    {
      name: 'primaryCtaHref',
      type: 'text',
      defaultValue: '/contact',
    },
    {
      name: 'secondaryCtaLabel',
      type: 'text',
      defaultValue: 'Explore Retreats',
    },
    {
      name: 'secondaryCtaHref',
      type: 'text',
      defaultValue: '/retreats',
    },
    {
      name: 'heroImages',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      minRows: 6,
      maxRows: 6,
      admin: {
        description:
          'Exactly 6 images shown floating in the hero. Order matters — they fill the layout clockwise from the top-left.',
      },
    },
  ],
}
