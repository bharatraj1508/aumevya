'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { NAV_LINKS } from './nav'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function Header({ siteName, bookLabel }: { siteName: string; bookLabel: string }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-500',
        scrolled
          ? 'bg-background/85 backdrop-blur-md border-b border-border/60'
          : 'bg-transparent',
      )}
    >
      <div className="container-page flex h-16 items-center justify-between md:h-20">
        <Link
          href="/"
          className={cn(
            'font-serif text-xl tracking-tight transition-colors',
            scrolled ? 'text-foreground' : 'text-primary-foreground',
          )}
        >
          {siteName}
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                'text-sm transition-colors',
                scrolled
                  ? 'text-foreground/70 hover:text-foreground'
                  : 'text-primary-foreground/80 hover:text-primary-foreground',
                pathname === l.href && (scrolled ? 'text-foreground' : 'text-primary-foreground'),
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button asChild variant="accent" size="sm">
            <Link href="/contact">{bookLabel}</Link>
          </Button>
        </div>

        <button
          className={cn('md:hidden', scrolled || open ? 'text-foreground' : 'text-primary-foreground')}
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-b border-border bg-background/95 backdrop-blur-md md:hidden"
          >
            <nav className="container-page flex flex-col gap-1 py-4">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-lg px-2 py-3 text-base text-foreground/80 hover:bg-foreground/5"
                >
                  {l.label}
                </Link>
              ))}
              <Button asChild variant="accent" className="mt-2 w-full">
                <Link href="/contact">{bookLabel}</Link>
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
