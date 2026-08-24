import type { Metadata } from 'next'
import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import { getDocs, getGlobal } from '@/lib/payload'
import { PageHeader } from '@/components/site/page-header'
import { ContactTabs } from '@/components/forms/contact-tabs'
import { Reveal } from '@/components/motion/reveal'

export const metadata: Metadata = { title: 'Contact' }

export default async function ContactPage() {
  const [contact, retreats] = await Promise.all([
    getGlobal('contact-info'),
    getDocs('retreats', { where: { published: { equals: true } }, sort: 'order' }),
  ])

  const serviceOptions = retreats.map((r) => ({ id: String(r.id), title: r.title }))

  return (
    <>
      <PageHeader
        eyebrow="Get in touch"
        title="Book a retreat or say hello"
        description="Tell us what you're looking for and we'll help you find the right practice."
      />

      <section className="py-20 md:py-28">
        <div className="container-page grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <Reveal>
            <div>
              <h2 className="text-2xl">Visit us</h2>
              <ul className="mt-6 space-y-5 text-sm">
                {contact?.address && (
                  <li className="flex items-start gap-3">
                    <MapPin className="mt-0.5 size-5 shrink-0 text-primary" />
                    <span className="whitespace-pre-line text-muted-foreground">{contact.address}</span>
                  </li>
                )}
                {contact?.phone && (
                  <li className="flex items-center gap-3">
                    <Phone className="size-5 shrink-0 text-primary" />
                    <a href={`tel:${contact.phone}`} className="text-muted-foreground hover:text-foreground">
                      {contact.phone}
                    </a>
                  </li>
                )}
                {contact?.email && (
                  <li className="flex items-center gap-3">
                    <Mail className="size-5 shrink-0 text-primary" />
                    <a href={`mailto:${contact.email}`} className="text-muted-foreground hover:text-foreground">
                      {contact.email}
                    </a>
                  </li>
                )}
              </ul>

              {contact?.hours && contact.hours.length > 0 && (
                <div className="mt-8">
                  <h3 className="flex items-center gap-2 text-lg">
                    <Clock className="size-4 text-primary" /> Opening hours
                  </h3>
                  <ul className="mt-3 space-y-2 text-sm">
                    {contact.hours.map((h, i) => (
                      <li key={i} className="flex justify-between gap-6 border-b border-border/60 pb-2">
                        <span className="text-muted-foreground">{h.days}</span>
                        <span className="text-foreground/80">{h.time}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {contact?.mapEmbedUrl && (
                <div className="mt-8 overflow-hidden rounded-2xl border border-border">
                  <iframe
                    src={contact.mapEmbedUrl}
                    title="Studio location"
                    loading="lazy"
                    className="aspect-video w-full"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
              <ContactTabs services={serviceOptions} />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
