import type { GlobalConfig } from 'payload'

/** Accepts #rgb or #rrggbb hex colors. */
const isHex = (value: unknown): true | string =>
  typeof value === 'string' && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim())
    ? true
    : 'Enter a hex color, e.g. #d64500.'

export const Theme: GlobalConfig = {
  slug: 'theme',
  label: 'Theme',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'primaryColor',
      type: 'text',
      required: true,
      defaultValue: '#d64500',
      validate: isHex,
      admin: {
        components: {
          Field: '/components/admin/ColorPickerField#ColorPickerField',
        },
        description:
          'Primary brand color. Drives buttons, links, gradients, focus rings and hover accents across the whole site. Default is Cromix Orange.',
      },
    },
    {
      name: 'accentColor',
      type: 'text',
      required: true,
      defaultValue: '#f5a623',
      validate: isHex,
      admin: {
        components: {
          Field: '/components/admin/ColorPickerField#ColorPickerField',
        },
        description:
          'Secondary accent. Used for star ratings, small badges and the highlight in gradients.',
      },
    },
  ],
}
