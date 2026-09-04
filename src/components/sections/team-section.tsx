import type { TeamMember } from '@/payload-types'
import { SectionHeading } from '@/components/site/section-heading'
import { MediaImage } from '@/components/site/media-image'
import { StaggerGroup, StaggerItem } from '@/components/motion/reveal'

type TeamSectionProps = {
  members: TeamMember[]
  eyebrow?: string
  title?: string
  description?: string
  /** Subtle alternate surface when placed between two white sections. */
  muted?: boolean
}

export function TeamSection({
  members,
  eyebrow = 'Our people',
  title = 'Meet your team',
  description = 'The teachers and guides who make every retreat feel like coming home.',
  muted = false,
}: TeamSectionProps) {
  if (members.length === 0) return null

  return (
    <section
      className={`relative overflow-hidden border-b border-border py-24 md:py-28 ${
        muted ? 'bg-muted/40' : 'bg-background'
      }`}
    >
      {/* Soft colour depth so the glass cards have something to refract */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-[12%] size-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 right-[12%] size-80 rounded-full bg-accent/15 blur-3xl" />
      </div>

      <div className="container-page relative">
        <SectionHeading eyebrow={eyebrow} title={title} description={description} />

        <StaggerGroup className="mt-14 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((m) => (
            <StaggerItem key={m.id} className="h-full">
              <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-white/60 bg-white/55 backdrop-blur-xl transition-all duration-300 [box-shadow:0_1px_1px_rgba(0,0,0,0.03),0_14px_36px_-16px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.75)] hover:-translate-y-1.5 hover:[box-shadow:0_1px_1px_rgba(0,0,0,0.04),0_28px_58px_-20px_rgba(0,0,0,0.30),inset_0_1px_0_rgba(255,255,255,0.9)]">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <MediaImage
                    media={m.image}
                    fill
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  {/* Gradient veil anchoring the name over the image */}
                  <div
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/70 via-black/25 to-transparent"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <h3 className="font-serif text-xl leading-tight text-white drop-shadow-sm">
                      {m.name}
                    </h3>
                    {m.role && (
                      <p className="mt-1 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-white/85">
                        {m.role}
                      </p>
                    )}
                  </div>
                </div>

                {m.about && (
                  <div className="flex flex-1 flex-col p-5">
                    <p className="text-sm leading-relaxed text-muted-foreground">{m.about}</p>
                  </div>
                )}
              </article>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  )
}
