import type { GlobalConfig } from 'payload'

export const CoursesPage: GlobalConfig = {
  slug: 'courses-page',
  label: 'Courses Page',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Wide cover photo across the top of the Courses page (like a Facebook / Notion cover).',
      },
    },
    {
      name: 'eyebrow',
      type: 'text',
      label: 'Eyebrow / Kicker',
      defaultValue: 'Learning journeys',
      admin: { description: 'Small text above the title.' },
    },
    {
      name: 'heading',
      type: 'text',
      required: true,
      defaultValue: 'Courses',
      admin: { description: 'The large title shown on the cover.' },
    },
    {
      name: 'subheading',
      type: 'textarea',
      admin: { description: 'One or two supporting sentences shown under the title.' },
    },
  ],
}
