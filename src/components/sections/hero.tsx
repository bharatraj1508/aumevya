'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { ArrowRight, CalendarDays, Check, Compass, MapPin, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Eyebrow } from '@/components/site/eyebrow'
import { BackgroundSlideshow } from '@/components/ui/background-slideshow'

// The parallax collage is a desktop-only decorative backdrop and pulls in extra
// motion/transform code. Load it lazily so it stays out of the initial hero JS
// (and off the critical path) — it fades in shortly after hydration.
const ParallaxHeroImages = dynamic(
  () => import('@/components/ui/parallax-hero-images').then((m) => m.ParallaxHeroImages),
  { ssr: false },
)
import { mediaURL, mediaId } from '@/lib/media'
import { cropStyle, type CropMap } from '@/lib/crops'
import { cn } from '@/lib/utils'

type HeroProps = {
  eyebrow?: string | null
  heading: string
  subheading?: string | null
  primaryCtaLabel?: string | null
  primaryCtaHref?: string | null
  secondaryCtaLabel?: string | null
  secondaryCtaHref?: string | null
  /** The 6 hero images picked in the CMS. */
  images?: unknown[]
  /** Admin-set per-image crops ({ "<id>::desktop" | "<id>::mobile": {x,y} }). */
  imageCrops?: CropMap
  /** Background image visibility, 0–100 (%). CMS-controlled. */
  imageOpacity?: number | null
  /** Seconds each background image shows before turning over. CMS-controlled. */
  slideInterval?: number | null
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

/** Quick links shown under the primary CTA on mobile/tablet, where the header nav is collapsed. */
const SERVICE_LINKS = [
  { href: '/courses', label: 'Courses' },
  { href: '/guidance', label: 'Guidance' },
  { href: '/shop', label: 'Shop' },
] as const

const EASE = [0.16, 1, 0.3, 1] as const

export function Hero({
  eyebrow,
  heading,
  subheading,
  primaryCtaLabel,
  primaryCtaHref,
  images = [],
  imageCrops,
  imageOpacity,
  slideInterval,
  locations = [],
  retreats = [],
}: HeroProps) {
  const router = useRouter()
  const words = heading.split(' ')
  // Keep each image's url alongside its id so we can resolve the admin's
  // per-image desktop/mobile crops. The two hero renderers (desktop collage vs
  // mobile slideshow) each take their own framing.
  const slides = images
    .map((m) => ({ url: mediaURL(m), id: mediaId(m) }))
    .filter((s): s is { url: string; id: string | null } => Boolean(s.url))
    .slice(0, 6)
  const imageUrls = slides.map((s) => s.url as string)
  const desktopSlides = slides.map((s) => ({
    url: s.url as string,
    cropStyle: cropStyle(imageCrops, 'desktop', s.id),
  }))
  const mobileSlides = slides.map((s) => ({
    url: s.url as string,
    cropStyle: cropStyle(imageCrops, 'mobile', s.id),
  }))

  // CMS-controlled appearance (percentage → 0–1, seconds → ms), with sensible fallbacks.
  const imgOpacity = (imageOpacity ?? 60) / 100
  const intervalMs = (slideInterval ?? 3) * 1000

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
    <section className="relative bg-background xl:flex xl:min-h-[92vh] xl:items-center xl:overflow-hidden xl:pt-36 xl:pb-16">
      {/* Mobile & tablet: a sticky photo panel that turns over every few seconds
          while the content sheet below scrolls up over it. */}
      <div className="sticky top-0 h-[46svh] overflow-hidden bg-muted xl:hidden">
        {imageUrls.length > 0 && (
          <BackgroundSlideshow images={mobileSlides} interval={intervalMs} style={{ opacity: imgOpacity }} />
        )}
        {/* Scrim behind the fixed header so the logo stays legible on any photo */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent"
        />
      </div>

      {/* Desktop: the parallax collage behind a soft focus wash (original design). */}
      {imageUrls.length > 0 && (
        <ParallaxHeroImages images={desktopSlides} className="hidden xl:block" variant="edge-focus" />
      )}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[9] hidden bg-[radial-gradient(ellipse_60%_55%_at_50%_45%,var(--color-background)_45%,color-mix(in_srgb,var(--color-background)_60%,transparent)_70%,transparent_100%)] xl:block"
      />

      {/* Mobile & tablet: a rounded sheet overlapping the photo. Desktop: plain overlay. */}
      <div className="relative z-10 -mt-8 rounded-t-[2rem] bg-background pb-12 shadow-[0_-16px_40px_-20px_rgba(0,0,0,0.35)] xl:mt-0 xl:w-full xl:rounded-none xl:bg-transparent xl:pb-0 xl:shadow-none">
        <div className="container-page">
          <div className="mx-auto max-w-3xl text-center">
            {eyebrow && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE }}
                className="flex -translate-y-1/2 justify-center xl:translate-y-0"
              >
                <Eyebrow highlight="retreats" className="shadow-sm xl:shadow-none">
                  {eyebrow}
                </Eyebrow>
              </motion.div>
            )}

            <div className={cn('relative xl:mt-6', eyebrow ? 'mt-1' : 'pt-10 xl:pt-0')}>
              {/* Rendered without an entrance animation on purpose: this heading is
                  the LCP element, so it must paint on first (server) render rather
                  than starting at opacity:0 and waiting for hydration. */}
              <h1 className="relative text-4xl font-extrabold leading-[1.04] text-balance text-foreground xl:[text-shadow:0_1px_0_rgba(255,255,255,0.7),0_3px_10px_rgba(0,0,0,0.14)] sm:text-6xl lg:text-7xl">
                {words.map((word, i) => (
                  <span key={i} className="inline-block pb-1 align-top">
                    {word}&nbsp;
                  </span>
                ))}
              </h1>
            </div>

            {subheading && (
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.35, ease: EASE }}
                className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground xl:mt-5"
              >
                {subheading}
              </motion.p>
            )}

            {primaryCtaLabel && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5, ease: EASE }}
                className="mt-7 flex justify-center xl:mt-8"
              >
                <Button asChild size="lg" className="w-full rounded-full sm:w-auto">
                  <Link href={primaryCtaHref || '/contact'}>
                    {primaryCtaLabel}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </motion.div>
            )}

            <motion.nav
              aria-label="Explore services"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6, ease: EASE }}
              className="mx-auto mt-3 grid max-w-md grid-cols-3 gap-2.5 xl:hidden"
            >
              {SERVICE_LINKS.map((l) => (
                <Button
                  key={l.href}
                  asChild
                  variant="outline"
                  className="rounded-full border-foreground/80 bg-background px-2"
                >
                  <Link href={l.href}>{l.label}</Link>
                </Button>
              ))}
            </motion.nav>
          </div>

          {/* Search bar (desktop only) + trust badges (all sizes) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55, ease: EASE }}
            className="mt-10 xl:mt-14"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault()
                search()
              }}
              className="group/bar relative mx-auto hidden max-w-4xl xl:block"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-r from-primary via-accent to-primary opacity-0 blur-md transition-all duration-500 group-hover/bar:-inset-2 group-hover/bar:opacity-70 group-hover/bar:blur-xl sm:rounded-full"
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
                    className="pointer-events-none absolute -inset-px rounded-xl bg-gradient-to-r from-primary via-accent to-primary opacity-0 blur-sm transition-all duration-500 group-hover:-inset-2.5 group-hover:opacity-90 group-hover:blur-lg sm:rounded-full"
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

            <ul
              className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-sm font-medium text-muted-foreground xl:mt-5"
            >
              {TRUST.map((t) => (
                <li key={t} className="inline-flex items-center gap-1.5">
                  <Check className="size-4 text-primary" />
                  {t}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
