'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle, Send } from 'lucide-react'
import { contactSchema, type ContactInput } from '@/lib/schemas'
import { Field, HoneypotField } from './field'
import { FormSuccess } from './form-success'
import { useInquirySubmit } from './use-inquiry-submit'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

export function ContactForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactInput>({ resolver: zodResolver(contactSchema) })
  const { submit, status, error } = useInquirySubmit('/api/forms/contact')

  if (status === 'success') {
    return (
      <FormSuccess
        title="Message sent"
        message="Thank you for reaching out — we'll reply to your email soon."
      />
    )
  }

  return (
    <form onSubmit={handleSubmit(async (data) => void (await submit(data)))} className="space-y-5" noValidate>
      <HoneypotField register={register('company')} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" htmlFor="c-name" required error={errors.name?.message}>
          <Input id="c-name" {...register('name')} placeholder="Your name" />
        </Field>
        <Field label="Email" htmlFor="c-email" required error={errors.email?.message}>
          <Input id="c-email" type="email" {...register('email')} placeholder="you@email.com" />
        </Field>
      </div>
      <Field label="Phone" htmlFor="c-phone" error={errors.phone?.message}>
        <Input id="c-phone" {...register('phone')} placeholder="Optional" />
      </Field>
      <Field label="Message" htmlFor="c-msg" required error={errors.message?.message}>
        <Textarea id="c-msg" {...register('message')} placeholder="How can we help?" className="min-h-36" />
      </Field>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <Button type="submit" variant="accent" size="lg" disabled={status === 'submitting'} className="w-full sm:w-auto">
        {status === 'submitting' ? (
          <>
            <LoaderCircle className="animate-spin" /> Sending…
          </>
        ) : (
          <>
            Send Message <Send />
          </>
        )}
      </Button>
    </form>
  )
}
