import { Reveal } from '@/components/motion/reveal'
import { Eyebrow } from '@/components/site/eyebrow'

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
    <section className="border-b border-border bg-muted pb-14 pt-32 md:pb-16 md:pt-44">
      <div className="container-page">
        <Reveal className="max-w-2xl">
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <h1 className="mt-3 text-4xl font-extrabold text-balance text-foreground md:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </Reveal>
      </div>
    </section>
  )
}
