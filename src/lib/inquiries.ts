import 'server-only'
import { getPayloadClient } from './payload'
import { sendInquiryEmail, type InquiryEmail } from './email'

/**
 * Persist the inquiry FIRST (so a lead is never lost), then attempt the admin
 * email as a best-effort side-effect and record whether it was delivered.
 */
export async function createInquiry(input: InquiryEmail): Promise<{ id: string | number }> {
  const payload = await getPayloadClient()

  const doc = await payload.create({
    collection: 'inquiries',
    overrideAccess: true,
    data: {
      type: input.type,
      status: 'new',
      name: input.name,
      email: input.email,
      phone: input.phone || undefined,
      message: input.message || undefined,
      service: input.service || undefined,
      preferredDate: input.preferredDate || undefined,
      accommodation: input.accommodation || undefined,
      notified: false,
    },
  })

  // The stored `service` is a retreat ID (relationship). Resolve it to the
  // retreat's title so the admin email reads naturally instead of showing a
  // raw Mongo id.
  let serviceTitle = input.service
  if (input.type === 'booking' && input.service) {
    try {
      const retreat = await payload.findByID({
        collection: 'retreats',
        id: input.service,
        depth: 0,
        overrideAccess: true,
      })
      serviceTitle = (retreat as { title?: string })?.title || input.service
    } catch (err) {
      console.error('[inquiries] failed to resolve retreat title:', err)
    }
  }

  const sent = await sendInquiryEmail({ ...input, service: serviceTitle })
  if (sent) {
    try {
      await payload.update({
        collection: 'inquiries',
        id: doc.id,
        overrideAccess: true,
        data: { notified: true },
      })
    } catch (err) {
      console.error('[inquiries] failed to mark notified:', err)
    }
  }

  return { id: doc.id }
}
