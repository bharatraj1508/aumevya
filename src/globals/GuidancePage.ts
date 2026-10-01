import type { GlobalConfig } from 'payload'
import { cropField } from '../collections/fields/cropField'

export const GuidancePage: GlobalConfig = {
  slug: 'guidance-page',
  label: 'Guidance Page',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Wide cover photo across the top of the Guidance page (like the Courses page).',
      },
    },
    cropField('coverImageCrop', {
      imageField: 'coverImage',
      placements: [{ key: 'cover', label: 'Page cover', aspect: 16 / 9 }],
    }),
    {
      name: 'eyebrow',
      type: 'text',
      label: 'Eyebrow / Kicker',
      defaultValue: 'Personalised mentorship',
      admin: { description: 'Small text above the title.' },
    },
    {
      name: 'heading',
      type: 'text',
      required: true,
      defaultValue: 'Guidance',
      admin: { description: 'The large title shown on the cover.' },
    },
    {
      name: 'subheading',
      type: 'textarea',
      admin: { description: 'One or two supporting sentences shown under the title.' },
    },
  ],
}
