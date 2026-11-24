'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Share2 } from 'lucide-react'
import type { Config } from '@/payload-types'
import { cn } from '@/lib/utils'
import { FacebookIcon, InstagramIcon, YoutubeIcon } from './social-icons'

type Socials = NonNullable<Config['globals']['contact-info']['socials']>

const NETWORKS = [
  {
    key: 'instagram',
    label: 'Instagram',
    Icon: InstagramIcon,
    className: 'bg-[radial-gradient(circle_at_30%_107%,#fdf497_0%,#fd5949_45%,#d6249f_60%,#285aeb_90%)]',
  },
  { key: 'facebook', label: 'Facebook', Icon: FacebookIcon, className: 'bg-[#1877F2]' },
  { key: 'youtube', label: 'YouTube', Icon: YoutubeIcon, className: 'bg-[#FF0000]' },
] as const

/** Scroll distance (px) after which an expanded dock collapses again. */
const COLLAPSE_AFTER = 40

/**
 * Mobile/tablet-only floating social links, pinned bottom-right. Collapses to
 * a single toggle once the visitor scrolls so it stays out of the content;
 * tapping the toggle brings the icons back until the next scroll.
 */
export function SocialDock({ socials }: { socials?: Socials | null }) {
  const links = NETWORKS.filter((n) => socials?.[n.key]?.trim())
  const [expanded, setExpanded] = useState(true)
  const anchorY = useRef(0)

  useEffect(() => {
    if (!expanded) return
    anchorY.current = window.scrollY
    const onScroll = () => {
      if (Math.abs(window.scrollY - anchorY.current) > COLLAPSE_AFTER) setExpanded(false)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [expanded])

  if (links.length === 0) return null

  return (
    <div className="fixed right-4 bottom-4 z-40 flex flex-col items-center gap-3 xl:hidden">
      <AnimatePresence>
        {expanded &&
          links.map((n, i) => (
            <motion.a
              key={n.key}
              href={socials![n.key]!}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={n.label}
              initial={{ opacity: 0, y: 12, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.8 }}
              transition={{ duration: 0.25, delay: (links.length - 1 - i) * 0.04 }}
              className={cn(
                'flex size-11 items-center justify-center rounded-full text-white shadow-lg',
                n.className,
              )}
            >
              <n.Icon className="size-5" />
            </motion.a>
          ))}
      </AnimatePresence>

      <AnimatePresence>
        {!expanded && (
          <motion.button
            type="button"
            onClick={() => setExpanded(true)}
            aria-label="Show social links"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
          >
            <Share2 className="size-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
