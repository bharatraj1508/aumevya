import type { Metadata } from 'next'
import { ComingSoon } from '@/components/site/coming-soon'

export const metadata: Metadata = { title: 'Shop' }

export default function ShopPage() {
  return (
    <ComingSoon
      title="Shop"
      description="Thoughtfully curated essentials for your practice and wellbeing. Our store is opening soon — stay tuned."
    />
  )
}
