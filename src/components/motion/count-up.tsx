'use client'

import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '@/lib/gsap'

type CountUpProps = {
  /** The display value, e.g. "500+", "12k", "98%", "1,200". */
  value: string
  className?: string
  duration?: number
}

/** Splits "1,200+" into { prefix: "", digits: "1,200", suffix: "+" }. */
function parse(value: string) {
  const match = value.match(/^(\D*)([\d.,]+)(.*)$/s)
  if (!match) return null
  const [, prefix, digits, suffix] = match
  const decimals = digits.includes('.') ? digits.split('.')[1].length : 0
  const hasComma = digits.includes(',')
  const target = parseFloat(digits.replace(/,/g, ''))
  if (Number.isNaN(target)) return null
  return { prefix, suffix, target, decimals, hasComma }
}

/**
 * Animates a numeric value up from 0 when it scrolls into view. Any prefix or
 * suffix around the number (e.g. "+", "%", "k") is preserved. Reduced motion
 * and unparseable values render the final value immediately.
 */
export function CountUp({ value, className, duration = 1.6 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const parsed = parse(value)
    if (!parsed || prefersReducedMotion()) {
      el.textContent = value
      return
    }

    const { prefix, suffix, target, decimals, hasComma } = parsed
    const format = (n: number) => {
      const fixed = n.toFixed(decimals)
      const withCommas = hasComma
        ? Number(fixed).toLocaleString('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          })
        : fixed
      return `${prefix}${withCommas}${suffix}`
    }

    const counter = { n: 0 }
    el.textContent = format(0)

    const anim = gsap.to(counter, {
      n: target,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        el.textContent = format(counter.n)
      },
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    })

    return () => {
      anim.scrollTrigger?.kill()
      anim.kill()
    }
  }, [value, duration])

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  )
}
