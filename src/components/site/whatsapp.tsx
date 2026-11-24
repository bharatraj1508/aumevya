'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { MessageCircle } from 'lucide-react'
import { DEFAULT_WHATSAPP_NUMBER, toWaNumber, whatsAppLink } from '@/lib/whatsapp-link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const WhatsAppContext = createContext(DEFAULT_WHATSAPP_NUMBER)

/** Shares the CMS WhatsApp number with every booking surface on the page. */
export function WhatsAppProvider({ number, children }: { number?: string | null; children: ReactNode }) {
  return (
    <WhatsAppContext.Provider value={toWaNumber(number) ?? DEFAULT_WHATSAPP_NUMBER}>
      {children}
    </WhatsAppContext.Provider>
  )
}

/** Returns a builder for wa.me links to the site's WhatsApp number. */
export function useWhatsAppLink() {
  const number = useContext(WhatsAppContext)
  return (text: string) => whatsAppLink(number, text)
}

/**
 * Opens WhatsApp in a new tab. Called after an async submit, so browsers
 * (especially iOS Safari) may block it — callers keep a WhatsAppButton on
 * screen as the reliable path.
 */
export function openWhatsApp(href: string) {
  window.open(href, '_blank', 'noopener,noreferrer')
}

export function WhatsAppButton({
  href,
  children = 'Send on WhatsApp',
  className,
}: {
  href: string
  children?: ReactNode
  className?: string
}) {
  return (
    <Button asChild variant="accent" size="lg" className={cn('rounded-full', className)}>
      <a href={href} target="_blank" rel="noopener noreferrer">
        <MessageCircle /> {children}
      </a>
    </Button>
  )
}
