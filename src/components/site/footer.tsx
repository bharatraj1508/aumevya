import Link from 'next/link'
import { Mail, MapPin, Phone } from 'lucide-react'
import type { Config } from '@/payload-types'
import { NAV_LINKS } from './nav'
import { FacebookIcon, InstagramIcon, YoutubeIcon } from './social-icons'

type ContactInfo = Config['globals']['contact-info']

export function Footer({ siteName, contact }: { siteName: string; contact: ContactInfo }) {
  const socials = contact?.socials
  const year = 2026
  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="font-serif text-2xl">{siteName}</div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
            A calm, modern space to move, breathe and restore.
          </p>
          <div className="mt-5 flex gap-3">
            {socials?.instagram && (
              <a
                href={socials.instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <InstagramIcon className="size-5" />
              </a>
            )}
            {socials?.facebook && (
              <a
                href={socials.facebook}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <FacebookIcon className="size-5" />
              </a>
            )}
            {socials?.youtube && (
              <a
                href={socials.youtube}
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <YoutubeIcon className="size-5" />
              </a>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-serif text-lg">Explore</h4>
          <ul className="mt-4 space-y-2.5">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-lg">Get in touch</h4>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            {contact?.email && (
              <li className="flex items-center gap-2.5">
                <Mail className="size-4 shrink-0 text-primary" />
                <a href={`mailto:${contact.email}`} className="hover:text-foreground">
                  {contact.email}
                </a>
              </li>
            )}
            {contact?.phone && (
              <li className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0 text-primary" />
                <a href={`tel:${contact.phone}`} className="hover:text-foreground">
                  {contact.phone}
                </a>
              </li>
            )}
            {contact?.address && (
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                <span className="whitespace-pre-line">{contact.address}</span>
              </li>
            )}
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-lg">Hours</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            {contact?.hours?.map((h, i) => (
              <li key={i} className="flex justify-between gap-4">
                <span>{h.days}</span>
                <span className="text-foreground/80">{h.time}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-6 text-xs text-muted-foreground md:flex-row">
          <span>
            © {year} {siteName}. All rights reserved.
          </span>
          <span>Made with care.</span>
        </div>
      </div>
    </footer>
  )
}
