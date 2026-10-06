import { z } from 'zod'

// Shared fields for both public forms.
const base = {
  name: z.string().trim().min(2, 'Please enter your name').max(100),
  email: z.email({ message: 'Please enter a valid email' }).trim(),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  message: z.string().trim().max(2000).optional().or(z.literal('')),
  // Honeypot — legit users never see this field. Any value is treated as a bot
  // in the route handler (silent success), so it must pass schema validation.
  company: z.string().optional(),
}

export const contactSchema = z.object({
  ...base,
  message: z.string().trim().min(5, 'Please tell us a little more').max(2000),
})

export const bookingSchema = z.object({
  ...base,
  service: z.string().trim().max(100).optional().or(z.literal('')),
  preferredDate: z.string().trim().max(100).optional().or(z.literal('')),
  // Chosen accommodation summary, e.g. "Private — ₹2,53,145" (retreat pages only).
  accommodation: z.string().trim().max(120).optional().or(z.literal('')),
})

export const guidanceBookingSchema = z.object({
  ...base,
  // The guidance session being booked (its slug). Required — the server loads
  // it to validate the chosen package and slot against that guidance.
  guidance: z.string().trim().min(1, 'Missing guidance session').max(120),
  // Chosen package's stable id — server re-validates it belongs to the guidance.
  // Matching by id (not name) avoids ambiguity if two packages share a name.
  packageId: z.string().trim().min(1, 'Please choose a session package').max(120),
  // Chosen open date, `YYYY-MM-DD`.
  bookingDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Please pick a date'),
  // Chosen slot category and its discrete start time ("HH:MM", 24h).
  slotCategory: z.enum(['morning', 'afternoon', 'evening']),
  slotTime: z
    .string()
    .trim()
    .regex(/^\d{2}:\d{2}$/, 'Please pick a time'),
})

// Just the contact fields — the inline booking stepper validates these at its
// "Your details" step; package/date/slot live in the island's own state and are
// assembled into the full guidanceBookingSchema payload at submit time.
export const guidanceDetailsSchema = z.object({ ...base })

export type ContactInput = z.infer<typeof contactSchema>
export type BookingInput = z.infer<typeof bookingSchema>
export type GuidanceDetailsInput = z.infer<typeof guidanceDetailsSchema>
export type GuidanceBookingInput = z.infer<typeof guidanceBookingSchema>
