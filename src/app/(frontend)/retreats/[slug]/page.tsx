import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MapPin, Moon, Star } from 'lucide-react'
import type { Retreat } from '@/payload-types'
import { getDocs } from '@/lib/payload'
import { accommodationOptions, durationLabel, hasAccommodation } from '@/lib/retreat'
import { RichText } from '@/components/RichText'
import { CtaSection } from '@/components/sections/cta-section'
import { getGlobal } from '@/lib/payload'
import { Gallery } from '@/components/retreat/gallery'
import { SectionNav, type NavItem } from '@/components/retreat/section-nav'
import { BookingCard } from '@/components/retreat/booking-card'
import { AccommodationCards, AccommodationProvider } from '@/components/retreat/accommodation'
import {
  BenefitPills,
  Itinerary,
  ReviewList,
  Section,
  Stars,
  TagList,
} from '@/components/retreat/sections'

async function getRetreat(slug: string): Promise<Retreat | null> {
  const docs = await getDocs('retreats', {
    where: { slug: { equals: slug }, published: { equals: true } },
    limit: 1,
  })
  return docs[0] ?? null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const retreat = await getRetreat(slug)
  if (!retreat) return { title: 'Retreat not found' }
  return {
    title: retreat.title,
    description: `${retreat.title} — ${retreat.location}. ${durationLabel(retreat.fromDate, retreat.toDate)}.`,
  }
}

const hasContent = (rt?: { root?: { children?: unknown[] } } | null) =>
  Boolean(rt?.root?.children?.length)

export default async function RetreatDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [retreat, cta] = await Promise.all([getRetreat(slug), getGlobal('cta')])
  if (!retreat) notFound()

  const reviews = retreat.retreatReviews ?? []
  const accommodation = hasAccommodation(retreat) ? accommodationOptions(retreat) : null
  const nav: NavItem[] = [
    { id: 'summary', label: 'Overview' },
    reviews.length > 0 && { id: 'reviews', label: 'Reviews' },
    hasContent(retreat.retreatExperience) && { id: 'experience', label: 'Experience' },
    (retreat.whatIncludes?.length || retreat.notIncluded?.length) && {
      id: 'included',
      label: "What's included",
    },
    retreat.programItinerary?.length && { id: 'program', label: 'Program' },
    hasContent(retreat.food) && { id: 'food', label: 'Food' },
    hasContent(retreat.facilitation) && { id: 'facilitator', label: 'Facilitator' },
    (hasContent(retreat.locationInformation) || retreat.availableFacilities?.length) && {
      id: 'location',
      label: 'Location',
    },
    accommodation && { id: 'accommodation', label: 'Accommodation' },
  ].filter(Boolean) as NavItem[]

  return (
    <>
      <div className="container-page pt-28 md:pt-32">
        {/* Header */}
        <p className="text-sm text-muted-foreground">
          <span className="text-primary">Retreats</span> · {retreat.location}
        </p>
        <h1 className="mt-2 max-w-3xl text-3xl font-bold tracking-tight text-balance md:text-[2.6rem] md:leading-[1.1]">
          {retreat.title}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <span className="inline-flex items-center gap-1.5 font-semibold">
            <Star className="size-4 fill-accent text-accent" />
            {retreat.ratings.toFixed(1)}
            {reviews.length > 0 && (
              <span className="font-normal text-muted-foreground">
                ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
              </span>
            )}
          </span>
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="size-4 text-primary" />
            {retreat.location}
          </span>
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <Moon className="size-4 text-primary" />
            {durationLabel(retreat.fromDate, retreat.toDate)}
          </span>
        </div>

        {/* Gallery */}
        <div className="mt-6">
          <Gallery images={retreat.images} title={retreat.title} />
        </div>
      </div>

      <SectionNav items={nav} />

      <div className="container-page pb-4 pt-8">
        <AccommodationProvider options={accommodation ?? []}>
        <div className="grid gap-10 lg:grid-cols-3 lg:gap-14">
          {/* Left — scrolling content */}
          <div className="lg:col-span-2">
            {retreat.benefits && retreat.benefits.length > 0 && (
              <div className="mb-8 border-b border-border pb-8">
                <BenefitPills items={retreat.benefits} />
              </div>
            )}

            <Section id="summary" title="Summary">
              <RichText data={retreat.summary} className="max-w-none" />
            </Section>

            {reviews.length > 0 && (
              <Section id="reviews" title="What guests are saying">
                <div className="mb-4 flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-accent/15 px-3 py-1.5 text-lg font-bold text-accent-foreground">
                    <Star className="size-5 fill-accent text-accent" />
                    {retreat.ratings.toFixed(1)}
                  </span>
                  <Stars rating={retreat.ratings} />
                  <span className="text-sm text-muted-foreground">
                    {reviews.length} verified {reviews.length === 1 ? 'review' : 'reviews'}
                  </span>
                </div>
                <ReviewList reviews={reviews} />
              </Section>
            )}

            {hasContent(retreat.retreatExperience) && (
              <Section id="experience" title="The experience">
                <RichText data={retreat.retreatExperience} className="max-w-none" />
              </Section>
            )}

            {(retreat.whatIncludes?.length || retreat.notIncluded?.length) && (
              <Section id="included" title="What's included">
                {retreat.whatIncludes && retreat.whatIncludes.length > 0 && (
                  <TagList items={retreat.whatIncludes} tone="include" />
                )}
                {retreat.notIncluded && retreat.notIncluded.length > 0 && (
                  <div className="mt-6">
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Not included
                    </h3>
                    <TagList items={retreat.notIncluded} tone="exclude" />
                  </div>
                )}
              </Section>
            )}

            {retreat.programItinerary && retreat.programItinerary.length > 0 && (
              <Section id="program" title="Program & itinerary">
                <Itinerary days={retreat.programItinerary} />
              </Section>
            )}

            {hasContent(retreat.specialities) && (
              <Section id="specialities" title="Specialities">
                <RichText data={retreat.specialities} className="max-w-none" />
              </Section>
            )}

            {hasContent(retreat.food) && (
              <Section id="food" title="Food">
                <RichText data={retreat.food} className="max-w-none" />
              </Section>
            )}

            {hasContent(retreat.facilitation) && (
              <Section id="facilitator" title="Your facilitator">
                <RichText data={retreat.facilitation} className="max-w-none" />
              </Section>
            )}

            {(hasContent(retreat.locationInformation) || retreat.availableFacilities?.length) && (
              <Section id="location" title="Location & facilities">
                {hasContent(retreat.locationInformation) && (
                  <RichText data={retreat.locationInformation} className="max-w-none" />
                )}
                {retreat.availableFacilities && retreat.availableFacilities.length > 0 && (
                  <div className="mt-6">
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Available facilities
                    </h3>
                    <TagList items={retreat.availableFacilities} tone="neutral" />
                  </div>
                )}
              </Section>
            )}

            {accommodation && (
              <Section id="accommodation" title="Accommodation">
                <p className="mb-4 text-[15px] leading-relaxed text-muted-foreground">
                  Choose how you&apos;d like to stay. Your selection updates the total price.
                </p>
                <AccommodationCards />
              </Section>
            )}
          </div>

          {/* Right — sticky booking card */}
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-28">
              <BookingCard
                id={retreat.id}
                title={retreat.title}
                price={retreat.price}
                fromDate={retreat.fromDate}
                toDate={retreat.toDate}
                ratings={retreat.ratings}
                reviewCount={reviews.length}
              />
            </div>
          </aside>
        </div>
        </AccommodationProvider>
      </div>

      <CtaSection cta={cta} />
    </>
  )
}
