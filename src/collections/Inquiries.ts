import type { CollectionConfig } from 'payload'

// Inquiries are created only through the public API route handlers
// (/api/inquiries, /api/contact) using overrideAccess, or by an authenticated
// admin. Public REST create is disabled so the endpoints can enforce
// validation, spam protection and save-before-email.
const adminOnly = ({ req }: { req: { user?: unknown } }) => Boolean(req.user)

export const Inquiries: CollectionConfig = {
  slug: 'inquiries',
  labels: { singular: 'Inquiry', plural: 'Inquiries' },
  access: {
    create: adminOnly,
    read: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'email', 'status', 'createdAt'],
    group: 'Submissions',
  },
  defaultSort: '-createdAt',
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          defaultValue: 'contact',
          options: [
            { label: 'Booking Inquiry', value: 'booking' },
            { label: 'Contact Message', value: 'contact' },
          ],
          admin: { width: '50%' },
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'new',
          options: [
            { label: 'New', value: 'new' },
            { label: 'Contacted', value: 'contacted' },
            { label: 'Archived', value: 'archived' },
          ],
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, admin: { width: '50%' } },
        { name: 'email', type: 'email', required: true, admin: { width: '50%' } },
      ],
    },
    { name: 'phone', type: 'text' },
    {
      name: 'service',
      type: 'relationship',
      relationTo: 'services',
      admin: {
        description: 'Service of interest (booking inquiries).',
        condition: (data) => data?.type === 'booking',
      },
    },
    {
      name: 'preferredDate',
      type: 'text',
      admin: {
        description: 'Free-text preferred date/time (Phase 1 — no calendar yet).',
        condition: (data) => data?.type === 'booking',
      },
    },
    { name: 'message', type: 'textarea' },
    {
      name: 'notified',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Was the admin notification email sent successfully?',
      },
    },
  ],
}
