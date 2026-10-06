import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import type { Guidance } from '@/payload-types'
import { getDocs, getGlobal } from '@/lib/payload'
import { sectionId } from '@/lib/course'
import {
  buildGuidanceSections,
  buildSessionPackages,
  computeOpenDates,
  resolveGuidanceSlots,
} from '@/lib/guidance'
import { Eyebrow } from '@/components/site/eyebrow'
import { cropStyle, type CropMap } from '@/lib/crops'
import { MediaImage } from '@/components/site/media-image'
import { Reveal } from '@/components/motion/reveal'
import { CourseJourneyRail } from '@/components/site/course-journey-rail'
import { CourseSectionBody } from '@/components/site/course-section-body'
import { GuidanceDetailImage } from '@/components/site/guidance-detail-image'
import { SessionBooking } from '@/components/site/session-booking'
import { CtaSection } from '@/components/sections/cta-section'

async function getGuidance(slug: string): Promise<Guidance | null> {
  const docs = await getDocs('guidance', {
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
  const guidance = await getGuidance(slug)
  if (!guidance) return { title: 'Guidance not found' }
  return { title: guidance.title, description: guidance.summary }
}

export default async function GuidanceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [guidance, bookingConfig, cta] = await Promise.all([
    getGuidance(slug),
    getGlobal('guidance-booking-config'),
    getGlobal('cta'),
  ])
  if (!guidance) notFound()

  const sections = buildGuidanceSections(guidance)
  const railItems = sections.map((s, i) => ({ id: sectionId(i, s.label), label: s.label }))
  const packages = buildSessionPackages(guidance)
  const slotCategories = resolveGuidanceSlots(guidance)
  const openDates = computeOpenDates(bookingConfig)

  return (
    <>
      {/* Slim header — title above the fold; the image lives in the column below. */}
      <header className="pt-28 pb-8 md:pt-32 md:pb-10">
        <div className="container-page">
          <Link
            href="/guidance"
            className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            All guidance
          </Link>
          <Eyebrow>Guidance</Eyebrow>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight text-balance md:text-6xl">
            {guidance.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {guidance.summary}
          </p>
        </div>
      </header>

      {/* Two-column: large image left, "Choose Your Session" + inline booking right. */}
      <div className="container-page pb-12 md:pb-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_27rem] lg:gap-14 xl:grid-cols-[1fr_29rem]">
          {/* Left — sticky image + journey rail (desktop) */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-8">
              <GuidanceDetailImage
                media={guidance.image}
                cropMap={guidance.imageCrops as CropMap}
                title={guidance.title}
              />
              {railItems.length > 0 && <CourseJourneyRail items={railItems} />}
            </div>
          </aside>

          {/* Right — session packages + inline booking */}
          <div className="min-w-0">
            {/* Mobile image above the booking panel */}
            <div className="mb-8 lg:hidden">
              <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-muted">
                <MediaImage
                  media={guidance.image}
                  fill
                  priority
                  sizes="100vw"
                  alt={guidance.title}
                  cropStyle={cropStyle(guidance.imageCrops as CropMap, 'detail')}
                  className="object-cover"
                />
              </div>
            </div>

            <SessionBooking
              guidanceSlug={slug}
              packages={packages}
              slotCategories={slotCategories}
              openDates={openDates}
            />
          </div>
        </div>
      </div>

      {/* Details, section by section */}
      {sections.length > 0 && (
        <div className="container-page pb-12 md:pb-20">
          <div className="space-y-14 md:space-y-20">
            {sections.map((section, i) => (
              <section key={railItems[i].id} id={railItems[i].id} className="scroll-mt-28">
                <Reveal>
                  <div className="mb-5 flex items-baseline gap-4 border-b border-border pb-4">
                    <span className="font-mono text-2xl font-bold text-primary/25 md:text-3xl">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{section.label}</h2>
                  </div>
                  <CourseSectionBody section={section} />
                </Reveal>
              </section>
            ))}
          </div>
        </div>
      )}

      <CtaSection cta={cta} />
    </>
  )
}
