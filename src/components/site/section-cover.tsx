import { Eyebrow } from '@/components/site/eyebrow'
import { cropStyle, type CropMap } from '@/lib/crops'
import { MediaImage } from '@/components/site/media-image'

/** The fields every section cover exposes. */
export type SectionCoverData = {
  coverImage?: unknown
  coverImageCrop?: unknown
  eyebrow?: string | null
  heading: string
  subheading?: string | null
}

/**
 * Facebook / Notion-style section cover: a wide cover photo with the title
 * resting on its lower-left corner over a soft gradient scrim. Shared by the
 * Courses and Guidance list pages so the two sections read as a family and
 * never visually diverge.
 */
export function SectionCover({ page }: { page: SectionCoverData }) {
  return (
    <section className="relative flex min-h-[24rem] items-end overflow-hidden pt-32 md:min-h-[32rem] md:pt-44">
      <MediaImage
        media={page.coverImage}
        fill
        priority
        sizes="100vw"
        cropStyle={cropStyle(page.coverImageCrop as CropMap, 'cover')}
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
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/85">{page.subheading}</p>
        )}
      </div>
    </section>
  )
}
