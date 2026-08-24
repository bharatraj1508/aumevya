'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { Sparkles, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** Decorative sparkles scattered around the badge — subtle, staggered twinkle. */
const SPARKLES = [
  { top: '8%', left: '14%', size: 18, delay: 0 },
  { top: '18%', left: '82%', size: 24, delay: 0.6 },
  { top: '64%', left: '8%', size: 20, delay: 1.1 },
  { top: '74%', left: '88%', size: 16, delay: 0.3 },
  { top: '40%', left: '92%', size: 14, delay: 1.5 },
  { top: '52%', left: '4%', size: 14, delay: 0.9 },
]

export function ComingSoon({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <section className="relative flex min-h-[calc(100vh-5rem)] items-center justify-center overflow-hidden bg-muted px-5 py-32">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[38rem] w-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, color-mix(in srgb, var(--color-primary) 22%, transparent) 0%, transparent 60%)',
        }}
      />

      {/* Twinkling sparkles */}
      {SPARKLES.map((s, i) => (
        <motion.div
          key={i}
          aria-hidden
          className="pointer-events-none absolute text-accent"
          style={{ top: s.top, left: s.left }}
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: [0, 1, 0.2, 1], scale: [0.4, 1, 0.8, 1], rotate: [0, 15, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, delay: s.delay, ease: 'easeInOut' }}
        >
          <Sparkles style={{ width: s.size, height: s.size }} />
        </motion.div>
      ))}

      <div className="relative z-10 flex max-w-xl flex-col items-center text-center">
        {/* Sparkle badge */}
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <div className="flex size-24 items-center justify-center rounded-3xl border border-border bg-card shadow-sm">
            <motion.div
              animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.08, 1] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Sparkles className="size-11 text-primary" strokeWidth={1.6} />
            </motion.div>
          </div>
        </motion.div>

        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-8 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 font-mono text-[0.7rem] font-medium uppercase tracking-[0.16em] text-foreground/65"
        >
          <span aria-hidden className="size-1.5 rounded-full bg-accent" />
          Coming Soon
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-5 text-4xl font-extrabold text-balance text-foreground md:text-5xl"
        >
          {title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-4 max-w-md text-lg leading-relaxed text-muted-foreground"
        >
          {description ??
            'We’re crafting something meaningful for this space. Check back soon — it will be worth the wait.'}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-9 flex flex-wrap items-center justify-center gap-3"
        >
          <Button asChild size="lg">
            <Link href="/retreats">Explore Retreats</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">
              <ArrowLeft className="size-4" />
              Back to Home
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
