import type { Metadata } from 'next'
import { getDocs, getGlobal } from '@/lib/payload'
import { PageHeader } from '@/components/site/page-header'
import { ServiceCard } from '@/components/site/service-card'
import { StaggerGroup, StaggerItem } from '@/components/motion/reveal'
import { CtaSection } from '@/components/sections/cta-section'

export const metadata: Metadata = { title: 'Retreats' }

export default async function ServicesPage() {
  const [services, cta] = await Promise.all([
    getDocs('services', { where: { published: { equals: true } }, sort: 'order' }),
    getGlobal('cta'),
  ])

  return (
    <>
      <PageHeader
        eyebrow="Handpicked retreats"
        title="Our Retreats"
        description="Curated, small-group experiences across every style and level — guided by certified teachers."
      />

      <section className="py-20 md:py-28">
        <div className="container-page">
          {services.length === 0 ? (
            <p className="text-center text-muted-foreground">Retreats will be listed here soon.</p>
          ) : (
            <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((s) => (
                <StaggerItem key={s.id} className="h-full">
                  <ServiceCard service={s} />
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
