import { formatPrice } from '@/lib/retreat'

/** Card price label: "Free" when the price is 0, otherwise the ₹ amount. */
export function priceLabel(price?: number | null): string {
  if (price == null) return ''
  if (price <= 0) return 'Free'
  return formatPrice(price)
}
