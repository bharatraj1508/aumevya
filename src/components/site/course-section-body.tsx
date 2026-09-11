import type { CourseSection } from '@/lib/course'
import { formatPrice } from '@/lib/retreat'
import { cn } from '@/lib/utils'
import { MediaImage } from '@/components/site/media-image'
import { RichText } from '@/components/RichText'

/** Renders the body of a single course section according to its kind. Purely
 * presentational and server-rendered — the page owns the numbered heading. */
export function CourseSectionBody({ section }: { section: CourseSection }) {
  if (section.kind === 'content') {
    return (
      <RichText
        data={section.content}
        className="max-w-none text-[15px] leading-relaxed text-muted-foreground md:text-base"
      />
    )
  }

  if (section.kind === 'itinerary') {
    return (
      <div>
        {section.intro && (
          <p className="mb-6 text-[15px] leading-relaxed text-muted-foreground md:text-base">
            {section.intro}
          </p>
        )}
        <ol className="space-y-6 border-l-2 border-dashed border-border pl-7">
          {section.items.map((item, i) => (
            <li key={item.id ?? i} className="relative">
              <span className="absolute -left-[2.35rem] top-0 flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground ring-4 ring-background">
                {i + 1}
              </span>
              <h3 className="font-semibold text-foreground">{item.heading}</h3>
              <p className="mt-1 whitespace-pre-line text-[15px] leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    )
  }

  if (section.kind === 'gallery') {
    return (
      <div>
        {section.intro && (
          <p className="mb-6 text-[15px] leading-relaxed text-muted-foreground md:text-base">
            {section.intro}
          </p>
        )}
        <div className="grid gap-5 sm:grid-cols-2">
          {section.items.map((item, i) => (
            <figure
              key={item.id ?? i}
              className="overflow-hidden rounded-2xl border border-border bg-card"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <MediaImage
                  media={item.image}
                  fill
                  sizes="(max-width: 640px) 100vw, 400px"
                  className="object-cover"
                />
              </div>
              <figcaption className="flex items-center justify-between gap-3 px-5 py-4">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">{item.name}</p>
                  {item.description && (
                    <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  )}
                </div>
                {typeof item.price === 'number' && item.price > 0 && (
                  <span className="inline-flex shrink-0 items-center rounded-lg bg-accent/15 px-2.5 py-1 text-sm font-semibold text-accent-foreground">
                    {formatPrice(item.price)}
                  </span>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    )
  }

  // Accommodation — each option is priced at the course base price, plus an
  // optional add-on shown as a "+₹…" note.
  return (
    <div>
      {section.intro && (
        <p className="mb-6 text-[15px] leading-relaxed text-muted-foreground md:text-base">
          {section.intro}
        </p>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        {section.items.map((item, i) => (
          <figure
            key={item.id ?? i}
            className={cn(
              'overflow-hidden rounded-2xl border bg-card',
              item.addOn > 0 ? 'border-border' : 'border-primary/30 ring-1 ring-primary/15',
            )}
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
              <MediaImage
                media={item.image}
                fill
                sizes="(max-width: 640px) 100vw, 400px"
                className="object-cover"
              />
              {item.addOn === 0 && (
                <span className="absolute left-3 top-3 rounded-full bg-primary/90 px-2.5 py-1 text-xs font-semibold text-primary-foreground backdrop-blur">
                  Included in base price
                </span>
              )}
            </div>
            <figcaption className="flex items-center justify-between gap-3 px-5 py-4">
              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground">{item.name}</p>
                {item.description && (
                  <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                )}
              </div>
              <span className="shrink-0 text-right leading-tight">
                <span className="block font-bold text-foreground">
                  {item.total > 0 ? formatPrice(item.total) : 'Free'}
                </span>
                {item.addOn > 0 && (
                  <span className="text-xs text-muted-foreground">+{formatPrice(item.addOn)} add-on</span>
                )}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  )
}
