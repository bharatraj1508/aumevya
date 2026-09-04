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
    {
      type: 'collapsible',
      label: 'Appearance (tablet & mobile only)',
      admin: {
        description:
          'These settings only affect the tablet & mobile hero (the full-screen image slideshow). The desktop / laptop layout always uses its original design and is unaffected.',
      },
      fields: [
        {
          name: 'imageOpacity',
          type: 'number',
          label: 'Background image opacity (%)',
          defaultValue: 60,
          min: 0,
          max: 100,
          admin: {
            description:
              'Tablet & mobile only. How visible the background hero images are (0 = hidden, 100 = full strength).',
          },
        },
        {
          name: 'overlayOpacity',
          type: 'number',
          label: 'Copy backdrop opacity (%)',
          defaultValue: 100,
          min: 0,
          max: 100,
          admin: {
            description:
              'Tablet & mobile only. Strength of the soft white wash behind the title & subtitle that keeps them legible.',
          },
        },
        {
          name: 'slideInterval',
          type: 'number',
          label: 'Image change interval (seconds)',
          defaultValue: 3,
          min: 1,
          max: 30,
          admin: {
            description:
              'Tablet & mobile only. How long each background image shows before turning to the next.',
          },
        },
      ],
    },
  ],
}
