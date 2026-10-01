import type { CollectionConfig } from 'payload'
import { cropField } from './fields/cropField'

export const TeamMembers: CollectionConfig = {
  slug: 'team-members',
  labels: { singular: 'Team Member', plural: 'Team Members' },
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'published', 'order'],
    description: 'People shown in the "Meet your team" section on the home and about pages.',
  },
  defaultSort: 'order',
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'text',
      admin: { description: 'e.g. "Lead Yoga Teacher" or "Founder".' },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'A portrait photo. A 4:5 (portrait) crop looks best.' },
    },
    cropField('imageCrop', {
      imageField: 'image',
      placements: [{ key: 'portrait', label: 'Team photo', aspect: 4 / 5 }],
    }),
    {
      name: 'about',
      type: 'textarea',
      label: 'About',
      admin: { description: 'A short bio — one or two sentences.' },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar' },
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
  ],
}
