import type { Testimonial } from '@/payload-types'
import { SectionHeading } from '@/components/site/section-heading'
import { TestimonialCard } from '@/components/site/testimonial-card'
import { StaggerGroup, StaggerItem } from '@/components/motion/reveal'

export function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null
  return (
    <section className="bg-muted/40 py-24 md:py-32">
      <div className="container-page">
        <SectionHeading
          eyebrow="Kind words"
          title="Loved by our community"
          description="Real stories from students who found their calm, strength and rhythm with us."
        />
        <StaggerGroup className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <StaggerItem key={t.id} className="h-full">
              <TestimonialCard testimonial={t} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  )
}
