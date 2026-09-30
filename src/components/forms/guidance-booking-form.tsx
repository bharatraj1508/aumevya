'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle, Send } from 'lucide-react'
import { guidanceBookingSchema, type GuidanceBookingInput } from '@/lib/schemas'
import type { GuidanceSlot, OpenDate } from '@/lib/guidance'
import { cn } from '@/lib/utils'
import { Field, HoneypotField } from './field'
import { FormSuccess } from './form-success'
import { GuidanceDatePicker } from './guidance-date-picker'
import { useInquirySubmit } from './use-inquiry-submit'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

export function GuidanceBookingForm({
  slots,
  openDates,
  guidanceSlug,
}: {
  slots: GuidanceSlot[]
  openDates: OpenDate[]
  /** Slug of the guidance session being booked, submitted with the request. */
  guidanceSlug?: string
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<GuidanceBookingInput>({
    resolver: zodResolver(guidanceBookingSchema),
    defaultValues: { guidance: guidanceSlug ?? '', bookingDate: '', slot: '' },
  })

  const { submit, status, error } = useInquirySubmit('/api/forms/guidance')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')

  if (status === 'success') {
    return (
      <FormSuccess
        title="Booking received"
        message="Thank you — we'll be in touch shortly to confirm your session."
      />
    )
  }

  const noAvailability = slots.length === 0 || openDates.length === 0
  if (noAvailability) {
    return (
      <p className="text-sm text-muted-foreground">
        Booking isn&apos;t open at the moment. Please check back soon or reach out through our
        contact page.
      </p>
    )
  }

  const pickDate = (value: string) => {
    setSelectedDate(value)
    setValue('bookingDate', value, { shouldValidate: true })
  }
  const pickSlot = (title: string) => {
    setSelectedSlot(title)
    setValue('slot', title, { shouldValidate: true })
  }

  return (
    <form
      onSubmit={handleSubmit(async (data) => void (await submit(data)))}
      className="space-y-5"
      noValidate
    >
      <HoneypotField register={register('company')} />
      <input type="hidden" {...register('guidance')} />
      <input type="hidden" {...register('bookingDate')} />
      <input type="hidden" {...register('slot')} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" htmlFor="g-name" required error={errors.name?.message}>
          <Input id="g-name" {...register('name')} placeholder="Your name" />
        </Field>
        <Field label="Email" htmlFor="g-email" required error={errors.email?.message}>
          <Input id="g-email" type="email" {...register('email')} placeholder="you@email.com" />
        </Field>
      </div>
      <Field label="Phone" htmlFor="g-phone" error={errors.phone?.message}>
        <Input id="g-phone" {...register('phone')} placeholder="Optional" />
      </Field>

      {/* Calendar date picker — only open dates are selectable. */}
      <Field label="Choose a date" htmlFor="g-date" required error={errors.bookingDate?.message}>
        <GuidanceDatePicker openDates={openDates} value={selectedDate} onChange={pickDate} />
      </Field>

      {/* Slot picker. */}
      <Field label="Choose a time slot" htmlFor="g-slot" required error={errors.slot?.message}>
        <div id="g-slot" className="grid gap-3 sm:grid-cols-3">
          {slots.map((s) => (
            <button
              key={s.title}
              type="button"
              onClick={() => pickSlot(s.title)}
              aria-pressed={selectedSlot === s.title}
              className={cn(
                'rounded-xl border px-4 py-3 text-left transition-colors',
                selectedSlot === s.title
                  ? 'border-primary bg-primary/10 ring-1 ring-primary/30'
                  : 'border-border bg-card hover:border-primary/40 hover:bg-muted',
              )}
            >
              <span className="block font-semibold text-foreground">{s.title}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">{s.timeLabel}</span>
            </button>
          ))}
        </div>
      </Field>

      <Field label="Anything else?" htmlFor="g-msg" error={errors.message?.message}>
        <Textarea
          id="g-msg"
          {...register('message')}
          placeholder="Tell us what you'd like to focus on (optional)"
        />
      </Field>

      {error && <p className="text-sm text-red-700">{error}</p>}
      <Button
        type="submit"
        variant="accent"
        size="lg"
        disabled={status === 'submitting' || !watch('bookingDate') || !watch('slot')}
        className="w-full sm:w-auto"
      >
        {status === 'submitting' ? (
          <>
            <LoaderCircle className="animate-spin" /> Sending…
          </>
        ) : (
          <>
            Book Guidance <Send />
          </>
        )}
      </Button>
    </form>
  )
}
