'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { OpenDate } from '@/lib/guidance'

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const pad = (n: number) => String(n).padStart(2, '0')

/** Pretty label for the trigger, e.g. "Wed, 30 Sep 2026". */
function labelFor(value: string): string {
  const d = new Date(`${value}T00:00:00Z`)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

/**
 * A calendar popover for the booking form. Only the dates the admin opened (via
 * the Guidance Booking config) are selectable; every other day is disabled.
 * Paging is bounded to the months that actually contain open dates.
 */
export function GuidanceDatePicker({
  openDates,
  value,
  onChange,
}: {
  openDates: OpenDate[]
  value: string
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const openSet = useMemo(() => new Set(openDates.map((d) => d.value)), [openDates])

  // The months to page through — from the first open month to the last.
  const months = useMemo(() => {
    if (openDates.length === 0) return [] as { year: number; month: number; label: string }[]
    const values = openDates.map((d) => d.value).sort()
    const [fy, fm] = values[0].split('-').map(Number)
    const [ly, lm] = values[values.length - 1].split('-').map(Number)
    const out: { year: number; month: number; label: string }[] = []
    let y = fy
    let m = fm - 1 // 0-indexed month
    while (y < ly || (y === ly && m <= lm - 1)) {
      out.push({
        year: y,
        month: m,
        label: new Date(Date.UTC(y, m, 1)).toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
          timeZone: 'UTC',
        }),
      })
      m++
      if (m > 11) {
        m = 0
        y++
      }
    }
    return out
  }, [openDates])

  const findMonthIndex = (val: string) => {
    if (!val) return 0
    const [y, m] = val.split('-').map(Number)
    const idx = months.findIndex((mm) => mm.year === y && mm.month === m - 1)
    return idx >= 0 ? idx : 0
  }

  const [monthIdx, setMonthIdx] = useState(() => findMonthIndex(value))

  // On open, jump to the month of the current selection (or the first open one).
  useEffect(() => {
    if (open) setMonthIdx(findMonthIndex(value))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Close on an outside click.
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const current = months[monthIdx]
  const grid = useMemo(() => {
    if (!current) return [] as (string | null)[]
    const firstDow = new Date(Date.UTC(current.year, current.month, 1)).getUTCDay()
    const daysIn = new Date(Date.UTC(current.year, current.month + 1, 0)).getUTCDate()
    const cells: (string | null)[] = Array.from({ length: firstDow }, () => null)
    for (let d = 1; d <= daysIn; d++) {
      cells.push(`${current.year}-${pad(current.month + 1)}-${pad(d)}`)
    }
    return cells
  }, [current])

  if (openDates.length === 0) {
    return <p className="text-sm text-muted-foreground">No dates are currently open for booking.</p>
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex min-h-11 w-full items-center justify-between gap-2 rounded-xl border border-border bg-card px-3.5 py-2.5 text-left text-sm transition-colors hover:border-primary/40"
      >
        <span className={value ? 'font-medium text-foreground' : 'text-muted-foreground'}>
          {value ? labelFor(value) : 'Select a date'}
        </span>
        <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
      </button>

      {open && current && (
        <div
          role="dialog"
          className="absolute left-0 z-20 mt-2 w-[19rem] max-w-[calc(100vw-3rem)] rounded-2xl border border-border bg-card p-4 shadow-xl"
        >
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setMonthIdx((i) => Math.max(0, i - 1))}
              disabled={monthIdx === 0}
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted disabled:opacity-30"
              aria-label="Previous month"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="text-sm font-semibold">{current.label}</span>
            <button
              type="button"
              onClick={() => setMonthIdx((i) => Math.min(months.length - 1, i + 1))}
              disabled={monthIdx === months.length - 1}
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted disabled:opacity-30"
              aria-label="Next month"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {WEEKDAYS.map((w) => (
              <span key={w} className="py-1">
                {w}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {grid.map((cell, i) => {
              if (!cell) return <span key={`e${i}`} aria-hidden />
              const day = Number(cell.slice(-2))
              const selectable = openSet.has(cell)
              const selected = cell === value
              return (
                <button
                  key={cell}
                  type="button"
                  disabled={!selectable}
                  aria-pressed={selected}
                  onClick={() => {
                    onChange(cell)
                    setOpen(false)
                  }}
                  className={cn(
                    'flex aspect-square items-center justify-center rounded-lg text-sm transition-colors',
                    selected && 'bg-primary font-semibold text-primary-foreground',
                    !selected && selectable && 'text-foreground hover:bg-primary/10',
                    !selectable && 'cursor-not-allowed text-muted-foreground/30',
                  )}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
