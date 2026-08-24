'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle, Send } from 'lucide-react'
import { bookingSchema, type BookingInput } from '@/lib/schemas'
import { Field, HoneypotField } from './field'
import { FormSuccess, selectClass } from './form-success'
import { useInquirySubmit } from './use-inquiry-submit'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

export function BookingForm({
  services,
  defaultServiceId,
  lockService = false,
}: {
  services: { id: string; title: string }[]
  /** Preselect a retreat (used by the retreat detail booking card). */
  defaultServiceId?: string
  /** Hide the picker and lock the inquiry to `defaultServiceId`. */
  lockService?: boolean
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema),
    defaultValues: defaultServiceId ? { service: defaultServiceId } : undefined,
  })
  const lockedTitle = services.find((s) => s.id === defaultServiceId)?.title
  const { submit, status, error } = useInquirySubmit('/api/forms/booking')

  if (status === 'success') {
    return (
      <FormSuccess
        title="Request received"
        message="Thank you — we'll be in touch shortly to confirm your retreat."
      />
    )
  }

  return (
    <form onSubmit={handleSubmit(async (data) => void (await submit(data)))} className="space-y-5" noValidate>
      <HoneypotField register={register('company')} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" htmlFor="b-name" required error={errors.name?.message}>
          <Input id="b-name" {...register('name')} placeholder="Your name" />
        </Field>
        <Field label="Email" htmlFor="b-email" required error={errors.email?.message}>
          <Input id="b-email" type="email" {...register('email')} placeholder="you@email.com" />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Phone" htmlFor="b-phone" error={errors.phone?.message}>
          <Input id="b-phone" {...register('phone')} placeholder="Optional" />
        </Field>
        {lockService && lockedTitle ? (
          <Field label="Retreat of interest" htmlFor="b-service">
            <input type="hidden" {...register('service')} />
            <div
              id="b-service"
              className="flex h-11 items-center rounded-xl border border-border bg-muted px-3.5 text-sm font-medium text-foreground"
            >
              {lockedTitle}
            </div>
          </Field>
        ) : (
          <Field label="Retreat of interest" htmlFor="b-service">
            <select id="b-service" className={selectClass} {...register('service')}>
              <option value="">Any / not sure yet</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </Field>
        )}
      </div>
      <Field label="Preferred date / time" htmlFor="b-date" error={errors.preferredDate?.message}>
        <Input id="b-date" {...register('preferredDate')} placeholder="e.g. Weekday mornings" />
      </Field>
      <Field label="Anything else?" htmlFor="b-msg" error={errors.message?.message}>
        <Textarea id="b-msg" {...register('message')} placeholder="Tell us about your experience or goals (optional)" />
      </Field>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <Button type="submit" variant="accent" size="lg" disabled={status === 'submitting'} className="w-full sm:w-auto">
        {status === 'submitting' ? (
          <>
            <LoaderCircle className="animate-spin" /> Sending…
          </>
        ) : (
          <>
            Request Booking <Send />
          </>
        )}
      </Button>
    </form>
  )
}
