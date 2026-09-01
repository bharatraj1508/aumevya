import 'server-only'
import nodemailer from 'nodemailer'

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  // Accept SMTP_PASSWORD (used in .env) or SMTP_PASS as a fallback.
  SMTP_PASSWORD,
  SMTP_PASS,
  EMAIL_FROM,
  ADMIN_NOTIFY_EMAIL,
} = process.env
const SMTP_PASSWORD_RESOLVED = SMTP_PASSWORD || SMTP_PASS
const configured = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASSWORD_RESOLVED)

let transporter: nodemailer.Transporter | null = null
function getTransport() {
  if (!transporter) {
    const port = Number(SMTP_PORT || 465)
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASSWORD_RESOLVED },
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

  const isBooking = inquiry.type === 'booking'
  const heading = isBooking ? 'New booking request' : 'New contact message'
  const subject = isBooking
    ? `New booking request${inquiry.service ? ` — ${inquiry.service}` : ''} · ${inquiry.name}`
    : `New contact message · ${inquiry.name}`

  // Human intro line so the email reads like a note, not a raw dump.
  const intro = isBooking
    ? `<strong>${esc(inquiry.name)}</strong> just requested to book${
        inquiry.service ? ` <strong>${esc(inquiry.service)}</strong>` : ' a retreat'
      }. Here are the details:`
    : `<strong>${esc(inquiry.name)}</strong> sent a new message through the website. Here's what they shared:`

  // Only include rows relevant to the inquiry type (and that have a value).
  const detailRows = (
    [
      ['Name', inquiry.name],
      ['Email', inquiry.email],
      ['Phone', inquiry.phone],
      ...(isBooking
        ? [
            ['Retreat', inquiry.service],
            ['Accommodation', inquiry.accommodation],
            ['Preferred dates', inquiry.preferredDate],
          ]
        : []),
    ] as [string, string | undefined][]
  ).filter((r): r is [string, string] => Boolean(r[1]))

  const html = renderEmail({ heading, badge: isBooking ? 'Booking' : 'Contact', intro, detailRows, message: inquiry.message, replyTo: inquiry.email })

  const textLines = [
    heading,
    '',
    ...detailRows.map(([k, v]) => `${k}: ${v}`),
    ...(inquiry.message ? ['', `Message:`, inquiry.message] : []),
  ]

  try {
    await getTransport().sendMail({
      from: fromAddress(),
      to,
      replyTo: inquiry.email,
      subject,
      text: textLines.join('\n'),
      html,
    })
    return true
  } catch (err) {
    console.error('[email] Failed to send inquiry notification:', err)
    return false
  }
}

/** Minimal HTML escaping for values interpolated into the email markup. */
function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Builds a friendly "Name <email>" from address when a display name is set. */
function fromAddress(): string {
  const address = EMAIL_FROM || SMTP_USER || ''
  const name = process.env.EMAIL_FROM_NAME
  return name ? `"${name}" <${address}>` : address
}

/**
 * Renders a responsive, table-based HTML email that survives Gmail/Outlook.
 * Brand palette: teal #0f7268 header, amber #e0a11a accent.
 */
function renderEmail({
  heading,
  badge,
  intro,
  detailRows,
  message,
  replyTo,
}: {
  heading: string
  badge: string
  intro: string
  detailRows: [string, string][]
  message?: string
  replyTo: string
}): string {
  const rowsHtml = detailRows
    .map(([label, value], i) => {
      const isEmail = label === 'Email'
      const valueHtml = isEmail
        ? `<a href="mailto:${esc(value)}" style="color:#0f7268;text-decoration:none;">${esc(value)}</a>`
        : esc(value).replace(/\n/g, '<br/>')
      const border = i === 0 ? '' : 'border-top:1px solid #eef0f2;'
      return `<tr>
        <td style="${border}padding:12px 0;width:150px;vertical-align:top;font:600 12px/1.4 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;letter-spacing:.04em;text-transform:uppercase;color:#8a9199;">${esc(label)}</td>
        <td style="${border}padding:12px 0;vertical-align:top;font:500 15px/1.5 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1f2937;">${valueHtml}</td>
      </tr>`
    })
    .join('')

  const messageBlock = message
    ? `<div style="margin-top:20px;padding:16px 18px;background:#f7f9f9;border-left:3px solid #0f7268;border-radius:8px;font:400 15px/1.6 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#374151;">
         <div style="font:600 11px/1.4 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#8a9199;margin-bottom:6px;">Message</div>
         ${esc(message).replace(/\n/g, '<br/>')}
       </div>`
    : ''

  return `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#eef1f3;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef1f3;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(16,24,40,.08);">
        <tr>
          <td style="background:#0f7268;padding:28px 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
              <td style="font:700 20px/1.2 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#ffffff;">${esc(heading)}</td>
              <td align="right"><span style="display:inline-block;padding:5px 12px;background:rgba(255,255,255,.16);border-radius:999px;font:600 11px/1 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#ffffff;">${esc(badge)}</span></td>
            </tr></table>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px 8px;">
            <p style="margin:0 0 4px;font:400 16px/1.6 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#374151;">${intro}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 32px 4px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rowsHtml}</table>
            ${messageBlock}
          </td>
        </tr>
        <tr>
          <td style="padding:24px 32px 32px;">
            <a href="mailto:${esc(replyTo)}" style="display:inline-block;padding:12px 24px;background:#e0a11a;border-radius:10px;font:600 15px/1 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1f2937;text-decoration:none;">Reply to ${esc(replyTo.split('@')[0])}</a>
          </td>
        </tr>
        <tr>
          <td style="padding:18px 32px;background:#f7f9f9;border-top:1px solid #eef0f2;font:400 12px/1.5 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#9aa1a8;">
            Sent automatically from the Aumevya website. Reply directly to respond to the guest.
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}
