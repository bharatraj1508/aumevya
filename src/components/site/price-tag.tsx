import type { PriceDisplay } from '@/lib/retreat'
import { cn } from '@/lib/utils'

const PRICE_SIZE = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-3xl',
} as const

/**
 * Amazon-style price: the struck-through original and a "% OFF" tag appear only
 * when the product is discounted; otherwise it's just the price. `size` scales
 * the effective-price text; callers keep any surrounding labels ("from", "/person").
 */
export function PriceTag({
  display,
  size = 'md',
  className,
}: {
  display: PriceDisplay
  size?: keyof typeof PRICE_SIZE
  className?: string
}) {
  return (
    <span className={cn('inline-flex flex-col leading-tight', className)}>
      {display.originalLabel && (
        <span className="text-xs text-muted-foreground line-through">{display.originalLabel}</span>
      )}
      <span className="inline-flex items-baseline gap-2">
        <span className={cn(PRICE_SIZE[size], 'font-bold text-foreground')}>
          {display.priceLabel}
        </span>
        {display.discountPercent != null && (
          <span className="text-xs font-semibold text-primary">{display.discountPercent}% OFF</span>
        )}
      </span>
    </span>
  )
}
