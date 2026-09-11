import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Star } from 'lucide-react'
import type { Course } from '@/payload-types'
import { getDocs, getGlobal } from '@/lib/payload'
import { buildCourseSections, priceLabel, sectionId } from '@/lib/course'
import { Eyebrow } from '@/components/site/eyebrow'
import { MediaImage } from '@/components/site/media-image'
import { Reveal } from '@/components/motion/reveal'
import { CourseEnrollCard } from '@/components/site/course-enroll-card'
import { CourseJourneyRail } from '@/components/site/course-journey-rail'
import { CourseSectionBody } from '@/components/site/course-section-body'
import {
  CourseAccommodationCards,
  CourseAccommodationProvider,
  type CourseAccommodationOption,
} from '@/components/site/course-accommodation'
import { CtaSection } from '@/components/sections/cta-section'

async function getCourse(slug: string): Promise<Course | null> {
  const docs = await getDocs('courses', {
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
  const course = await getCourse(slug)
  if (!course) return { title: 'Course not found' }
  return { title: course.name, description: course.summary }
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [course, cta] = await Promise.all([getCourse(slug), getGlobal('cta')])
  if (!course) notFound()

  const sections = buildCourseSections(course)
  const railItems = sections.map((s, i) => ({ id: sectionId(i, s.label), label: s.label }))

  // The first accommodation section drives the enroll price; give its options
  // stable ids so the cards and the enroll card agree on the selection.
  const accIndex = sections.findIndex((s) => s.kind === 'accommodation')
  const accSection = accIndex >= 0 ? sections[accIndex] : null
  const accOptions: CourseAccommodationOption[] =
    accSection?.kind === 'accommodation'
      ? accSection.items.map((it, i) => ({
          id: it.id ?? `opt-${i}`,
          name: it.name,
          image: it.image,
          description: it.description,
          total: it.total,
          addOn: it.addOn,
        }))
      : []

  return (
    <>
      {/* Hero — the cover image as a cinematic poster. */}
      <header className="relative flex min-h-[62vh] items-end overflow-hidden pt-28 md:min-h-[68vh] md:pt-32">
        <MediaImage media={course.image} fill priority sizes="100vw" className="object-cover" />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/20"
        />
        <div className="container-page relative z-10 pb-10 md:pb-14">
          <Link
            href="/courses"
            className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-white/80 transition-colors hover:text-white"
          >
            <ArrowLeft className="size-4" />
            All courses
          </Link>
          <Eyebrow tone="light" glass>
            Course
          </Eyebrow>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight text-white text-balance drop-shadow-sm md:text-6xl">
            {course.name}
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/85">{course.summary}</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/90">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 font-semibold backdrop-blur">
              <Star className="size-4 fill-accent text-accent" />
              {course.ratings.toFixed(1)}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 font-semibold backdrop-blur">
              {course.price <= 0 ? 'Free' : `from ${priceLabel(course.price)}`}
            </span>
            {railItems.length > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 font-semibold backdrop-blur">
                {railItems.length} {railItems.length === 1 ? 'section' : 'sections'}
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="container-page py-12 md:py-16">
        <CourseAccommodationProvider basePrice={course.price} options={accOptions}>
          <div className="grid gap-10 lg:grid-cols-[17rem_1fr] lg:gap-16">
            {/* Left — sticky enroll + journey rail */}
            <aside className="hidden lg:block">
              <div className="sticky top-28 space-y-8">
                <CourseEnrollCard
                  price={course.price}
                  ratings={course.ratings}
                  bookNowLink={course.bookNowLink}
                  featured={course.featured}
                />
                <CourseJourneyRail items={railItems} />
              </div>
            </aside>

            {/* Right — the syllabus, section by section */}
            <main className="min-w-0">
              {/* Mobile enroll card */}
              <div className="mb-10 lg:hidden">
                <CourseEnrollCard
                  price={course.price}
                  ratings={course.ratings}
                  bookNowLink={course.bookNowLink}
                  featured={course.featured}
                />
              </div>

              {sections.length === 0 ? (
                <p className="text-muted-foreground">
                  Full details for this course are coming soon. Reach out and we&apos;ll tell you everything.
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
                        {/* The first accommodation section is selectable and drives
                            the price; anything else renders statically. */}
                        {section.kind === 'accommodation' && i === accIndex ? (
                          <CourseAccommodationCards intro={section.intro} />
                        ) : (
                          <CourseSectionBody section={section} />
                        )}
                      </Reveal>
                    </section>
                  ))}
                </div>
              )}
            </main>
          </div>
        </CourseAccommodationProvider>
      </div>

      <CtaSection cta={cta} />
    </>
  )
}
