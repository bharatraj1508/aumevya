import type { ReactNode } from 'react'
import { Label } from '@/components/ui/label'

export function Field({
  label,
  htmlFor,
  error,
  required,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <div>
      <Label htmlFor={htmlFor}>
        {label}
        {required && <span className="text-accent"> *</span>}
      </Label>
      <div className="mt-1.5">{children}</div>
      {error && <p className="mt-1.5 text-xs text-red-700">{error}</p>}
    </div>
  )
}

export function HoneypotField({ register }: { register: Record<string, unknown> }) {
  return (
    <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden" tabIndex={-1}>
      <label>
        Company
        <input type="text" tabIndex={-1} autoComplete="off" {...register} />
      </label>
    </div>
  )
}
