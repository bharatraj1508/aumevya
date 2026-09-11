import Link from 'next/link'
import { ArrowRight, Star } from 'lucide-react'
import type { Course } from '@/payload-types'
import { priceLabel } from '@/lib/course'
import { MediaImage } from '@/components/site/media-image'

/** Course grid card. Links through to the course's own detail page. */
export function CourseCard({ course }: { course: Course }) {
  const href = `/courses/${course.slug ?? ''}`

  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card p-3 shadow-sm transition-shadow duration-300 hover:shadow-lg"
    >
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-2xl">
        <MediaImage
          media={course.image}
          fill
          sizes="(min-width: 1024px) 32rem, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {course.featured && (
          <span className="absolute left-4 top-4 rounded-full bg-foreground/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-background backdrop-blur">
            Featured
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-3 pb-2 pt-5">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-2xl font-bold leading-tight tracking-tight">{course.name}</h3>
          <span className="mt-1 inline-flex shrink-0 items-center gap-1.5">
            <Star className="size-[18px] fill-primary text-primary" />
            <span className="text-base font-bold text-foreground">{course.ratings.toFixed(1)}</span>
          </span>
        </div>

        <p className="mt-3 line-clamp-2 text-[15px] leading-relaxed text-muted-foreground">
          {course.summary}
        </p>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-6">
          <span className="leading-tight">
            <span className="block text-[11px] uppercase tracking-wide text-muted-foreground">
              from
            </span>
            <span className="text-xl font-bold text-foreground">{priceLabel(course.price)}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
            View course
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}
