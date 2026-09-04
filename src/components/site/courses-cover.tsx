import type { CoursesPage } from '@/payload-types'
import { Eyebrow } from '@/components/site/eyebrow'
import { MediaImage } from '@/components/site/media-image'

/**
 * Facebook / Notion-style cover: a wide cover photo with the title resting on
 * its lower-left corner over a soft gradient scrim. This is the Courses
 * section's signature element — everything below it reuses the site's language.
 */
export function CoursesCover({ page }: { page: CoursesPage }) {
  return (
    <section className="relative flex min-h-[24rem] items-end overflow-hidden pt-32 md:min-h-[32rem] md:pt-44">
      <MediaImage
        media={page.coverImage}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      {/* Legibility scrim — darkest at the bottom-left where the title sits. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent"
      />
      <div className="container-page relative z-10 pb-10 md:pb-14">
        {page.eyebrow && (
          <Eyebrow tone="light" glass>
            {page.eyebrow}
          </Eyebrow>
        )}
        <h1 className="mt-4 text-5xl font-extrabold tracking-tight text-white text-balance drop-shadow-sm md:text-7xl">
          {page.heading}
        </h1>
        {page.subheading && (
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/85">
            {page.subheading}
          </p>
        )}
      </div>
    </section>
  )
}
