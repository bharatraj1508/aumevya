'use client'

import type { SessionPackage } from '@/lib/guidance'
import { Button } from '@/components/ui/button'
import { SessionPackageCard } from './session-package-card'

/** Step 1 of the booking flow: "Choose Your Session" — the package radiogroup + CTA. */
export function SessionPackageList({
  packages,
  selectedId,
  onSelect,
  onContinue,
}: {
  packages: SessionPackage[]
  selectedId: string | null
  onSelect: (id: string) => void
  onContinue: () => void
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Choose Your Session</h2>
      <p className="mt-2 text-muted-foreground">
        Pick the consultation depth that fits what you need right now.
      </p>

      <div role="radiogroup" aria-label="Choose a session package" className="mt-6 space-y-3">
        {packages.map((pkg) => (
          <SessionPackageCard
            key={pkg.id}
            pkg={pkg}
            selected={selectedId === pkg.id}
            onSelect={() => onSelect(pkg.id)}
          />
        ))}
      </div>

      <Button
        type="button"
        size="lg"
        className="mt-6 w-full rounded-full"
        disabled={!selectedId}
        onClick={onContinue}
      >
        Continue
      </Button>
    </div>
  )
}
