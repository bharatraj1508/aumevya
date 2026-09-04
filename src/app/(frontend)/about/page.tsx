import type { Metadata } from 'next'
import { getDocs, getGlobal } from '@/lib/payload'
import { PageHeader } from '@/components/site/page-header'
import { RichText } from '@/components/RichText'
import { MediaImage } from '@/components/site/media-image'
import { Reveal } from '@/components/motion/reveal'
import { TeamSection } from '@/components/sections/team-section'
import { CtaSection } from '@/components/sections/cta-section'

export const metadata: Metadata = { title: 'About' }

export default async function AboutPage() {
  const [about, cta, team] = await Promise.all([
    getGlobal('about'),
    getGlobal('cta'),
    getDocs('team-members', { where: { published: { equals: true } }, sort: 'order' }),
  ])

  return (
    <>
      <PageHeader
        eyebrow={about?.eyebrow || 'Our Story'}
        title={about?.heading || 'About Aumevya'}
        description="A calm, modern studio rooted in tradition — built to help you move, breathe and restore."
      />

      <section className="py-20 md:py-28">
        <div className="container-page grid items-center gap-12 md:grid-cols-2 md:gap-16">
          <Reveal>
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
              <MediaImage
                media={about?.image}
                fill
                sizes="(min-width: 768px) 45vw, 100vw"
                className="object-cover"
              />
            </div>
          </Reveal>
          <div>
            <Reveal>
              <RichText data={about?.body} className="text-base" />
            </Reveal>
            {about?.highlights && about.highlights.length > 0 && (
              <Reveal delay={0.1}>
                <div className="mt-10 grid grid-cols-3 gap-6 border-t border-border pt-8">
                  {about.highlights.map((h) => (
                    <div key={h.id}>
                      <div className="font-serif text-3xl text-foreground">{h.value}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{h.label}</div>
                    </div>
                  ))}
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      <TeamSection members={team} muted />

      <CtaSection cta={cta} />
    </>
  )
}
