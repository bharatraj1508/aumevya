import type { GlobalConfig } from 'payload'

/**
 * Shared booking configuration for guidance sessions: the single rule that
 * decides which calendar dates are open to users. Time slots now live
 * per-guidance (grouped into morning/afternoon/evening) on the Guidance
 * collection; this global only governs the open-date window.
 */
export const GuidanceBooking: GlobalConfig = {
  slug: 'guidance-booking-config',
  label: 'Guidance Booking',
  access: {
    read: () => true,
  },
  fields: [
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
