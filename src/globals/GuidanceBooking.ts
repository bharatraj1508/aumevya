import type { GlobalConfig } from 'payload'

/**
 * Shared booking configuration for the "Book Guidance" form: the time slots on
 * offer and the rule that decides which calendar dates are open to users.
 * A single config drives every guidance session.
 */
export const GuidanceBooking: GlobalConfig = {
  slug: 'guidance-booking-config',
  label: 'Guidance Booking',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'slots',
      type: 'array',
      minRows: 1,
      labels: { singular: 'Slot', plural: 'Slots' },
      admin: {
        description:
          'The time slots users can book. Add a slot with a title and a start/end time. Drag to reorder.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
              admin: { width: '40%', description: 'e.g. "Morning".' },
            },
            {
              name: 'startTime',
              type: 'text',
              required: true,
              admin: {
                width: '30%',
                description: 'Start time.',
                components: { Field: '/components/admin/TimePickerField#TimePickerField' },
              },
            },
            {
              name: 'endTime',
              type: 'text',
              required: true,
              admin: {
                width: '30%',
                description: 'End time.',
                components: { Field: '/components/admin/TimePickerField#TimePickerField' },
              },
            },
          ],
        },
      ],
    },
    {
      name: 'availability',
      type: 'group',
      label: 'Open dates',
      admin: {
        description: 'Choose which calendar dates are open for booking.',
      },
      fields: [
        {
          name: 'rangeType',
          type: 'select',
          required: true,
          defaultValue: 'month',
          options: [
            { label: 'This month (today → end of month)', value: 'month' },
            { label: 'This quarter (next 3 months)', value: 'quarter' },
            { label: 'Custom date range', value: 'custom' },
          ],
          admin: { description: 'Which window of dates to open.' },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'customStart',
              type: 'date',
              admin: {
                width: '50%',
                date: { pickerAppearance: 'dayOnly', displayFormat: 'dd MMM yyyy' },
                description: 'First open date.',
                condition: (_, sibling) => sibling?.rangeType === 'custom',
              },
            },
            {
              name: 'customEnd',
              type: 'date',
              admin: {
                width: '50%',
                date: { pickerAppearance: 'dayOnly', displayFormat: 'dd MMM yyyy' },
                description: 'Last open date.',
                condition: (_, sibling) => sibling?.rangeType === 'custom',
              },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'includeSaturdays',
              type: 'checkbox',
              defaultValue: true,
              admin: { width: '50%', description: 'Open Saturdays.' },
            },
            {
              name: 'includeSundays',
              type: 'checkbox',
              defaultValue: false,
              admin: { width: '50%', description: 'Open Sundays.' },
            },
          ],
        },
      ],
    },
  ],
}
