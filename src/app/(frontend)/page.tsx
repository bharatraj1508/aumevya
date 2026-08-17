import { getDocs, getGlobal } from '@/lib/payload'
import { Hero } from '@/components/sections/hero'
import { ValueProps } from '@/components/sections/value-props'
import { AboutPreview } from '@/components/sections/about-preview'
import { ServicesPreview } from '@/components/sections/services-preview'
import { GalleryShowcase } from '@/components/sections/gallery-showcase'
import { TestimonialsSection } from '@/components/sections/testimonials-section'
import { CtaSection } from '@/components/sections/cta-section'

export default async function HomePage() {
  const [hero, about, cta, featured, testimonials, gallery] = await Promise.all([
    getGlobal('hero'),
    getGlobal('about'),
    getGlobal('cta'),
    getDocs('services', {
      where: { published: { equals: true }, featured: { equals: true } },
      sort: 'order',
    }),
    getDocs('testimonials', { where: { published: { equals: true } }, sort: 'order', limit: 6 }),
    getDocs('gallery', { sort: 'order' }),
  ])

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
        backgroundImage={hero?.backgroundImage}
      />
      <ValueProps />
      <AboutPreview about={about} />
      <ServicesPreview services={featured} />
      <GalleryShowcase items={gallery} />
      <TestimonialsSection testimonials={testimonials} />
      <CtaSection cta={cta} />
    </>
  )
}
