'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'motion/react'
import { ArrowRight, CalendarDays, Check, Compass, MapPin, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MediaImage } from '@/components/site/media-image'
import { Eyebrow } from '@/components/site/eyebrow'
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
}

const FILTER_FIELDS = [
  { icon: MapPin, label: 'Where', placeholder: 'Anywhere' },
  { icon: Compass, label: 'What', placeholder: 'All practices' },
  { icon: CalendarDays, label: 'When', placeholder: 'Any dates' },
]

const TRUST = ['Best price, guaranteed', 'Free cancellation', 'No booking fees']

const EASE = [0.16, 1, 0.3, 1] as const

function MosaicImg({ media, className }: { media: unknown; className?: string }) {
  return (
    <div className={cn('relative overflow-hidden rounded-2xl border border-border shadow-sm', className)}>
      <MediaImage
        media={media}
        fill
        sizes="(min-width: 768px) 25vw, 50vw"
        className="object-cover"
      />
    </div>
  )
}

export function Hero({
  eyebrow,
  heading,
  subheading,
  primaryCtaLabel,
  primaryCtaHref,
  images = [],
}: HeroProps) {
  const reduce = useReducedMotion()
  const words = heading.split(' ')
  const mosaic = images.filter(Boolean).slice(0, 4)

  return (
    <section className="relative overflow-hidden bg-background pb-16 pt-32 md:pb-20 md:pt-40">
      <div className="container-page">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-12 lg:gap-16">
          {/* Left — copy */}
          <div className="text-left">
            {eyebrow && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE }}
              >
                <Eyebrow highlight="retreats">{eyebrow}</Eyebrow>
              </motion.div>
            )}

            <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] text-balance text-foreground sm:text-5xl lg:text-6xl">
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
                className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground"
              >
                {subheading}
              </motion.p>
            )}

            {primaryCtaLabel && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.5, ease: EASE }}
                className="mt-7"
              >
                <Link
                  href={primaryCtaHref || '/contact'}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline"
                >
                  {primaryCtaLabel}
                  <ArrowRight className="size-4" />
                </Link>
              </motion.div>
            )}
          </div>

          {/* Right — image mosaic */}
          {mosaic.length >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
              className="grid h-[380px] grid-cols-2 grid-rows-2 gap-3 sm:h-[440px] lg:h-[520px]"
            >
              <MosaicImg media={mosaic[0]} className="row-span-2" />
              <MosaicImg media={mosaic[1]} />
              <div className="grid grid-cols-2 gap-3">
                {mosaic.slice(2, 4).map((img, i) => (
                  <MosaicImg key={i} media={img} className="h-full" />
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Full-width search bar with whole-component hover glow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55, ease: EASE }}
          className="mt-10 md:mt-14"
        >
          <div className="group/bar relative mx-auto max-w-5xl">
            <span
              aria-hidden
              className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-r from-primary via-accent to-primary opacity-0 blur-md transition-all duration-500 group-hover/bar:-inset-2 group-hover/bar:opacity-70 group-hover/bar:blur-xl sm:rounded-full"
            />
            <div className="relative flex flex-col gap-1.5 rounded-2xl border border-border bg-card p-2 text-left shadow-[0_16px_50px_-20px_rgba(0,0,0,0.2)] transition-shadow duration-300 group-hover/bar:shadow-[0_24px_70px_-24px_rgba(0,0,0,0.28)] sm:flex-row sm:items-center sm:gap-0 sm:rounded-full sm:p-2 sm:pl-3">
              <div className="flex flex-1 flex-col sm:flex-row sm:items-center">
                {FILTER_FIELDS.map((f, i) => (
                  <div key={f.label} className="flex flex-1 items-center sm:contents">
                    {i > 0 && (
                      <span aria-hidden className="mx-1 hidden h-8 w-px bg-border sm:block" />
                    )}
                    <Link
                      href="/services"
                      className="flex flex-1 items-center gap-3 rounded-xl px-4 py-2.5 transition-colors hover:bg-muted sm:rounded-full"
                    >
                      <f.icon className="size-4 shrink-0 text-primary" />
                      <span>
                        <span className="block text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                          {f.label}
                        </span>
                        <span className="block text-sm font-medium leading-tight text-foreground">
                          {f.placeholder}
                        </span>
                      </span>
                    </Link>
                  </div>
                ))}
              </div>
              <div className="group relative mt-1.5 w-full sm:mt-0 sm:w-auto">
                <span
                  aria-hidden
                  className="pointer-events-none absolute -inset-px rounded-xl bg-gradient-to-r from-primary via-accent to-primary opacity-0 blur-sm transition-all duration-500 group-hover:-inset-2.5 group-hover:opacity-90 group-hover:blur-lg sm:rounded-full"
                />
                <Button asChild size="lg" className="relative w-full sm:w-auto sm:rounded-full">
                  <Link href="/services" aria-label="Search retreats">
                    <Search />
                    Search
                  </Link>
                </Button>
              </div>
            </div>
          </div>

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
