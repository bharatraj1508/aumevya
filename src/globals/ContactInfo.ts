import type { GlobalConfig } from 'payload'

export const ContactInfo: GlobalConfig = {
  slug: 'contact-info',
  label: 'Contact Information',
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'email', type: 'email', admin: { width: '50%' } },
        { name: 'phone', type: 'text', admin: { width: '50%' } },
      ],
    },
    {
      name: 'whatsapp',
      type: 'text',
      admin: { description: 'WhatsApp number in international format, e.g. +91...' },
    },
    {
      name: 'address',
      type: 'textarea',
    },
    {
      name: 'mapEmbedUrl',
      type: 'text',
      admin: { description: 'Google Maps embed URL (src of the iframe).' },
    },
    {
      name: 'hours',
      type: 'array',
      label: 'Opening Hours',
      fields: [
        { name: 'days', type: 'text', required: true, admin: { description: 'e.g. Mon – Fri' } },
        { name: 'time', type: 'text', required: true, admin: { description: 'e.g. 6:00 AM – 9:00 PM' } },
      ],
    },
    {
      name: 'socials',
      type: 'group',
      fields: [
        { name: 'instagram', type: 'text' },
        { name: 'facebook', type: 'text' },
        { name: 'youtube', type: 'text' },
      ],
    },
  ],
}
