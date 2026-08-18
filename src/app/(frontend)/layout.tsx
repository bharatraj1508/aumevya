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
  const siteName = seo?.siteName || 'Aumevya Yoga'
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
  const [seo, contact] = await Promise.all([getGlobal('seo-defaults'), getGlobal('contact-info')])
  const siteName = seo?.siteName || 'Aumevya Yoga'

  return (
    <html lang="en" className={`${poppins.variable} ${jetbrainsMono.variable}`}>
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
