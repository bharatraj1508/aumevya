'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { MediaImage } from '@/components/site/media-image'
import { Button } from '@/components/ui/button'

type HeroProps = {
  eyebrow?: string | null
  heading: string
  subheading?: string | null
  primaryCtaLabel?: string | null
  primaryCtaHref?: string | null
  secondaryCtaLabel?: string | null
  secondaryCtaHref?: string | null
  backgroundImage: unknown
}

export function Hero({
  eyebrow,
  heading,
  subheading,
  primaryCtaLabel,
  primaryCtaHref,
  secondaryCtaLabel,
  secondaryCtaHref,
  backgroundImage,
}: HeroProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['0%', '22%'])
  const scale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1.05, 1.18])
  const overlay = useTransform(scrollYProgress, [0, 1], [0.55, 0.8])

  const words = heading.split(' ')

  return (
    <section ref={ref} className="relative flex h-svh min-h-[620px] items-center overflow-hidden">
      <motion.div style={{ y, scale }} className="absolute inset-0 -z-10">
        <MediaImage
          media={backgroundImage}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>
      <motion.div
        style={{ opacity: overlay }}
        className="absolute inset-0 -z-10 bg-gradient-to-b from-foreground/40 via-foreground/40 to-foreground/70"
      />

      <div className="container-page text-primary-foreground">
        <div className="max-w-3xl">
          {eyebrow && (
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-sm font-medium uppercase tracking-[0.25em] text-primary-foreground/80"
            >
              {eyebrow}
            </motion.p>
          )}
          <h1 className="mt-5 text-4xl leading-[1.05] text-balance text-primary-foreground sm:text-5xl md:text-6xl lg:text-7xl">
            {words.map((word, i) => (
              <span key={i} className="inline-block overflow-hidden pb-1 align-top">
                <motion.span
                  className="inline-block"
                  initial={reduce ? { opacity: 0 } : { y: '110%' }}
                  animate={reduce ? { opacity: 1 } : { y: '0%' }}
                  transition={{ duration: 0.9, delay: 0.15 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                >
                  {word}&nbsp;
                </motion.span>
              </span>
            ))}
          </h1>
          {subheading && (
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 max-w-xl text-lg leading-relaxed text-primary-foreground/85"
            >
              {subheading}
            </motion.p>
          )}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="mt-9 flex flex-wrap gap-4"
          >
            <Button asChild variant="accent" size="lg">
              <Link href={primaryCtaHref || '/contact'}>
                {primaryCtaLabel || 'Book Now'}
                <ArrowRight />
              </Link>
            </Button>
            {secondaryCtaLabel && (
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link href={secondaryCtaHref || '/services'}>{secondaryCtaLabel}</Link>
              </Button>
            )}
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 1 }}
        className="absolute inset-x-0 bottom-6 flex justify-center"
      >
        <div className="h-10 w-6 rounded-full border border-primary-foreground/40 p-1">
          <motion.div
            animate={reduce ? {} : { y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
            className="mx-auto h-2 w-2 rounded-full bg-primary-foreground/70"
          />
        </div>
      </motion.div>
    </section>
  )
}
