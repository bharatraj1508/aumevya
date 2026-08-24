'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, useReducedMotion } from 'motion/react'
import { ArrowRight, CalendarDays, Check, Compass, MapPin, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Eyebrow } from '@/components/site/eyebrow'
import { ParallaxHeroImages } from '@/components/ui/parallax-hero-images'
import { mediaURL } from '@/lib/media'
import { cn } from '@/lib/utils'

type HeroProps = {
  eyebrow?: string | null
  heading: string
  subheading?: string | null
  primaryCtaLabel?: string | null
  primaryCtaHref?: string | null
  secondaryCtaLabel?: string | null
  secondaryCtaHref?: string | null
  backgroundImage?: unknown
  heroVideo?: unknown
  images?: unknown[]
  /** Selectable destinations for the "Where" dropdown. */
  locations?: string[]
  /** Selectable retreat names for the "Retreat" dropdown. */
  retreats?: string[]
}

const FILTER_FIELDS = [
  { key: 'where', icon: MapPin, label: 'Where', placeholder: 'Anywhere', kind: 'select' },
  { key: 'what', icon: Compass, label: 'Retreat', placeholder: 'All retreats', kind: 'select' },
  { key: 'when', icon: CalendarDays, label: 'When', placeholder: 'Any date', kind: 'date' },
] as const

const TRUST = ['Best price, guaranteed', 'Free cancellation', 'No booking fees']

const EASE = [0.16, 1, 0.3, 1] as const

export function Hero({
  eyebrow,
  heading,
  subheading,
  primaryCtaLabel,
  primaryCtaHref,
  images = [],
  locations = [],
  retreats = [],
}: HeroProps) {
  const reduce = useReducedMotion()
  const router = useRouter()
  const words = heading.split(' ')
  const imageUrls = images
    .map((m) => mediaURL(m))
    .filter((u): u is string => Boolean(u))
    .slice(0, 8)

  const [query, setQuery] = useState({ where: '', what: '', when: '' })
  const optionsFor = (key: 'where' | 'what' | 'when') =>
    key === 'where' ? locations : key === 'what' ? retreats : []

  const search = () => {
    const params = new URLSearchParams()
    if (query.where.trim()) params.set('where', query.where.trim())
    if (query.what.trim()) params.set('what', query.what.trim())
    if (query.when) params.set('when', query.when)
    const qs = params.toString()
    router.push(qs ? `/retreats?${qs}` : '/retreats')
  }

  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden bg-background pt-32 pb-16 md:pt-36">
      {/* Parallax floating imagery — hidden on the smallest screens to keep copy clean */}
      {imageUrls.length > 0 && (
        <ParallaxHeroImages images={imageUrls} className="hidden sm:block" variant="edge-focus" />
      )}

      {/* Soft focus wash so the centered copy stays legible over the imagery */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[9] bg-[radial-gradient(ellipse_60%_55%_at_50%_45%,var(--color-background)_45%,color-mix(in_srgb,var(--color-background)_60%,transparent)_70%,transparent_100%)]"
      />

      <div className="relative z-10 container-page">
        <div className="mx-auto max-w-3xl text-center">
          {eyebrow && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="flex justify-center"
            >
              <Eyebrow highlight="retreats">{eyebrow}</Eyebrow>
            </motion.div>
          )}

          <h1 className="mt-6 text-4xl font-extrabold leading-[1.04] text-balance text-foreground sm:text-6xl lg:text-7xl">
            {words.map((word, i) => (
              <span key={i} className="inline-block overflow-hidden pb-1 align-top">
                <motion.span
                  className="inline-block"
                  initial={reduce ? { opacity: 0 } : { y: '110%' }}
                  animate={reduce ? { opacity: 1 } : { y: '0%' }}
                  transition={{ duration: 0.8, delay: 0.1 + i * 0.06, ease: EASE }}
                >
                  {word}&nbsp;
                </motion.span>
              </span>
            ))}
          </h1>

          {subheading && (
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35, ease: EASE }}
              className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground"
            >
              {subheading}
            </motion.p>
          )}

          {primaryCtaLabel && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5, ease: EASE }}
              className="mt-8 flex justify-center"
            >
              <Button asChild size="lg" className="rounded-full">
                <Link href={primaryCtaHref || '/contact'}>
                  {primaryCtaLabel}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </motion.div>
          )}
        </div>

        {/* Search bar with whole-component hover glow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55, ease: EASE }}
          className="mt-12 md:mt-14"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault()
              search()
            }}
            className="group/bar relative mx-auto max-w-4xl"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-r from-primary via-blue-400 to-primary opacity-0 blur-md transition-all duration-500 group-hover/bar:-inset-2 group-hover/bar:opacity-70 group-hover/bar:blur-xl sm:rounded-full"
            />
            <div className="relative flex flex-col gap-1.5 rounded-2xl border border-border bg-card/95 p-2 text-left shadow-[0_16px_50px_-20px_rgba(0,0,0,0.2)] backdrop-blur transition-shadow duration-300 group-hover/bar:shadow-[0_24px_70px_-24px_rgba(0,0,0,0.28)] sm:flex-row sm:items-center sm:gap-0 sm:rounded-full sm:p-2 sm:pl-3">
              <div className="flex flex-1 flex-col sm:flex-row sm:items-center">
                {FILTER_FIELDS.map((f, i) => (
                  <div key={f.key} className="flex flex-1 items-center sm:contents">
                    {i > 0 && (
                      <span aria-hidden className="mx-1 hidden h-8 w-px bg-border sm:block" />
                    )}
                    <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-xl px-4 py-2 transition-colors hover:bg-muted sm:rounded-full">
                      <f.icon className="size-4 shrink-0 text-primary" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                          {f.label}
                        </span>
                        {f.kind === 'select' ? (
                          <select
                            value={query[f.key]}
                            onChange={(e) => setQuery((q) => ({ ...q, [f.key]: e.target.value }))}
                            aria-label={f.label}
                            className={cn(
                              'block w-full cursor-pointer appearance-none bg-transparent text-sm font-medium leading-tight outline-none',
                              query[f.key] ? 'text-foreground' : 'text-muted-foreground',
                            )}
                          >
                            <option value="">{f.placeholder}</option>
                            {optionsFor(f.key).map((opt) => (
                              <option key={opt} value={opt} className="text-foreground">
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="date"
                            value={query[f.key]}
                            onChange={(e) => setQuery((q) => ({ ...q, [f.key]: e.target.value }))}
                            aria-label={f.label}
                            className={cn(
                              'block w-full bg-transparent text-sm font-medium leading-tight outline-none',
                              query[f.key] ? 'text-foreground' : 'text-muted-foreground',
                            )}
                          />
                        )}
                      </span>
                    </label>
                  </div>
                ))}
              </div>
              <div className="group relative mt-1.5 w-full sm:mt-0 sm:w-auto">
                <span
                  aria-hidden
                  className="pointer-events-none absolute -inset-px rounded-xl bg-gradient-to-r from-primary via-blue-400 to-primary opacity-0 blur-sm transition-all duration-500 group-hover:-inset-2.5 group-hover:opacity-90 group-hover:blur-lg sm:rounded-full"
                />
                <Button
                  type="submit"
                  size="lg"
                  className="relative w-full sm:w-auto sm:rounded-full"
                  aria-label="Search retreats"
                >
                  <Search />
                  Search
                </Button>
              </div>
            </div>
          </form>

          <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-sm font-medium text-muted-foreground">
            {TRUST.map((t) => (
              <li key={t} className="inline-flex items-center gap-1.5">
                <Check className="size-4 text-primary" />
                {t}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  )
}
