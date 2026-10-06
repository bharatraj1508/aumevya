'use client'

import { Fragment } from 'react'
import { Check } from 'lucide-react'
import type { GuidanceSlotCategory, SessionPackage, SlotCategory } from '@/lib/guidance'
import { cn } from '@/lib/utils'

const STEPS = ['Package', 'Schedule', 'Details'] as const

/** The Package · Schedule · Details progress indicator. `step` is 1-based. */
export function StepIndicator({ step }: { step: 1 | 2 | 3 }) {
  return (
    <nav aria-label="Booking steps" className="mb-6 flex items-center">
      {STEPS.map((label, i) => {
        const n = (i + 1) as 1 | 2 | 3
        const done = step > n
        const active = step === n
        return (
          <Fragment key={label}>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                  done || active
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground',
                )}
              >
                {done ? <Check className="size-3.5" /> : n}
              </span>
              <span
                className={cn(
                  'text-sm font-medium',
                  active ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && <div className="mx-3 h-px flex-1 bg-border" />}
          </Fragment>
        )
      })}
    </nav>
  )
}

/** Compact summary of the chosen package with a "Change" link back to step 1. */
export function SelectedPackageBar({
  pkg,
  onChange,
}: {
  pkg: SessionPackage
  onChange: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-muted/40 px-4 py-3">
      <div className="min-w-0">
        <p className="truncate font-semibold text-foreground">{pkg.name}</p>
        <p className="text-sm text-muted-foreground">
          {pkg.durationLabel} · {pkg.priceLabel}
        </p>
      </div>
      <button
        type="button"
        onClick={onChange}
        className="shrink-0 text-sm font-semibold text-primary hover:underline"
      >
        Change
      </button>
    </div>
  )
}

/** The discrete start times grouped under Morning / Afternoon / Evening. */
export function SlotGrid({
  categories,
  selectedCategory,
  selectedTime,
  onPick,
}: {
  categories: GuidanceSlotCategory[]
  selectedCategory: SlotCategory | null
  selectedTime: string | null
  onPick: (category: SlotCategory, rawTime: string) => void
}) {
  const withTimes = categories.filter((c) => c.times.length > 0)
  if (withTimes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No times available for this session yet.</p>
    )
  }

  return (
    <div className="space-y-4">
      {withTimes.map((cat) => (
        <div key={cat.category}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            {cat.label}
          </p>
          <div className="flex flex-wrap gap-2">
            {cat.times.map((t) => {
              const active = selectedCategory === cat.category && selectedTime === t.raw
              return (
                <button
                  key={t.raw}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onPick(cat.category, t.raw)}
                  className={cn(
                    'rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'border-primary bg-primary/10 text-foreground ring-1 ring-primary/30'
                      : 'border-border bg-card hover:border-primary/40 hover:bg-muted',
                  )}
                >
                  {t.label}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
