'use client'

import { Check } from 'lucide-react'
import type { SessionPackage } from '@/lib/guidance'
import { cn } from '@/lib/utils'

const BADGE_LABEL: Record<NonNullable<SessionPackage['badge']>, string> = {
  'most-popular': 'Most Popular',
  'best-value': 'Best Value',
}

/** One selectable session-package card (radio). Mirrors the accommodation-card pattern. */
export function SessionPackageCard({
  pkg,
  selected,
  onSelect,
}: {
  pkg: SessionPackage
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        'relative w-full rounded-2xl border bg-card p-5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        selected ? 'border-primary ring-2 ring-primary/25' : 'border-border hover:border-primary/40',
      )}
    >
      {pkg.badge && (
        <span
          className={cn(
            'absolute right-4 top-4 rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide',
            pkg.badge === 'most-popular'
              ? 'bg-primary/10 text-primary'
              : 'bg-accent/15 text-accent-foreground',
          )}
        >
          {BADGE_LABEL[pkg.badge]}
        </span>
      )}

      <div className="flex items-start justify-between gap-4 pr-24">
        <div className="min-w-0">
          <h3 className="text-lg font-bold leading-tight tracking-tight">{pkg.name}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">{pkg.durationLabel} session</p>
        </div>
        <div className="shrink-0 text-right leading-tight">
          {pkg.originalPriceLabel && (
            <span className="block text-xs text-muted-foreground line-through">
              {pkg.originalPriceLabel}
            </span>
          )}
          <span className="text-xl font-bold text-foreground">{pkg.priceLabel}</span>
          {pkg.discountPercent != null && (
            <span className="block text-xs font-semibold text-primary">
              {pkg.discountPercent}% OFF
            </span>
          )}
        </div>
      </div>

      {pkg.tagline && <p className="mt-2 text-sm text-muted-foreground">{pkg.tagline}</p>}

      {pkg.features.length > 0 && (
        <ul className="mt-4 space-y-2 border-t border-border pt-4">
          {pkg.features.map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-[15px] leading-relaxed">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      )}
    </button>
  )
}
