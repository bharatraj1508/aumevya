import { getDocs, getGlobal } from '@/lib/payload'
import { Hero } from '@/components/sections/hero'
import { ValueProps } from '@/components/sections/value-props'
import { AboutPreview } from '@/components/sections/about-preview'
import { RetreatsPreview } from '@/components/sections/retreats-preview'
import { GalleryShowcase } from '@/components/sections/gallery-showcase'
import { TeamSection } from '@/components/sections/team-section'
import { TestimonialsSection } from '@/components/sections/testimonials-section'
import { CtaSection } from '@/components/sections/cta-section'

export default async function HomePage() {
  const [hero, about, cta, featured, allRetreats, testimonials, gallery, team] = await Promise.all([
    getGlobal('hero'),
    getGlobal('about'),
    getGlobal('cta'),
    getDocs('retreats', {
      where: { published: { equals: true }, featured: { equals: true } },
      sort: 'order',
    }),
    getDocs('retreats', { where: { published: { equals: true } }, sort: 'order' }),
    getDocs('testimonials', { where: { published: { equals: true } }, sort: 'order', limit: 6 }),
    getDocs('gallery', { sort: 'order' }),
    getDocs('team-members', { where: { published: { equals: true } }, sort: 'order' }),
  ])

  const locations = Array.from(new Set(allRetreats.map((r) => r.location).filter(Boolean)))
  const retreatNames = allRetreats.map((r) => r.title)

  return (
    <>
      <Hero
        eyebrow={hero?.eyebrow}
        heading={hero?.heading || 'Find your balance'}
        subheading={hero?.subheading}
        primaryCtaLabel={hero?.primaryCtaLabel}
        primaryCtaHref={hero?.primaryCtaHref}
        secondaryCtaLabel={hero?.secondaryCtaLabel}
        secondaryCtaHref={hero?.secondaryCtaHref}
        images={hero?.heroImages ?? []}
        imageOpacity={hero?.imageOpacity}
        overlayOpacity={hero?.overlayOpacity}
        slideInterval={hero?.slideInterval}
        locations={locations}
        retreats={retreatNames}
      />
      <ValueProps />
      <AboutPreview about={about} />
      <RetreatsPreview retreats={featured} />
      <GalleryShowcase items={gallery} />
      <TeamSection members={team} />
      <TestimonialsSection testimonials={testimonials} />
      <CtaSection cta={cta} />
    </>
  )
}
