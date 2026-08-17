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
})

export type ContactInput = z.infer<typeof contactSchema>
export type BookingInput = z.infer<typeof bookingSchema>
