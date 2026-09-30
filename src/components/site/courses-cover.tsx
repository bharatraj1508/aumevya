import type { CoursesPage } from '@/payload-types'
import { SectionCover } from '@/components/site/section-cover'

/** Courses list-page cover — a thin wrapper over the shared {@link SectionCover}. */
export function CoursesCover({ page }: { page: CoursesPage }) {
  return <SectionCover page={page} />
}
