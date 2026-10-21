import 'server-only'
import { getPayloadClient } from './payload'
import { sendInquiryEmail, type InquiryEmail } from './email'
import { sendInquiryWhatsApp } from './whatsapp'

/**
 * Persist the inquiry FIRST (so a lead is never lost), then attempt the admin
 * email as a best-effort side-effect and record whether it was delivered.
 * Booking callers validate the retreat and pass its title as `serviceTitle`.
 */
export async function createInquiry(
  input: InquiryEmail & { serviceTitle?: string },
): Promise<{ id: string | number }> {
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

  // `service` is stored as the retreat id; notifications show its title.
  const notification = { ...input, service: input.serviceTitle }
  const [sent] = await Promise.all([
    sendInquiryEmail(notification),
    sendInquiryWhatsApp(notification),
  ])
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
