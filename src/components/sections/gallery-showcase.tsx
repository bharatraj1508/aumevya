'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { Gallery } from '@/payload-types'
import { MediaImage } from '@/components/site/media-image'
import { SectionHeading } from '@/components/site/section-heading'

export function GalleryShowcase({ items }: { items: Gallery[] }) {
  const pinRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pinRef.current || !trackRef.current) return
    const track = trackRef.current
    const pin = pinRef.current

    const mm = gsap.matchMedia()
    // Cinematic pinned horizontal scroll — desktop + motion-safe only.
    mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
      gsap.registerPlugin(ScrollTrigger)
      const getScrollLen = () => track.scrollWidth - (track.parentElement?.clientWidth ?? 0)

      const tween = gsap.to(track, {
        x: () => -getScrollLen(),
        ease: 'none',
        scrollTrigger: {
          trigger: pin,
          start: 'top top',
          end: () => `+=${getScrollLen()}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      return () => {
        tween.scrollTrigger?.kill()
        tween.kill()
      }
    })

    return () => mm.revert()
  }, [])

  if (items.length === 0) return null

  return (
    <section className="py-24 md:py-32">
      <div className="container-page">
        <SectionHeading
          eyebrow="Life at the studio"
          title="A glimpse into our space"
          description="Scroll through moments from our retreats, community and calm corners."
        />
      </div>

      <div ref={pinRef} className="mt-14">
        <div className="flex h-svh items-center overflow-hidden max-md:h-auto max-md:snap-x max-md:snap-mandatory max-md:overflow-x-auto max-md:py-4 motion-reduce:h-auto motion-reduce:overflow-x-auto motion-reduce:py-4">
          <div
            ref={trackRef}
            className="flex w-max gap-5 px-5 will-change-transform md:px-[8vw]"
          >
            {items.map((item, i) => (
              <figure
                key={item.id}
                className="group relative h-[62vh] w-[78vw] shrink-0 snap-center overflow-hidden rounded-3xl border border-border sm:w-[58vw] md:h-[70vh] md:w-[42vw] lg:w-[34vw]"
              >
                <MediaImage
                  media={item.image}
                  fill
                  sizes="(min-width: 768px) 42vw, 80vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {item.caption && (
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/70 to-transparent p-6 text-sm text-primary-foreground">
                    <span className="text-xs uppercase tracking-widest text-primary-foreground/70">
                      {item.category}
                    </span>
                    <div className="mt-1">{item.caption}</div>
                  </figcaption>
                )}
                <span className="absolute right-4 top-4 text-xs text-primary-foreground/60">
                  {String(i + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
                </span>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
