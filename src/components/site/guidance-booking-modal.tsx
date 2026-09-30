'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLenis } from 'lenis/react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GuidanceBookingForm } from '@/components/forms/guidance-booking-form'
import type { GuidanceSlot, OpenDate } from '@/lib/guidance'

/**
 * "Book Guidance" call-to-action that opens the booking form in a modal,
 * mirroring the retreat booking flow (portal + page scroll-lock + Escape/close).
 */
export function GuidanceBookingModal({
  title,
  slots,
  openDates,
  guidanceSlug,
  label = 'Book Guidance',
  className,
}: {
  title: string
  slots: GuidanceSlot[]
  openDates: OpenDate[]
  guidanceSlug?: string
  label?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const lenis = useLenis()

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    lenis?.stop()
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      lenis?.start()
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, lenis])

  return (
    <>
      <Button size="lg" className={className} onClick={() => setOpen(true)}>
        {label}
      </Button>

      {open &&
        mounted &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label={`Book ${title}`}
            onClick={(e) => e.target === e.currentTarget && setOpen(false)}
          >
            <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl sm:p-8">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
              <h2 className="text-xl font-bold">Book Guidance</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Pick a date and time, and we&apos;ll confirm your session on{' '}
                <span className="font-medium text-foreground">{title}</span>.
              </p>
              <div className="mt-6">
                <GuidanceBookingForm
                  slots={slots}
                  openDates={openDates}
                  guidanceSlug={guidanceSlug}
                />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
