import type { Metadata } from 'next'
import { getDocs, getGlobal } from '@/lib/payload'
import { GuidanceCover } from '@/components/site/guidance-cover'
import { GuidanceCard } from '@/components/site/guidance-card'
import { StaggerGroup, StaggerItem } from '@/components/motion/reveal'
import { CtaSection } from '@/components/sections/cta-section'

export const metadata: Metadata = { title: 'Guidance' }

export default async function GuidanceListPage() {
  const [guidance, page, cta] = await Promise.all([
    getDocs('guidance', { where: { published: { equals: true } }, sort: 'order' }),
    getGlobal('guidance-page'),
    getGlobal('cta'),
  ])

  return (
    <>
      <GuidanceCover page={page} />

      <section className="py-16 md:py-24">
        <div className="container-page">
          {guidance.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-lg font-semibold">No guidance sessions yet</p>
              <p className="mt-2 text-muted-foreground">
                New mentorship offerings are on the way — check back soon.
              </p>
            </div>
          ) : (
            <StaggerGroup className="mx-auto grid max-w-5xl items-start gap-6 sm:grid-cols-2">
              {guidance.map((g) => (
                <StaggerItem key={g.id}>
                  <GuidanceCard guidance={g} />
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
