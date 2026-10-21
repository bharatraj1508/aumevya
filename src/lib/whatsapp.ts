import 'server-only'
import { formatPrice } from '@/lib/retreat'
import type { GuidanceBookingEmail, InquiryEmail } from './email'

const {
  WHATSAPP_TOKEN,
  WHATSAPP_PHONE_NUMBER_ID,
  WHATSAPP_ADMIN_NUMBER,
  WHATSAPP_API_VERSION = 'v23.0',
  // Must match the language the templates were approved under ("en", "en_US", ...).
  WHATSAPP_TEMPLATE_LANG = 'en',
  // Prefixed to local numbers typed without a country code (e.g. "98765 43210").
  WHATSAPP_DEFAULT_COUNTRY_CODE = '91',
} = process.env
const configured = Boolean(WHATSAPP_TOKEN && WHATSAPP_PHONE_NUMBER_ID)

/**
 * Template bodies exactly as submitted in WhatsApp Manager. The key is the
 * template name. Each body doubles as the plain-text fallback when Meta
 * rejects the template send (still in review, renamed, wrong language...).
 */
const TEMPLATES = {
  new_lead_alert:
    'New {{1}} on the Aumevya website.\n\nName: {{2}}\nPhone: {{3}}\nEmail: {{4}}\nDetails: {{5}}\n\nPlease follow up with them soon.',
  guidance_booking_received:
    "Namaste {{1}}, thank you for booking {{2}} with Aumevya Yoga.\n\nPackage: {{3}}\nDate: {{4}}\nTime: {{5}}\n\nWe'll confirm your session shortly.",
  retreat_booking_received:
    'Namaste {{1}}, thank you for your booking request for {{2}} with Aumevya Yoga.\n\nAccommodation: {{3}}\nPreferred dates: {{4}}\n\nOur team will get back to you shortly to confirm availability and next steps.',
  inquiry_received:
    "Namaste {{1}}, thank you for reaching out to Aumevya Yoga. We've received your message and will get back to you shortly.",
} as const
type TemplateName = keyof typeof TEMPLATES

const TBC = 'To be confirmed'

/**
 * Normalises a free-text phone number to the digits-only international format
 * the Cloud API expects ("919876543210"). Returns null when it can't be a
 * valid number, so callers skip the send instead of hitting the API.
 */
export function toWhatsAppNumber(raw: string | undefined): string | null {
  if (!raw) return null
  let digits = raw.replace(/\D/g, '')
  if (raw.trim().startsWith('00')) digits = digits.slice(2)
  else if (!raw.trim().startsWith('+')) {
    digits = digits.replace(/^0+/, '')
    if (digits.length === 10) digits = WHATSAPP_DEFAULT_COUNTRY_CODE + digits
  }
  return digits.length >= 8 && digits.length <= 15 ? digits : null
}

/**
 * Template parameters can't be empty or contain newlines, tabs or 4+
 * consecutive spaces — Meta rejects the whole send. Collapse whitespace,
 * cap the length and substitute a placeholder for blanks.
 */
function toParam(value: string | undefined, fallback = TBC, maxLength = 300): string {
  const clean = (value ?? '').replace(/\s+/g, ' ').trim()
  if (!clean) return fallback
  return clean.length > maxLength ? `${clean.slice(0, maxLength - 1)}…` : clean
}

