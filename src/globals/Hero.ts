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
      defaultValue: '/services',
    },
    {
      name: 'backgroundImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'Full-bleed hero background image. Used when no background video is set, and as the poster while a video loads.',
      },
    },
    {
      name: 'heroVideo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'Optional. A looping background video (MP4/WebM). If set, it plays behind the hero and takes precedence over the background image. Leave empty to use the image.',
      },
    },
  ],
}
