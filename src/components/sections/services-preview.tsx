import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Service } from '@/payload-types'
import { SectionHeading } from '@/components/site/section-heading'
import { ServiceCard } from '@/components/site/service-card'
import { StaggerGroup, StaggerItem, Reveal } from '@/components/motion/reveal'
import { Button } from '@/components/ui/button'

export function ServicesPreview({ services }: { services: Service[] }) {
  if (services.length === 0) return null
  return (
    <section className="bg-muted/40 py-24 md:py-32">
      <div className="container-page">
        <SectionHeading
          eyebrow="Handpicked for you"
          title="Retreats for every body and every level"
          description="From grounding Hatha to flowing Vinyasa and quiet meditation — curated experiences that meet you where you are."
        />
        <StaggerGroup className="mt-14 grid gap-6 md:grid-cols-3">
          {services.map((s) => (
            <StaggerItem key={s.id} className="h-full">
              <ServiceCard service={s} />
            </StaggerItem>
          ))}
        </StaggerGroup>
        <Reveal className="mt-12 text-center">
          <Button asChild variant="outline">
            <Link href="/services">
              View all retreats
              <ArrowRight />
            </Link>
          </Button>
        </Reveal>
      </div>
    </section>
  )
}
