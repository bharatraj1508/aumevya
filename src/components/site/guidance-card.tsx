import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Guidance } from '@/payload-types'
import { MediaImage } from '@/components/site/media-image'

/** Guidance grid card. Links through to the guidance detail page. */
export function GuidanceCard({ guidance }: { guidance: Guidance }) {
  const href = `/guidance/${guidance.slug ?? ''}`

  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card p-3 shadow-sm transition-shadow duration-300 hover:shadow-lg"
    >
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-2xl">
        <MediaImage
          media={guidance.image}
          fill
          sizes="(min-width: 1024px) 32rem, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {guidance.featured && (
          <span className="absolute left-4 top-4 rounded-full bg-foreground/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-background backdrop-blur">
            Featured
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-3 pb-2 pt-5">
        <h3 className="text-2xl font-bold leading-tight tracking-tight">{guidance.title}</h3>

        <p className="mt-3 line-clamp-2 text-[15px] leading-relaxed text-muted-foreground">
          {guidance.summary}
        </p>

        <div className="mt-auto flex items-center pt-6">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
            View guidance
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}
