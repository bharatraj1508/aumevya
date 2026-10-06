import { NextResponse, type NextRequest } from 'next/server'
import { guidanceBookingSchema } from '@/lib/schemas'
import { createGuidanceBooking } from '@/lib/guidance-bookings'
import { getDocs, getGlobal } from '@/lib/payload'
import { buildSessionPackages, computeOpenDates, formatTime, slotTimesFor } from '@/lib/guidance'
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

  const { company, name, email, phone, message, guidance, bookingDate, packageId, slotCategory, slotTime } =
    parsed.data
  if (company) return NextResponse.json({ ok: true }) // honeypot tripped

  // Load the specific guidance so package + slot can be validated against it —
  // a tampered request can't book an unknown package, time, or closed date.
  const docs = await getDocs('guidance', {
    where: { slug: { equals: guidance }, published: { equals: true } },
    limit: 1,
  })
  const guidanceDoc = docs[0]
  if (!guidanceDoc) {
    return NextResponse.json({ error: 'Guidance session not found.' }, { status: 400 })
  }

  const matchedPackage = buildSessionPackages(guidanceDoc).find((p) => p.id === packageId)
  if (!matchedPackage) {
    return NextResponse.json(
      { error: 'That session package is no longer available. Please pick another.' },
      { status: 400 },
    )
  }

  if (!slotTimesFor(guidanceDoc, slotCategory).includes(slotTime)) {
    return NextResponse.json(
      { error: 'That time slot is no longer available. Please pick another.' },
      { status: 400 },
    )
  }

  const config = await getGlobal('guidance-booking-config')
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
      guidanceSlug: guidance,
      bookingDate,
      packageName: matchedPackage.name,
      packageDuration: matchedPackage.durationMinutes,
      packagePrice: matchedPackage.price,
      packageOriginalPrice: matchedPackage.originalPrice ?? undefined,
      slotCategory,
      slotTime,
      slotTimeFormatted: formatTime(slotTime),
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[guidance] create failed:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
