import type { CollectionConfig } from 'payload'
import { cropField } from './fields/cropField'

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
    cropField('imageCrop', {
      imageField: 'image',
      placements: [{ key: 'portrait', label: 'Gallery tile', aspect: 4 / 5 }],
    }),
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
