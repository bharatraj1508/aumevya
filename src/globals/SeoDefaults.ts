import type { GlobalConfig } from 'payload'

export const SeoDefaults: GlobalConfig = {
  slug: 'seo-defaults',
  label: 'SEO Defaults',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      required: true,
      defaultValue: 'Aumevya Yoga',
    },
    {
      name: 'titleTemplate',
      type: 'text',
      defaultValue: '%s · Aumevya Yoga',
      admin: { description: 'Use %s as a placeholder for the page title.' },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'ogImage',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Default social-share image (1200×630 recommended).' },
    },
  ],
}
