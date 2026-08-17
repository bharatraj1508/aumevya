import { NextResponse, type NextRequest } from 'next/server'
import { bookingSchema } from '@/lib/schemas'
import { createInquiry } from '@/lib/inquiries'
import { rateLimit, sweepRateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  sweepRateLimit()
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
  if (!rateLimit(`booking:${ip}`).ok) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again in a minute.' },
      { status: 429 },
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const parsed = bookingSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Please check the form and try again.', issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const { company, phone, message, name, email, service, preferredDate } = parsed.data
  if (company) return NextResponse.json({ ok: true }) // honeypot tripped

  try {
    await createInquiry({
      type: 'booking',
      name,
      email,
      phone: phone || undefined,
      message: message || undefined,
      service: service || undefined,
      preferredDate: preferredDate || undefined,
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[booking] create failed:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
