import type { CollectionConfig } from 'payload'
import { formatSlug } from '../lib/formatSlug'

export const Courses: CollectionConfig = {
  slug: 'courses',
  labels: { singular: 'Course', plural: 'Courses' },
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'price', 'ratings', 'featured', 'published'],
  },
  defaultSort: 'order',
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: { description: 'Cover image shown on the course card.' },
    },
    {
      name: 'summary',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Short one or two line excerpt shown on the card, before "Read more".',
      },
    },
    {
      name: 'about',
      type: 'richText',
      admin: {
        description: 'Full description shown in the "Read more" panel. Can be as long as you like.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'price',
          type: 'number',
          required: true,
          min: 0,
          admin: { width: '50%', description: 'Price per person (₹). Enter 0 to show "Free".' },
        },
        {
          name: 'ratings',
          type: 'number',
          required: true,
          min: 0,
          max: 5,
          admin: { width: '50%', step: 0.1, description: 'Out of 5.' },
        },
      ],
    },
    {
      name: 'bookNowLink',
      type: 'text',
      admin: {
        description: 'Where the Book Now button goes (full URL or path). Defaults to /contact if blank.',
      },
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Auto-generated from the name if left blank.',
      },
      hooks: {
        beforeValidate: [formatSlug('name')],
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
      admin: { position: 'sidebar', description: 'Highlight this course on the list.' },
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
  ],
}
