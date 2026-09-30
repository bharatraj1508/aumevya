import 'server-only'
import { getPayloadClient } from './payload'
import { sendGuidanceBookingEmail } from './email'
import { formatBookingDate } from './guidance'

export type GuidanceBookingInput = {
  name: string
  email: string
  phone?: string
  message?: string
  /** Guidance session slug, when booked from a specific session's page. */
  guidanceSlug?: string
  /** Chosen open date, `YYYY-MM-DD`. */
  bookingDate: string
  /** Chosen slot title, e.g. "Morning". */
  slotTitle: string
  /** Slot time range, e.g. "10:00 AM – 12:00 PM". */
  slotTime?: string
}

/**
 * Persist the guidance booking FIRST (so a lead is never lost), then attempt
 * the admin email as a best-effort side-effect and record whether it was
 * delivered — mirroring `createInquiry`.
 */
export async function createGuidanceBooking(
  input: GuidanceBookingInput,
): Promise<{ id: string | number }> {
  const payload = await getPayloadClient()

  // Resolve the guidance slug to a record id + title. Never block the booking
  // on a lookup failure.
  let guidanceId: string | undefined
  let guidanceTitle: string | undefined
  if (input.guidanceSlug) {
    try {
      const res = await payload.find({
        collection: 'guidance',
        where: { slug: { equals: input.guidanceSlug } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      const doc = res.docs[0] as { id?: string; title?: string } | undefined
      guidanceId = doc?.id
      guidanceTitle = doc?.title
    } catch (err) {
      console.error('[guidance-bookings] failed to resolve guidance:', err)
    }
  }

  const doc = await payload.create({
    collection: 'guidance-bookings',
    overrideAccess: true,
    data: {
      status: 'new',
      name: input.name,
      email: input.email,
      phone: input.phone || undefined,
      message: input.message || undefined,
      guidance: guidanceId,
      bookingDate: input.bookingDate,
      slotTitle: input.slotTitle,
      slotTime: input.slotTime || undefined,
      notified: false,
    },
  })

  const sent = await sendGuidanceBookingEmail({
    name: input.name,
    email: input.email,
    phone: input.phone,
    message: input.message,
    guidance: guidanceTitle,
    bookingDate: formatBookingDate(input.bookingDate),
    slotTitle: input.slotTitle,
    slotTime: input.slotTime,
  })
  if (sent) {
    try {
      await payload.update({
        collection: 'guidance-bookings',
        id: doc.id,
        overrideAccess: true,
        data: { notified: true },
      })
    } catch (err) {
      console.error('[guidance-bookings] failed to mark notified:', err)
    }
  }

  return { id: doc.id }
}
