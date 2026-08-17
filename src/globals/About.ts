import type { GlobalConfig } from 'payload'

export const About: GlobalConfig = {
  slug: 'about',
  label: 'About Section',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      defaultValue: 'Our Story',
    },
    {
      name: 'heading',
      type: 'text',
      required: true,
    },
    {
      name: 'body',
      type: 'richText',
      admin: { description: 'Rich text — bold, links, lists. Layout stays developer-controlled.' },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'highlights',
      type: 'array',
      label: 'Highlights / Stats',
      admin: { description: 'Short stat cards, e.g. "10+ Years" / "Experience".' },
      fields: [
        { name: 'value', type: 'text', required: true },
        { name: 'label', type: 'text', required: true },
      ],
    },
  ],
}
