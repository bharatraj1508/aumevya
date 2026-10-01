import type { CollectionConfig } from 'payload'
import { formatSlug } from '../lib/formatSlug'
import { cropField } from './fields/cropField'

export const Guidance: CollectionConfig = {
  slug: 'guidance',
  labels: { singular: 'Guidance', plural: 'Guidance' },
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'featured', 'published'],
  },
  defaultSort: 'order',
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: { description: 'Cover image shown on the guidance card and detail hero.' },
    },
    cropField('imageCrops', {
      imageField: 'image',
      placements: [
        { key: 'card', label: 'Guidance card', aspect: 16 / 10 },
        { key: 'detail', label: 'Detail page header', aspect: 16 / 9 },
      ],
    }),
    {
      name: 'summary',
      type: 'textarea',
      required: true,
      admin: { description: 'Short one or two line description shown on the card.' },
    },
    {
      name: 'about',
      type: 'richText',
      admin: {
        description: 'Overview shown first on the detail page as the "Overview" section.',
      },
    },
    {
      name: 'tabs',
      type: 'array',
      labels: { singular: 'Tab', plural: 'Tabs' },
      admin: {
        description:
          'Add tabs to customise the guidance page. Each tab has a title and a description. Drag to reorder.',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          admin: { description: 'Tab name shown on the page, e.g. "What to expect".' },
        },
        {
          name: 'content',
          type: 'richText',
          required: true,
          admin: { description: 'Formatted description shown under this tab.' },
        },
      ],
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Auto-generated from the title if left blank.',
      },
      hooks: {
        beforeValidate: [formatSlug('title')],
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Lower numbers appear first.' },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'Highlight this guidance on the list.' },
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
  ],
}
