import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Config } from '@/payload-types'
import { RichText } from '@/components/RichText'
import { MediaImage } from '@/components/site/media-image'
import { Reveal } from '@/components/motion/reveal'
import { CountUp } from '@/components/motion/count-up'
import { Parallax } from '@/components/motion/parallax'
import { Button } from '@/components/ui/button'
import { Eyebrow } from '@/components/site/eyebrow'

type About = Config['globals']['about']

export function AboutPreview({ about }: { about: About }) {
  return (
    <section className="py-24 md:py-32">
      <div className="container-page grid items-center gap-12 md:grid-cols-2 md:gap-16">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl">
            <div className="aspect-[4/5]">
              <Parallax speed={0.12} className="h-full">
                <MediaImage
                  media={about?.image}
                  fill
                  sizes="(min-width: 768px) 45vw, 100vw"
                  className="object-cover"
                />
              </Parallax>
            </div>
          </div>
        </Reveal>

        <div>
          {about?.eyebrow && (
            <Reveal>
              <Eyebrow>{about.eyebrow}</Eyebrow>
            </Reveal>
          )}
          <Reveal delay={0.05}>
            <h2 className="mt-3 text-3xl text-balance md:text-4xl">{about?.heading}</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <RichText data={about?.body} className="mt-5 text-base" />
          </Reveal>

          {about?.highlights && about.highlights.length > 0 && (
            <Reveal delay={0.15}>
              <div className="mt-8 grid grid-cols-3 gap-6 border-t border-border pt-8">
                {about.highlights.map((h) => (
                  <div key={h.id}>
                    <CountUp
                      value={String(h.value ?? '')}
                      className="block text-3xl font-bold tracking-tight text-primary md:text-4xl"
                    />

                    <div className="mt-1 text-xs uppercase tracking-[0.1em] text-muted-foreground">
                      {h.label}
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          )}

          <Reveal delay={0.2}>
            <Button asChild variant="ghost" className="mt-8 px-0 hover:bg-transparent">
              <Link href="/about" className="text-primary">
                Read our story
                <ArrowRight />
              </Link>
            </Button>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
