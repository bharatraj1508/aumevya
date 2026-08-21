'use client'

import { useEffect, useRef, useState } from 'react'

export type NavItem = { id: string; label: string }

export function SectionNav({ items }: { items: NavItem[] }) {
  const [active, setActive] = useState(items[0]?.id)
  const clicked = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (clicked.current) return
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      // Trigger when a section reaches the upper third, below the sticky bars.
      { rootMargin: '-140px 0px -65% 0px', threshold: 0 },
    )
    items.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [items])

  const go = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    clicked.current = true
    setActive(id)
    const top = el.getBoundingClientRect().top + window.scrollY - 116
    window.scrollTo({ top, behavior: 'smooth' })
    window.setTimeout(() => (clicked.current = false), 700)
  }

  return (
    <nav className="sticky top-[64px] z-30 -mx-5 border-b border-border bg-background/90 px-5 backdrop-blur md:top-[72px] md:mx-0 md:px-0">
      <ul className="container-page flex gap-1 overflow-x-auto md:px-0 [&::-webkit-scrollbar]:hidden">
        {items.map(({ id, label }) => {
          const isActive = active === id
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => go(id)}
                className={`relative whitespace-nowrap px-3 py-4 text-sm font-medium transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {label}
                <span
                  className={`absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-primary transition-opacity ${
                    isActive ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
