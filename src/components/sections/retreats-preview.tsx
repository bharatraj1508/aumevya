import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Retreat } from '@/payload-types'
import { SectionHeading } from '@/components/site/section-heading'
import { RetreatCard } from '@/components/site/retreat-card'
import { StaggerGroup, StaggerItem, Reveal } from '@/components/motion/reveal'
import { Button } from '@/components/ui/button'
import { CardBody, CardContainer, CardItem } from '@/components/ui/3d-card'

export function RetreatsPreview({ retreats }: { retreats: Retreat[] }) {
  if (retreats.length === 0) return null
  return (
    <section className="border-b border-border bg-background py-24 md:py-28">
      <div className="container-page">
        <SectionHeading
          eyebrow="Handpicked for you"
          title="Retreats for every body and every level"
          description="From grounding Hatha to flowing Vinyasa and quiet meditation — curated experiences that meet you where you are."
        />
        <StaggerGroup className="mt-14 grid gap-6 md:grid-cols-3">
          {retreats.map((r) => (
            <StaggerItem key={r.id} className="h-full">
              <CardContainer containerClassName="block h-full p-0" className="h-full w-full">
                <CardBody className="h-full w-full">
                  <CardItem translateZ={50} className="h-full w-full">
                    <RetreatCard retreat={r} />
                  </CardItem>
                </CardBody>
              </CardContainer>
            </StaggerItem>
          ))}
        </StaggerGroup>
        <Reveal className="mt-12 text-center">
          <Button asChild variant="outline">
            <Link href="/retreats">
              View all retreats
              <ArrowRight />
            </Link>
          </Button>
        </Reveal>
      </div>
    </section>
  )
}
