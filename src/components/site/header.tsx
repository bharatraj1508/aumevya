'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
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
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-background shadow-sm'
          : 'bg-transparent',
      )}
    >
      <div
        className={cn(
          'container-page flex items-center justify-between pb-3 transition-all duration-300',
          scrolled ? 'h-14 md:h-16' : 'h-20 md:h-24',
        )}
      >
        <Link
          href="/"
          aria-label={siteName}
          className="inline-flex items-center transition-all duration-300"
        >
          <Image
            src="/logo.png"
            alt={siteName}
            width={306}
            height={166}
            priority
            className="h-14 w-auto md:h-[4.5rem]"
          />
        </Link>

        <nav className="hidden items-center gap-8 xl:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                'text-sm font-medium text-foreground/70 transition-colors hover:text-primary',
                pathname === l.href && 'text-primary',
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden xl:block">
          <Button asChild size="sm">
            <Link href="/contact">{bookLabel}</Link>
          </Button>
        </div>

        <button
          className="text-foreground xl:hidden"
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
            className="overflow-hidden border-b border-border bg-background/95 backdrop-blur-md xl:hidden"
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
              <Button asChild className="mt-2 w-full">
                <Link href="/contact">{bookLabel}</Link>
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
