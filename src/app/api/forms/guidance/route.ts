import { NextResponse, type NextRequest } from 'next/server'
import { guidanceBookingSchema } from '@/lib/schemas'
import { createGuidanceBooking } from '@/lib/guidance-bookings'
import { getGlobal } from '@/lib/payload'
import { computeOpenDates, resolveSlots } from '@/lib/guidance'
import { rateLimit, sweepRateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  sweepRateLimit()
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
  if (!rateLimit(`guidance:${ip}`).ok) {
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

  const parsed = guidanceBookingSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Please check the form and try again.', issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const { company, name, email, phone, message, guidance, bookingDate, slot } = parsed.data
  if (company) return NextResponse.json({ ok: true }) // honeypot tripped

  // Validate the chosen slot and date against the live booking config so a
  // tampered request can't book a closed date or an unknown slot.
  const config = await getGlobal('guidance-booking-config')
  const matchedSlot = resolveSlots(config).find((s) => s.title === slot)
  if (!matchedSlot) {
    return NextResponse.json(
      { error: 'That time slot is no longer available. Please pick another.' },
      { status: 400 },
    )
  }
  const isOpen = computeOpenDates(config).some((d) => d.value === bookingDate)
  if (!isOpen) {
    return NextResponse.json(
      { error: 'That date is no longer available. Please pick another.' },
      { status: 400 },
    )
  }

  try {
    await createGuidanceBooking({
      name,
      email,
      phone: phone || undefined,
      message: message || undefined,
      guidanceSlug: guidance || undefined,
      bookingDate,
      slotTitle: matchedSlot.title,
      slotTime: matchedSlot.timeLabel,
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[guidance] create failed:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
