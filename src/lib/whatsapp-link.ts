/** Used when the Contact Information global has no WhatsApp number. */
export const DEFAULT_WHATSAPP_NUMBER = '919592906466'

export const BOOKING_GREETING = 'Namaste, please book my seat & send payment details.'

/**
 * Digits-only international number for wa.me ("+91 95929 06466" → "919592906466").
 * `defaultCountryCode` is prefixed to bare 10-digit local numbers. Returns null
 * when it can't be a valid number.
 */
export function toWaNumber(raw?: string | null, defaultCountryCode = '91'): string | null {
  if (!raw) return null
  let digits = raw.replace(/\D/g, '')
  if (raw.trim().startsWith('00')) digits = digits.slice(2)
  else if (!raw.trim().startsWith('+')) {
    digits = digits.replace(/^0+/, '')
    if (digits.length === 10) digits = defaultCountryCode + digits
  }
  return digits.length >= 8 && digits.length <= 15 ? digits : null
}

/** A click-to-chat link that opens WhatsApp with `text` prefilled. */
export function whatsAppLink(number: string, text: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`
}

/** Greeting followed by one "Label: value" line per filled-in detail. */
export function bookingMessage(
  details: [label: string, value: string | null | undefined][],
  greeting = BOOKING_GREETING,
): string {
  const lines = details
    .map(([label, value]) => [label, value?.trim()] as const)
    .filter(([, value]) => value)
    .map(([label, value]) => `${label}: ${value}`)
  return lines.length ? `${greeting}\n\n${lines.join('\n')}` : greeting
}
