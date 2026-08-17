import type { Metadata } from 'next'
import { getDocs, getGlobal } from '@/lib/payload'
import { PageHeader } from '@/components/site/page-header'
import { TestimonialCard } from '@/components/site/testimonial-card'
import { StaggerGroup, StaggerItem } from '@/components/motion/reveal'
import { CtaSection } from '@/components/sections/cta-section'

export const metadata: Metadata = { title: 'Stories' }

export default async function TestimonialsPage() {
  const [testimonials, cta] = await Promise.all([
    getDocs('testimonials', { where: { published: { equals: true } }, sort: 'order' }),
    getGlobal('cta'),
  ])

  return (
    <>
      <PageHeader
        eyebrow="Kind words"
        title="Student Stories"
        description="Real experiences from the people who practise with us."
      />

      <section className="py-20 md:py-28">
        <div className="container-page">
          {testimonials.length === 0 ? (
            <p className="text-center text-muted-foreground">Stories coming soon.</p>
          ) : (
            <StaggerGroup className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t) => (
                <StaggerItem key={t.id} className="h-full">
                  <TestimonialCard testimonial={t} />
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
