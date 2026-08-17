import type { CollectionConfig } from 'payload'

export const Gallery: CollectionConfig = {
  slug: 'gallery',
  labels: { singular: 'Gallery Item', plural: 'Gallery' },
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'caption',
    defaultColumns: ['caption', 'category', 'order'],
  },
  defaultSort: 'order',
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'caption',
      type: 'text',
    },
    {
      name: 'category',
      type: 'select',
      options: ['Studio', 'Retreats', 'Events', 'Nature', 'Community'],
      defaultValue: 'Studio',
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar' },
    },
  ],
}
