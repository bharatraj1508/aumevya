import type { CollectionConfig } from 'payload'
import { formatSlug } from '../lib/formatSlug'

export const Services: CollectionConfig = {
  slug: 'services',
  labels: { singular: 'Retreat', plural: 'Retreats' },
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'level', 'featured', 'published', 'order'],
  },
  defaultSort: 'order',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
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
      name: 'summary',
      type: 'textarea',
      required: true,
      admin: { description: 'One-line summary shown on cards.' },
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'location',
      type: 'text',
      admin: { description: 'Where the retreat takes place, e.g. "Rishikesh, India".' },
    },
    {
      type: 'row',
      fields: [
        { name: 'duration', type: 'text', admin: { width: '50%', description: 'e.g. 3 days / 60 min' } },
        {
          name: 'level',
          type: 'select',
          admin: { width: '50%' },
          options: ['All Levels', 'Beginner', 'Intermediate', 'Advanced'],
          defaultValue: 'All Levels',
        },
      ],
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
      admin: { position: 'sidebar', description: 'Show on the landing page.' },
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
  ],
}
