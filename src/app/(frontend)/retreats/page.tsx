import type { Metadata } from 'next'
import Link from 'next/link'
import { CalendarDays, MapPin, Search, X } from 'lucide-react'
import { getDocs, getGlobal } from '@/lib/payload'
import { PageHeader } from '@/components/site/page-header'
import { RetreatCard } from '@/components/site/retreat-card'
import { StaggerGroup, StaggerItem } from '@/components/motion/reveal'
import { CtaSection } from '@/components/sections/cta-section'

export const metadata: Metadata = { title: 'Retreats' }

type SearchParams = { where?: string; what?: string; when?: string }

const clean = (v?: string) => (typeof v === 'string' ? v.trim() : '')

export default async function RetreatsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const where = clean(sp.where)
  const what = clean(sp.what)
  const when = clean(sp.when)
  const hasFilters = Boolean(where || what || when)

  // Build the Payload query from the three search parameters.
  const query: Record<string, unknown> = { published: { equals: true } }
  if (where) query.location = { like: where }
  if (what) query.title = { like: what }
  if (when) query.toDate = { greater_than_equal: when } // still running on/after the chosen date

  const [retreats, cta] = await Promise.all([
    getDocs('retreats', { where: query, sort: 'order' }),
    getGlobal('cta'),
  ])

  const chips = [
    where && { icon: MapPin, label: where },
    what && { icon: Search, label: what },
    when &&
      { icon: CalendarDays, label: new Date(when).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) },
  ].filter(Boolean) as { icon: typeof MapPin; label: string }[]

  return (
    <>
      <PageHeader
        eyebrow="Handpicked retreats"
        title="Our Retreats"
        description="Curated, small-group experiences across every style and level — guided by certified teachers."
      />

      <section className="py-16 md:py-24">
        <div className="container-page">
          {hasFilters && (
            <div className="mb-10 flex flex-wrap items-center gap-3 border-b border-border pb-6">
              <span className="text-sm font-semibold">
                {retreats.length} {retreats.length === 1 ? 'retreat' : 'retreats'} found
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {chips.map((c, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-sm font-medium text-foreground"
                  >
                    <c.icon className="size-3.5 text-primary" />
                    {c.label}
                  </span>
                ))}
              </div>
              <Link
                href="/retreats"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                <X className="size-3.5" />
                Clear
              </Link>
            </div>
          )}

          {retreats.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-lg font-semibold">No retreats match your search</p>
              <p className="mt-2 text-muted-foreground">
                Try a different destination, keyword, or date.
              </p>
              {hasFilters && (
                <Link
                  href="/retreats"
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline"
                >
                  View all retreats
                </Link>
              )}
            </div>
          ) : (
            <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {retreats.map((r) => (
                <StaggerItem key={r.id} className="h-full">
                  <RetreatCard retreat={r} />
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
