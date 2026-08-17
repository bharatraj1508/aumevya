import type { CollectionConfig } from 'payload'

export const Videos: CollectionConfig = {
  slug: 'videos',
  labels: { singular: 'Video', plural: 'Videos' },
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'videoType', 'order'],
  },
  defaultSort: 'order',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'videoType',
      type: 'select',
      required: true,
      defaultValue: 'embed',
      options: [
        { label: 'Embed (YouTube / Vimeo URL)', value: 'embed' },
        { label: 'Uploaded file', value: 'upload' },
      ],
    },
    {
      name: 'embedUrl',
      type: 'text',
      admin: {
        description: 'Paste a YouTube/Vimeo URL.',
        condition: (_, siblingData) => siblingData?.videoType === 'embed',
      },
    },
    {
      name: 'file',
      type: 'upload',
      relationTo: 'media',
      admin: {
        condition: (_, siblingData) => siblingData?.videoType === 'upload',
      },
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar' },
    },
  ],
}