/** POSTs one message. Returns the Graph API error text on failure, null on success. */
async function postMessage(to: string, message: Record<string, unknown>): Promise<string | null> {
  try {
    const res = await fetch(
      `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to,
          ...message,
        }),
        signal: AbortSignal.timeout(10_000),
      },
    )
    if (res.ok) return null
    const detail = (await res.json().catch(() => null)) as {
      error?: { message?: string; code?: number }
    } | null
    return `HTTP ${res.status}${detail?.error ? ` — (#${detail.error.code}) ${detail.error.message}` : ''}`
  } catch (err) {
    return err instanceof Error ? err.message : String(err)
  }
}

/**
 * Sends an approved template; if Meta rejects it, falls back to the same
 * wording as free-form text. Best-effort: never throws, so a WhatsApp outage
 * can't lose a saved lead.
 *
 * The text fallback is only delivered inside the 24h customer-service window
 * (the recipient messaged the business number in the last 24h). Outside it,
 * Meta accepts the request but silently drops it.
 */
async function sendTemplate(to: string, name: TemplateName, params: string[]): Promise<boolean> {
  if (!configured) {
    console.warn(`[whatsapp] Not configured — skipped ${name}.`)
    return false
  }

  const templateError = await postMessage(to, {
    type: 'template',
    template: {
      name,
      language: { code: WHATSAPP_TEMPLATE_LANG },
      components: [{ type: 'body', parameters: params.map((text) => ({ type: 'text', text })) }],
    },
  })
  if (!templateError) return true

  console.warn(
    `[whatsapp] Template ${name} to ${to} rejected (${templateError}) — sending as text.`,
  )
  const body = TEMPLATES[name].replace(/\{\{(\d+)\}\}/g, (_, n) => params[Number(n) - 1] ?? TBC)
  const textError = await postMessage(to, { type: 'text', text: { body, preview_url: false } })
  if (!textError) return true

  console.error(`[whatsapp] ${name} to ${to} failed as template and text: ${textError}`)
  return false
}

/** Sends the admin alert and (when a usable phone was given) the customer confirmation. */
async function notify(params: {
  admin: string[]
  customerPhone?: string
  customer: { template: TemplateName; params: string[] }
}): Promise<void> {
  const admin = toWhatsAppNumber(WHATSAPP_ADMIN_NUMBER)
  const customer = toWhatsAppNumber(params.customerPhone)
  if (params.customerPhone && !customer) {
    console.warn(
      `[whatsapp] Unusable phone "${params.customerPhone}" — no ${params.customer.template} sent.`,
    )
  }

  await Promise.all([
    admin && sendTemplate(admin, 'new_lead_alert', params.admin),
    customer && sendTemplate(customer, params.customer.template, params.customer.params),
  ])
}

const firstName = (name: string) => name.trim().split(/\s+/)[0]

/** Joins the non-empty parts into a single template-safe line. */
const details = (parts: (string | undefined)[], note?: string) =>
  [parts.filter(Boolean).join(', '), note && `Note: ${note}`].filter(Boolean).join(' · ')

export async function sendInquiryWhatsApp(inquiry: InquiryEmail): Promise<void> {
  const isBooking = inquiry.type === 'booking'

  await notify({
    admin: [
      isBooking ? 'retreat booking' : 'contact message',
      toParam(inquiry.name),
      toParam(inquiry.phone, 'Not provided'),
      toParam(inquiry.email),
      toParam(
        isBooking
          ? details(
              [inquiry.service, inquiry.accommodation, inquiry.preferredDate],
              inquiry.message,
            )
          : inquiry.message,
        'No message',
        600,
      ),
    ],
    customerPhone: inquiry.phone,
    customer: isBooking
      ? {
          template: 'retreat_booking_received',
          params: [
            toParam(firstName(inquiry.name)),
            toParam(inquiry.service || 'our retreat'),
            toParam(inquiry.accommodation),
            toParam(inquiry.preferredDate),
          ],
        }
      : { template: 'inquiry_received', params: [toParam(firstName(inquiry.name))] },
  })
}

export async function sendGuidanceBookingWhatsApp(booking: GuidanceBookingEmail): Promise<void> {
  const pkg =
    booking.packageName && booking.packageDuration
      ? `${booking.packageName}, ${booking.packageDuration} min`
      : booking.packageName
  const price = booking.packagePrice != null ? formatPrice(booking.packagePrice) : undefined

  await notify({
    admin: [
      'guidance booking',
      toParam(booking.name),
      toParam(booking.phone, 'Not provided'),
      toParam(booking.email),
      toParam(
        details(
          [booking.guidance, pkg, price, booking.bookingDate, booking.slotTime],
          booking.message,
        ),
        TBC,
        600,
      ),
    ],
    customerPhone: booking.phone,
    customer: {
      template: 'guidance_booking_received',
      params: [
        toParam(firstName(booking.name)),
        toParam(booking.guidance || 'your guidance session'),
        toParam(pkg),
        toParam(booking.bookingDate),
        toParam(booking.slotTime),
      ],
    },
  })
}
