import type { Metadata } from 'next'
import { ComingSoon } from '@/components/site/coming-soon'

export const metadata: Metadata = { title: 'Guidance' }

export default function GuidancePage() {
  return (
    <ComingSoon
      title="Guidance"
      description="Personalised mentorship, one-on-one sessions and expert direction to deepen your practice. This space is on its way."
    />
  )
}
