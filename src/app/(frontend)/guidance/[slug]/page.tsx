import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import type { Guidance } from '@/payload-types'
import { getDocs, getGlobal } from '@/lib/payload'
import { sectionId } from '@/lib/course'
import { buildGuidanceSections, computeOpenDates, resolveSlots } from '@/lib/guidance'
import { Eyebrow } from '@/components/site/eyebrow'
import { cropStyle, type CropMap } from '@/lib/crops'
import { MediaImage } from '@/components/site/media-image'
import { Reveal } from '@/components/motion/reveal'
import { CourseJourneyRail } from '@/components/site/course-journey-rail'
import { CourseSectionBody } from '@/components/site/course-section-body'
import { GuidanceBookCard } from '@/components/site/guidance-book-card'
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
  const slots = resolveSlots(bookingConfig)
  const openDates = computeOpenDates(bookingConfig)

  return (
    <>
      {/* Hero — the cover image as a cinematic poster. */}
      <header className="relative flex min-h-[62vh] items-end overflow-hidden pt-28 md:min-h-[68vh] md:pt-32">
        <MediaImage
          media={guidance.image}
          fill
          priority
          sizes="100vw"
          cropStyle={cropStyle(guidance.imageCrops as CropMap, 'detail')}
          className="object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/20"
        />
        <div className="container-page relative z-10 pb-10 md:pb-14">
          <Link
            href="/guidance"
            className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-white/80 transition-colors hover:text-white"
          >
            <ArrowLeft className="size-4" />
            All guidance
          </Link>
          <Eyebrow tone="light" glass>
            Guidance
          </Eyebrow>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight text-white text-balance drop-shadow-sm md:text-6xl">
            {guidance.title}
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/85">{guidance.summary}</p>
        </div>
      </header>

      <div className="container-page py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[17rem_1fr] lg:gap-16">
          {/* Left — sticky book card + journey rail */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-8">
              <GuidanceBookCard
                title={guidance.title}
                slug={slug}
                slots={slots}
                openDates={openDates}
              />
              {railItems.length > 0 && <CourseJourneyRail items={railItems} />}
            </div>
          </aside>

          {/* Right — the details, section by section */}
          <main className="min-w-0">
            {/* Mobile book card */}
            <div className="mb-10 lg:hidden">
              <GuidanceBookCard
                title={guidance.title}
                slug={slug}
                slots={slots}
                openDates={openDates}
              />
            </div>

            {sections.length === 0 ? (
              <p className="text-muted-foreground">
                Full details for this guidance are coming soon. Reach out and we&apos;ll tell you
                everything.
              </p>
            ) : (
              <div className="space-y-14 md:space-y-20">
                {sections.map((section, i) => (
                  <section key={railItems[i].id} id={railItems[i].id} className="scroll-mt-28">
                    <Reveal>
                      <div className="mb-5 flex items-baseline gap-4 border-b border-border pb-4">
                        <span className="font-mono text-2xl font-bold text-primary/25 md:text-3xl">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                          {section.label}
                        </h2>
                      </div>
                      <CourseSectionBody section={section} />
                    </Reveal>
                  </section>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      <CtaSection cta={cta} />
    </>
  )
}
