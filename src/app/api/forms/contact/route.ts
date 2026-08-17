import { NextResponse, type NextRequest } from 'next/server'
import { contactSchema } from '@/lib/schemas'
import { createInquiry } from '@/lib/inquiries'
import { rateLimit, sweepRateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  sweepRateLimit()
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
  if (!rateLimit(`contact:${ip}`).ok) {
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

  const parsed = contactSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Please check the form and try again.', issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const { company, phone, message, name, email } = parsed.data
  if (company) return NextResponse.json({ ok: true }) // honeypot tripped — pretend success

  try {
    await createInquiry({ type: 'contact', name, email, phone: phone || undefined, message })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[contact] create failed:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
