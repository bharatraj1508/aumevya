import type { Gallery } from '@/payload-types'
import { MediaImage } from '@/components/site/media-image'
import { SectionHeading } from '@/components/site/section-heading'
import { StaggerGroup, StaggerItem } from '@/components/motion/reveal'
import { CardBody, CardContainer, CardItem } from '@/components/ui/3d-card'

export function GalleryShowcase({ items }: { items: Gallery[] }) {
  if (items.length === 0) return null

  return (
    <section className="border-b border-border bg-background py-24 md:py-28">
      <div className="container-page">
        <SectionHeading
          eyebrow="Life at the studio"
          title="A glimpse into our space"
          description="Moments from our retreats, community and calm corners."
        />

        <StaggerGroup className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <StaggerItem key={item.id}>
              <CardContainer containerClassName="block p-0" className="h-full w-full">
                <CardBody className="aspect-[4/5] h-auto w-full">
                  <CardItem translateZ={60} className="h-full w-full">
                    <figure className="group relative h-full w-full overflow-hidden rounded-2xl border border-border bg-muted shadow-sm">
                      <MediaImage
                        media={item.image}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      {(item.caption || item.category) && (
                        <CardItem
                          as="figcaption"
                          translateZ={40}
                          className="absolute inset-x-0 bottom-0 w-full bg-gradient-to-t from-black/75 to-transparent p-5 text-primary-foreground"
                        >
                          {item.category && (
                            <span className="inline-block rounded-full bg-primary px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-primary-foreground">
                              {item.category}
                            </span>
                          )}
                          {item.caption && (
                            <div className="mt-2 text-sm font-medium">{item.caption}</div>
                          )}
                        </CardItem>
                      )}
                    </figure>
                  </CardItem>
                </CardBody>
              </CardContainer>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  )
}
