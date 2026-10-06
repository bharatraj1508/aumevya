'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle, Send } from 'lucide-react'
import { guidanceDetailsSchema, type GuidanceDetailsInput } from '@/lib/schemas'
import type { GuidanceSlotCategory, OpenDate, SessionPackage, SlotCategory } from '@/lib/guidance'
import { Field, HoneypotField } from '@/components/forms/field'
import { FormSuccess } from '@/components/forms/form-success'
import { GuidanceDatePicker } from '@/components/forms/guidance-date-picker'
import { useInquirySubmit } from '@/components/forms/use-inquiry-submit'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { SessionPackageList } from './session-package-list'
import { SelectedPackageBar, SlotGrid, StepIndicator } from './booking-stepper'

type Step = 1 | 2 | 3 | 4

/**
 * Inline booking island for a guidance page. Replaces the old modal: the visitor
 * chooses a session package, then schedules a date + time, then leaves their
 * details — all in-place in the page's right column, as a 3-step flow.
 */
export function SessionBooking({
  guidanceSlug,
  packages,
  slotCategories,
  openDates,
}: {
  guidanceSlug: string
  packages: SessionPackage[]
  slotCategories: GuidanceSlotCategory[]
  openDates: OpenDate[]
}) {
  const [step, setStep] = useState<Step>(1)
  const [selectedId, setSelectedId] = useState<string | null>(packages[0]?.id ?? null)
  const [bookingDate, setBookingDate] = useState('')
  const [slotCategory, setSlotCategory] = useState<SlotCategory | null>(null)
  const [slotTime, setSlotTime] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GuidanceDetailsInput>({
    resolver: zodResolver(guidanceDetailsSchema),
    defaultValues: { name: '', email: '', phone: '', message: '', company: '' },
  })
  const { submit, status, error } = useInquirySubmit('/api/forms/guidance')

  const selectedPackage = packages.find((p) => p.id === selectedId) ?? null
  const hasOpenDates = openDates.length > 0
  const hasSlots = slotCategories.some((c) => c.times.length > 0)

  if (packages.length === 0) {
    return (
      <p className="text-muted-foreground">
        Booking for this session is being set up. Please check back soon or reach out through our
        contact page.
      </p>
    )
  }

  if (status === 'success' || step === 4) {
    return (
      <FormSuccess
        title="Booking requested"
        message="Thank you — we'll confirm your session shortly by email."
      />
    )
  }

  const onSubmit = handleSubmit(async (data) => {
    if (!selectedPackage || !slotCategory || !slotTime) return
    const ok = await submit({
      ...data,
      guidance: guidanceSlug,
      packageId: selectedPackage.id,
      bookingDate,
      slotCategory,
      slotTime,
    })
    if (ok) setStep(4)
  })

  // Step 1 — choose a session package.
  if (step === 1) {
    return (
      <SessionPackageList
        packages={packages}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onContinue={() => setStep(2)}
      />
    )
  }

  const indicatorStep: 2 | 3 = step === 3 ? 3 : 2

  return (
    <div>
      <StepIndicator step={indicatorStep} />
      {selectedPackage && (
        <div className="mb-6">
          <SelectedPackageBar pkg={selectedPackage} onChange={() => setStep(1)} />
        </div>
      )}

      {/* Step 2 — schedule a date + time. */}
      {step === 2 && (
        <div className="space-y-6">
          {!hasOpenDates && !hasSlots ? (
            <p className="text-sm text-muted-foreground">
              Booking isn&apos;t open for this session yet. Please check back soon.
            </p>
          ) : (
            <>
              <Field label="Choose a date" htmlFor="s-date" required>
                {hasOpenDates ? (
                  <GuidanceDatePicker
                    openDates={openDates}
                    value={bookingDate}
                    onChange={setBookingDate}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No dates are open for booking right now.
                  </p>
                )}
              </Field>
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">
                  Choose a start time
                  {selectedPackage && (
                    <span className="font-normal text-muted-foreground">
                      {' '}
                      · {selectedPackage.durationLabel} session
                    </span>
                  )}
                </p>
                <SlotGrid
                  categories={slotCategories}
                  selectedCategory={slotCategory}
                  selectedTime={slotTime}
                  onPick={(category, raw) => {
                    setSlotCategory(category)
                    setSlotTime(raw)
                  }}
                />
              </div>
            </>
          )}

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button
              type="button"
              className="flex-1"
              disabled={!bookingDate || !slotTime}
              onClick={() => setStep(3)}
            >
              Next: your details
            </Button>
          </div>
        </div>
      )}

      {/* Step 3 — contact details + submit. */}
      {step === 3 && (
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <HoneypotField register={register('company')} />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Name" htmlFor="b-name" required error={errors.name?.message}>
              <Input id="b-name" {...register('name')} placeholder="Your name" />
            </Field>
            <Field label="Email" htmlFor="b-email" required error={errors.email?.message}>
              <Input id="b-email" type="email" {...register('email')} placeholder="you@email.com" />
            </Field>
          </div>
          <Field label="Phone" htmlFor="b-phone" error={errors.phone?.message}>
            <Input id="b-phone" {...register('phone')} placeholder="Optional" />
          </Field>
          <Field label="Anything else?" htmlFor="b-msg" error={errors.message?.message}>
            <Textarea
              id="b-msg"
              {...register('message')}
              placeholder="Tell us what you'd like to focus on (optional)"
            />
          </Field>

          {error && <p className="text-sm text-red-700">{error}</p>}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={status === 'submitting'}
              onClick={() => setStep(2)}
            >
              Back
            </Button>
            <Button type="submit" variant="accent" className="flex-1" disabled={status === 'submitting'}>
              {status === 'submitting' ? (
                <>
                  <LoaderCircle className="animate-spin" /> Sending…
                </>
              ) : (
                <>
                  Request booking <Send />
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
