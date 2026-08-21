import type { CollectionConfig, Field } from 'payload'
import { formatSlug } from '../lib/formatSlug'

// A rich-text field configured for the marketing body copy (bold, italic,
// headings, and both bullet + numbered lists — matching the BookRetreats look).
const formatted = (name: string, description?: string): Field => ({
  name,
  type: 'richText',
  admin: description ? { description } : undefined,
})

export const Retreats: CollectionConfig = {
  slug: 'retreats',
  labels: { singular: 'Retreat', plural: 'Retreats' },
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'location', 'price', 'ratings', 'featured', 'published'],
  },
  defaultSort: 'order',
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Overview',
          fields: [
            { name: 'title', type: 'text', required: true },
            {
              name: 'images',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              required: true,
              minRows: 1,
              admin: { description: 'Photo gallery. The first image is used as the cover.' },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'location',
                  type: 'text',
                  required: true,
                  admin: { width: '50%', description: 'e.g. "Khajuraho, India".' },
                },
                {
                  name: 'price',
                  type: 'number',
                  required: true,
                  min: 0,
                  admin: { width: '50%', description: 'Starting price per person (₹).' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'fromDate',
                  type: 'date',
                  required: true,
                  admin: { width: '33%', date: { pickerAppearance: 'dayOnly' } },
                },
                {
                  name: 'toDate',
                  type: 'date',
                  required: true,
                  admin: { width: '33%', date: { pickerAppearance: 'dayOnly' } },
                },
                {
                  name: 'ratings',
                  type: 'number',
                  required: true,
                  min: 0,
                  max: 5,
                  admin: { width: '34%', step: 0.1, description: 'Out of 5.' },
                },
              ],
            },
            {
              name: 'summary',
              type: 'richText',
              required: true,
              admin: { description: 'Main overview. Supports bold, italic, and bullet lists.' },
            },
          ],
        },
        {
          label: 'Experience',
          fields: [
            formatted('retreatExperience', 'What guests will experience day to day.'),
            formatted('specialities', 'What makes this retreat special.'),
            formatted('food', 'Food & dining details.'),
            formatted('facilitation', 'About the facilitator(s) / hosts.'),
            {
              name: 'benefits',
              type: 'text',
              hasMany: true,
              admin: { description: 'Key benefits, one per tag. e.g. "Reduced stress", "Better sleep".' },
            },
          ],
        },
        {
          label: 'Program',
          fields: [
            {
              name: 'programItinerary',
              type: 'array',
              labels: { singular: 'Day', plural: 'Days' },
              admin: { description: 'Add a day, then add timeline entries within it.' },
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  admin: { description: 'e.g. "Day 1 · Arrival & Grounding".' },
                },
                {
                  name: 'timeline',
                  type: 'array',
                  labels: { singular: 'Time slot', plural: 'Timeline' },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'time',
                          type: 'text',
                          required: true,
                          admin: { width: '30%', description: 'e.g. "7:00 AM".' },
                        },
                        {
                          name: 'description',
                          type: 'textarea',
                          required: true,
                          admin: { width: '70%', description: 'What happens at this time.' },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Included & Facilities',
          fields: [
            {
              name: 'whatIncludes',
              type: 'text',
              hasMany: true,
              admin: {
                description:
                  'Select or type your own. Suggestions: Accommodation, All meals, Daily yoga, Airport transfer, Excursions, Welcome drink.',
              },
            },
            {
              name: 'notIncluded',
              type: 'text',
              hasMany: true,
              admin: {
                description:
                  'Select or type your own. Suggestions: Flights, Travel insurance, Visa fees, Personal expenses, Spa treatments.',
              },
            },
            {
              name: 'availableFacilities',
              type: 'text',
              hasMany: true,
              admin: {
                description:
                  'Select or type your own. Suggestions: Free Wifi, Swimming pool, Spa, Restaurant, Garden, Yoga shala, Parking.',
              },
            },
          ],
        },
        {
          label: 'Location',
          fields: [formatted('locationInformation', 'About the location and how to get there.')],
        },
        {
          label: 'Reviews',
          fields: [
            {
              name: 'retreatReviews',
              type: 'array',
              labels: { singular: 'Review', plural: 'Reviews' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'reviewerName', type: 'text', required: true, admin: { width: '60%' } },
                    {
                      name: 'rating',
                      type: 'number',
                      required: true,
                      min: 0,
                      max: 5,
                      admin: { width: '40%', step: 0.1, description: 'Out of 5.' },
                    },
                  ],
                },
                { name: 'reviewDescription', type: 'textarea', required: true },
              ],
            },
          ],
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
