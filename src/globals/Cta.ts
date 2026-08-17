import type { GlobalConfig } from 'payload'

export const Cta: GlobalConfig = {
  slug: 'cta',
  label: 'Call To Action',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: true,
      defaultValue: 'Begin your practice today',
    },
    {
      name: 'subheading',
      type: 'textarea',
    },
    {
      name: 'buttonLabel',
      type: 'text',
      defaultValue: 'Book Your First Retreat',
    },
    {
      name: 'buttonHref',
      type: 'text',
      defaultValue: '/contact',
    },
  ],
}
