import type { GlobalConfig } from 'payload'
import { cropField } from '../collections/fields/cropField'

export const About: GlobalConfig = {
  slug: 'about',
  label: 'About Section',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Wide cover photo across the top of the About page, with the title over it.',
      },
    },
    cropField('coverImageCrop', {
      imageField: 'coverImage',
      placements: [{ key: 'cover', label: 'Page cover', aspect: 16 / 9 }],
    }),
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
    cropField('imageCrop', {
      imageField: 'image',
      placements: [{ key: 'portrait', label: 'About photo', aspect: 4 / 5 }],
    }),
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
