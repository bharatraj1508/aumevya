import { Reveal } from '@/components/motion/reveal'

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string
  title: string
  description?: string
}) {
  return (
    <section className="relative overflow-hidden bg-primary pb-16 pt-32 text-primary-foreground md:pb-20 md:pt-44">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-0 size-80 rounded-full bg-accent/25 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 bottom-0 size-72 rounded-full bg-primary-foreground/10 blur-3xl"
      />
      <div className="container-page relative">
        <Reveal className="max-w-2xl">
          {eyebrow && (
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-primary-foreground/70">
              {eyebrow}
            </span>
          )}
          <h1 className="mt-3 text-4xl text-balance md:text-5xl">{title}</h1>
          {description && (
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-primary-foreground/80">
              {description}
            </p>
          )}
        </Reveal>
      </div>
    </section>
  )
}
