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
        description:
          'Overview shown in the "Read more" popup — appears as the first "Overview" tab. Can be as long as you like.',
      },
    },
    {
      name: 'tabs',
      type: 'blocks',
      labels: { singular: 'Tab', plural: 'Tabs' },
      admin: {
        description:
          'Add tabs to the course popup. Click "Add Tab" and pick a type — a Normal text tab, an Itinerary (day-by-day), or a Gallery with prices (like retreat accommodation). Drag to reorder.',
      },
      blocks: [
        {
          slug: 'contentTab',
          labels: { singular: 'Normal Tab', plural: 'Normal Tabs' },
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
              admin: { description: 'Tab name shown in the popup, e.g. "What’s Included".' },
            },
            {
              name: 'content',
              type: 'richText',
              required: true,
              admin: { description: 'Formatted content shown when this tab is selected.' },
            },
          ],
        },
        {
          slug: 'itineraryTab',
          labels: { singular: 'Itinerary Tab', plural: 'Itinerary Tabs' },
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
              defaultValue: 'Itinerary',
              admin: { description: 'Tab name shown in the popup.' },
            },
            {
              name: 'intro',
              type: 'textarea',
              admin: { description: 'Optional line shown above the schedule.' },
            },
            {
              name: 'items',
              type: 'array',
              minRows: 1,
              labels: { singular: 'Day / Step', plural: 'Days / Steps' },
              admin: { description: 'Each row is a step on the itinerary, shown as a timeline.' },
              fields: [
                {
                  name: 'heading',
                  type: 'text',
                  required: true,
                  admin: { description: 'e.g. "Day 1 · Arrival & Orientation".' },
                },
                {
                  name: 'description',
                  type: 'textarea',
                  required: true,
                  admin: { description: 'What happens during this step.' },
                },
              ],
            },
          ],
        },
        {
          slug: 'galleryTab',
          labels: { singular: 'Gallery + Price Tab', plural: 'Gallery + Price Tabs' },
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
              defaultValue: 'Accommodation',
              admin: { description: 'Tab name shown in the popup, e.g. "Accommodation".' },
            },
            {
              name: 'intro',
              type: 'textarea',
              admin: { description: 'Optional line shown above the cards.' },
            },
            {
              name: 'items',
              type: 'array',
              minRows: 1,
              labels: { singular: 'Card', plural: 'Cards' },
              admin: { description: 'Each card shows a photo, a name and an optional price.' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'name',
                      type: 'text',
                      required: true,
                      admin: { width: '60%', description: 'e.g. "Private Room".' },
                    },
                    {
                      name: 'price',
                      type: 'number',
                      min: 0,
                      admin: {
                        width: '40%',
                        description: 'Price per person (₹). Leave blank to show no price.',
                      },
                    },
                  ],
                },
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                  admin: { description: 'Photo for this card.' },
                },
                {
                  name: 'description',
                  type: 'textarea',
                  admin: { description: 'Optional short line under the name.' },
                },
              ],
            },
          ],
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
