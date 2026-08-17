import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Config } from '@/payload-types'
import { Reveal } from '@/components/motion/reveal'
import { Button } from '@/components/ui/button'

type Cta = Config['globals']['cta']

export function CtaSection({ cta }: { cta: Cta }) {
  return (
    <section className="py-24 md:py-28">
      <div className="container-page">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] bg-primary px-6 py-16 text-center text-primary-foreground md:px-16 md:py-20">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-accent/30 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-20 -left-10 size-72 rounded-full bg-primary-foreground/10 blur-3xl"
            />
            <h2 className="relative mx-auto max-w-2xl text-3xl text-balance text-primary-foreground md:text-4xl">
              {cta?.heading || 'Begin your practice today'}
            </h2>
            {cta?.subheading && (
              <p className="relative mx-auto mt-4 max-w-xl text-primary-foreground/80">
                {cta.subheading}
              </p>
            )}
            <div className="relative mt-8 flex justify-center">
              <Button asChild variant="accent" size="lg">
                <Link href={cta?.buttonHref || '/contact'}>
                  {cta?.buttonLabel || 'Book Your First Retreat'}
                  <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
