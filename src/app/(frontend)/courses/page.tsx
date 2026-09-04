import type { Metadata } from 'next'
import { getDocs, getGlobal } from '@/lib/payload'
import { CoursesCover } from '@/components/site/courses-cover'
import { CourseCard } from '@/components/site/course-card'
import { StaggerGroup, StaggerItem } from '@/components/motion/reveal'
import { CtaSection } from '@/components/sections/cta-section'

export const metadata: Metadata = { title: 'Courses' }

export default async function CoursesPage() {
  const [courses, page, cta] = await Promise.all([
    getDocs('courses', { where: { published: { equals: true } }, sort: 'order' }),
    getGlobal('courses-page'),
    getGlobal('cta'),
  ])

  return (
    <>
      <CoursesCover page={page} />

      <section className="py-16 md:py-24">
        <div className="container-page">
          {courses.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-lg font-semibold">No courses yet</p>
              <p className="mt-2 text-muted-foreground">
                New learning journeys are on the way — check back soon.
              </p>
            </div>
          ) : (
            <StaggerGroup className="mx-auto grid max-w-5xl items-start gap-6 sm:grid-cols-2">
              {courses.map((course) => (
                <StaggerItem key={course.id}>
                  <CourseCard course={course} />
                </StaggerItem>
              ))}
            </StaggerGroup>
          )}
        </div>
      </section>

      <CtaSection cta={cta} />
    </>
  )
}
