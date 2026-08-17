import type { Metadata } from 'next'
import { getDocs } from '@/lib/payload'
import { PageHeader } from '@/components/site/page-header'
import { MediaImage } from '@/components/site/media-image'
import { Reveal } from '@/components/motion/reveal'

export const metadata: Metadata = { title: 'Gallery' }

export default async function GalleryPage() {
  const items = await getDocs('gallery', { sort: 'order' })

  return (
    <>
      <PageHeader
        eyebrow="Life at the studio"
        title="Gallery"
        description="Moments from our retreats, community and calm corners."
      />

      <section className="py-20 md:py-28">
        <div className="container-page">
          {items.length === 0 ? (
            <p className="text-center text-muted-foreground">Photos coming soon.</p>
          ) : (
            <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5">
              {items.map((item, i) => (
                <Reveal key={item.id} delay={(i % 3) * 0.05} className="break-inside-avoid">
                  <figure className="group relative overflow-hidden rounded-2xl border border-border">
                    <MediaImage
                      media={item.image}
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {item.caption && (
                      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/70 to-transparent p-4 text-sm text-primary-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <span className="text-[10px] uppercase tracking-widest text-primary-foreground/70">
                          {item.category}
                        </span>
                        <div>{item.caption}</div>
                      </figcaption>
                    )}
                  </figure>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
