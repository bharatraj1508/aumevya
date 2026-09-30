import type { GuidancePage } from '@/payload-types'
import { SectionCover } from '@/components/site/section-cover'

/** Guidance list-page cover — a thin wrapper over the shared {@link SectionCover}. */
export function GuidanceCover({ page }: { page: GuidancePage }) {
  return <SectionCover page={page} />
}
