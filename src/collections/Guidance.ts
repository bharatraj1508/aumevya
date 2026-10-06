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
      name: 'packages',
      type: 'array',
      minRows: 1,
      labels: { singular: 'Session Package', plural: 'Session Packages' },
      admin: {
        description:
          'The session packages users choose from when booking this guidance. Add at least one. Drag to reorder — the order shown on the page.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
              admin: { width: '60%', description: 'e.g. "Discovery Call" or "Deep Dive".' },
            },
            {
              name: 'duration',
              type: 'number',
              required: true,
              min: 1,
              admin: { width: '40%', description: 'Session length in minutes, e.g. 30.' },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'price',
              type: 'number',
              required: true,
              min: 0,
              admin: { width: '50%', description: 'Price in ₹. Enter 0 to show "Free".' },
            },
            {
              name: 'originalPrice',
              type: 'number',
              min: 0,
              admin: {
                width: '50%',
                description:
                  'Optional "was" price for a strike-through + "% OFF" tag. Leave blank for no discount.',
              },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'badge',
              type: 'select',
              defaultValue: 'none',
              options: [
                { label: 'None', value: 'none' },
                { label: 'Most Popular', value: 'most-popular' },
                { label: 'Best Value', value: 'best-value' },
              ],
              admin: { width: '50%', description: 'Optional highlight badge on the card.' },
            },
            {
              name: 'tagline',
              type: 'text',
              admin: {
                width: '50%',
                description: 'Optional one-line tagline under the package name.',
              },
            },
          ],
        },
        {
          name: 'features',
          type: 'array',
          labels: { singular: 'Feature', plural: 'Features' },
          admin: { description: 'Bullet points shown on the package card.' },
          fields: [
            {
              name: 'text',
              type: 'text',
              required: true,
              admin: { description: 'e.g. "Personalised next-step guidance".' },
            },
          ],
        },
      ],
    },
    {
      name: 'slots',
      type: 'group',
      label: 'Time Slots',
      admin: {
        description:
          'Discrete start times offered under each category. The session length comes from the chosen package, so just add start times here.',
      },
      fields: (['morning', 'afternoon', 'evening'] as const).map((category) => ({
        name: category,
        type: 'array' as const,
        labels: {
          singular: `${category[0].toUpperCase()}${category.slice(1)} time`,
          plural: `${category[0].toUpperCase()}${category.slice(1)} times`,
        },
        admin: {
          description: `Start times for the ${category} category (e.g. 09:00, 09:30). Drag to reorder.`,
        },
        fields: [
          {
            name: 'time',
            type: 'text' as const,
            required: true,
            admin: {
              description: 'Start time (24h).',
              components: { Field: '/components/admin/TimePickerField#TimePickerField' },
            },
          },
        ],
      })),
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
