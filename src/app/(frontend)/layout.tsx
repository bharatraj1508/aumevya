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
      images: ogImage ? [{ url: ogImage }] : undefined,
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
  // Hero brush stroke defaults to the primary color unless explicitly set.
  const heroBrush = theme?.heroBrushColor || primary
  const themeVars = {
    '--color-primary': primary,
    '--color-ring': primary,
    '--color-accent': accent,
    '--color-hero-brush': heroBrush,
  } as React.CSSProperties

  return (
    <html
      lang="en"
      className={`${poppins.variable} ${jetbrainsMono.variable}`}
      style={themeVars}
    >
      <body>
        <SmoothScroll>
          <Header siteName={siteName} bookLabel="Book Now" />
          <main className="min-h-screen">{children}</main>
          <Footer siteName={siteName} contact={contact} />
        </SmoothScroll>
      </body>
    </html>
  )
}
