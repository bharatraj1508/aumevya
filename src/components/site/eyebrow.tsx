import { cn } from '@/lib/utils'

/**
 * Visual AI-style tag: a monospace pill with a leading dot and an optional
 * highlighted keyword chip. `tone="light"` is for use over dark imagery.
 */
export function Eyebrow({
  children,
  highlight,
  tone = 'dark',
  className,
}: {
  children: React.ReactNode
  highlight?: string
  tone?: 'dark' | 'light'
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[0.7rem] font-medium uppercase tracking-[0.16em]',
        tone === 'light'
          ? 'border-white/25 bg-white/10 text-primary-foreground/85'
          : 'border-border bg-card text-foreground/65',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn('size-1.5 rounded-full', tone === 'light' ? 'bg-primary-foreground' : 'bg-primary')}
      />
      {children}
      {highlight && (
        <span
          className={cn(
            'rounded-md px-1.5 py-0.5 font-semibold',
            tone === 'light' ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-primary/10 text-primary',
          )}
        >
          {highlight}
        </span>
      )}
    </span>
  )
}
