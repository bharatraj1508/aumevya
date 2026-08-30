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
    <footer className="border-t border-border bg-muted">
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
          <a
            href="https://www.linkedin.com/in/bharat-raj-verma/"
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-2 transition-colors hover:text-foreground"
          >
            <span>
              Crafted by <span className="font-medium text-foreground/80">Bharat Raj Verma</span>
              <span className="text-muted-foreground/70"> · Full Stack Developer</span>
            </span>
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="size-4 shrink-0 fill-current text-muted-foreground transition-colors group-hover:text-primary"
            >
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zM8.34 9.67H5.67V18h2.67V9.67zM7 6.34a1.55 1.55 0 1 0 0 3.1 1.55 1.55 0 0 0 0-3.1zM18.34 18v-4.57c0-2.45-1.31-3.59-3.06-3.59a2.64 2.64 0 0 0-2.39 1.31h-.04V9.67h-2.56V18h2.67v-4.12c0-1.09.2-2.14 1.55-2.14s1.35 1.24 1.35 2.21V18h2.93z" />
            </svg>
            <span className="sr-only">Bharat Raj Verma on LinkedIn</span>
          </a>
        </div>
      </div>
    </footer>
  )
}
