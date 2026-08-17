'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { BookingForm } from './booking-form'
import { ContactForm } from './contact-form'

type Tab = 'booking' | 'contact'

export function ContactTabs({ services }: { services: { id: string; title: string }[] }) {
  const [tab, setTab] = useState<Tab>('booking')

  const tabClass = (active: boolean) =>
    cn(
      'rounded-full px-5 py-2 text-sm font-medium transition-colors',
      active ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
    )

  return (
    <div>
      <div className="mb-7 inline-flex rounded-full border border-border bg-muted/50 p-1">
        <button type="button" onClick={() => setTab('booking')} className={tabClass(tab === 'booking')}>
          Book a retreat
        </button>
        <button type="button" onClick={() => setTab('contact')} className={tabClass(tab === 'contact')}>
          Send a message
        </button>
      </div>
      {tab === 'booking' ? <BookingForm services={services} /> : <ContactForm />}
    </div>
  )
}
