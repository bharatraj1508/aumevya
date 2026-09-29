import React from 'react'
import type { Metadata } from 'next'
import { Poppins, JetBrains_Mono } from 'next/font/google'
import './styles.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})
import { SmoothScroll } from '@/components/motion/smooth-scroll'
import { Header } from '@/components/site/header'
import { Footer } from '@/components/site/footer'
import { getGlobal, mediaURL } from '@/lib/payload'

// Public site is rendered per-request so admin edits appear immediately and
// builds don't depend on the database. (Can move to ISR + on-demand
// revalidation later if traffic warrants it.)
export const dynamic = 'force-dynamic'

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getGlobal('seo-defaults')
  const siteName = seo?.siteName || 'Aumevya'
  const ogImage = mediaURL(seo?.ogImage)
  // SVG OG images render inconsistently across social platforms. Only honour the
  // CMS image when it's a raster; otherwise fall back to the generated PNG in
  // `opengraph-image.tsx` (Next's file convention supplies it automatically).
  const rasterOg = ogImage && !/\.svg(?:\?|$)/i.test(ogImage) ? ogImage : null
  return {
    metadataBase: new URL(SERVER_URL),
    title: {
      default: siteName,
      template: seo?.titleTemplate || `%s · ${siteName}`,
    },
    description: seo?.description || '',
    openGraph: {
      siteName,
      type: 'website',
      url: SERVER_URL,
      locale: 'en_US',
      images: rasterOg ? [{ url: rasterOg }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
    },
  }
}

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const [seo, contact, theme] = await Promise.all([
    getGlobal('seo-defaults'),
    getGlobal('contact-info'),
    getGlobal('theme'),
  ])
  const siteName = seo?.siteName || 'Aumevya'

  // Inline CSS vars override the @theme defaults in styles.css, so the palette
  // is controlled entirely from the Theme global in the CMS. Falls back to
  // Cromix Orange if the global is empty.
  const primary = theme?.primaryColor || '#d64500'
  const accent = theme?.accentColor || '#f5a623'
  const themeVars = {
    '--color-primary': primary,
    '--color-ring': primary,
    '--color-accent': accent,
  } as React.CSSProperties

  // Structured data so Google can build the brand entity and (via WebSite +
  // SearchAction) offer a sitelinks search box. Rendered server-side so it's in
  // the crawled HTML. All URLs resolve against SERVER_URL — set
  // NEXT_PUBLIC_SERVER_URL in production or these point at localhost.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SERVER_URL}/#organization`,
        name: siteName,
        url: SERVER_URL,
        logo: `${SERVER_URL}/logo.png`,
      },
      {
        '@type': 'WebSite',
        '@id': `${SERVER_URL}/#website`,
        name: siteName,
        url: SERVER_URL,
        publisher: { '@id': `${SERVER_URL}/#organization` },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SERVER_URL}/retreats?where={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  }

  return (
    <html
      lang="en"
      className={`${poppins.variable} ${jetbrainsMono.variable}`}
      style={themeVars}
    >
      <body>
        <script
          type="application/ld+json"
          // Escape `<` so a value like "</script>" can't break out of the tag.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        />
        <SmoothScroll>
          <Header siteName={siteName} bookLabel="Book Now" />
          <main className="min-h-screen">{children}</main>
          <Footer siteName={siteName} contact={contact} />
        </SmoothScroll>
      </body>
    </html>
  )
}
