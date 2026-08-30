import 'server-only'
import nodemailer from 'nodemailer'

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM, ADMIN_NOTIFY_EMAIL } = process.env
const configured = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS)

let transporter: nodemailer.Transporter | null = null
function getTransport() {
  if (!transporter) {
    const port = Number(SMTP_PORT || 465)
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })
  }
  return transporter
}

export type InquiryEmail = {
  type: 'booking' | 'contact'
  name: string
  email: string
  phone?: string
  message?: string
  service?: string
  preferredDate?: string
  accommodation?: string
}

/**
 * Sends the admin notification. Best-effort: returns false (never throws) when
 * SMTP is unconfigured or delivery fails, so the caller can record `notified`
 * without losing the saved inquiry.
 */
export async function sendInquiryEmail(inquiry: InquiryEmail): Promise<boolean> {
  const to = ADMIN_NOTIFY_EMAIL || SMTP_USER
  if (!configured || !to) {
    console.warn(
      `[email] SMTP not configured — inquiry from ${inquiry.email} saved but not emailed.`,
    )
    return false
  }

  const heading = inquiry.type === 'booking' ? 'New Booking Inquiry' : 'New Contact Message'
  const rows: [string, string | undefined][] = [
    ['Name', inquiry.name],
    ['Email', inquiry.email],
    ['Phone', inquiry.phone],
    ['Interested in', inquiry.service],
    ['Accommodation', inquiry.accommodation],
    ['Preferred date', inquiry.preferredDate],
    ['Message', inquiry.message],
  ]
  const lines = rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`)
  const html = `<h2>${heading}</h2>${rows
    .filter(([, v]) => v)
    .map(([k, v]) => `<p><strong>${k}:</strong> ${String(v).replace(/\n/g, '<br/>')}</p>`)
    .join('')}`

  try {
    await getTransport().sendMail({
      from: EMAIL_FROM || SMTP_USER,
      to,
      replyTo: inquiry.email,
      subject: `${heading} — ${inquiry.name}`,
      text: `${heading}\n\n${lines.join('\n')}`,
      html,
    })
    return true
  } catch (err) {
    console.error('[email] Failed to send inquiry notification:', err)
    return false
  }
}
