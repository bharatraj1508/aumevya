import type { Metadata } from 'next'
import { ComingSoon } from '@/components/site/coming-soon'

export const metadata: Metadata = { title: 'Courses' }

export default function CoursesPage() {
  return (
    <ComingSoon
      title="Courses"
      description="Structured programs and immersive learning journeys, designed to guide you step by step. We’re putting the finishing touches on them."
    />
  )
}
