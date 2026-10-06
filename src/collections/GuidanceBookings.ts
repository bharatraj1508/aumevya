import type { CollectionConfig } from 'payload'

// Guidance bookings are created only through the public API route
// (/api/forms/guidance) using overrideAccess, or by an authenticated admin.
// Public REST create is disabled so the endpoint can enforce validation, spam
// protection and save-before-email.
const adminOnly = ({ req }: { req: { user?: unknown } }) => Boolean(req.user)

export const GuidanceBookings: CollectionConfig = {
  slug: 'guidance-bookings',
  labels: { singular: 'Guidance Booking', plural: 'Guidance Bookings' },
  access: {
    create: adminOnly,
    read: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: [
      'name',
      'email',
      'packageName',
      'bookingDate',
      'slotCategory',
      'slotTime',
      'status',
      'createdAt',
    ],
    group: 'Submissions',
  },
  defaultSort: '-createdAt',
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, admin: { width: '50%' } },
        { name: 'email', type: 'email', required: true, admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'phone', type: 'text', admin: { width: '50%' } },
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
      name: 'guidance',
      type: 'relationship',
      relationTo: 'guidance',
      admin: { description: 'Guidance session the booking is for.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'packageName',
          type: 'text',
          admin: { width: '40%', description: 'Chosen session package at time of booking.' },
        },
        {
          name: 'packageDuration',
          type: 'number',
          admin: { width: '20%', description: 'Session length (minutes).' },
        },
        {
          name: 'packagePrice',
          type: 'number',
          admin: { width: '20%', description: 'Package price (₹) at time of booking.' },
        },
        {
          name: 'packageOriginalPrice',
          type: 'number',
          admin: { width: '20%', description: 'Original/was price (₹), if discounted.' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'bookingDate',
          type: 'date',
          admin: {
            width: '50%',
            date: { pickerAppearance: 'dayOnly', displayFormat: 'EEE, dd MMM yyyy' },
            description: 'Requested booking date.',
          },
        },
        {
          name: 'slotCategory',
          type: 'select',
          options: [
            { label: 'Morning', value: 'morning' },
            { label: 'Afternoon', value: 'afternoon' },
            { label: 'Evening', value: 'evening' },
          ],
          admin: { width: '25%', description: 'Slot category chosen.' },
        },
        {
          name: 'slotTime',
          type: 'text',
          admin: { width: '25%', description: 'Chosen start time, e.g. "9:00 AM".' },
        },
      ],
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
