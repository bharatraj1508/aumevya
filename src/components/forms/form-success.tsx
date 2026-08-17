import { Check } from 'lucide-react'

export function FormSuccess({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-10 text-center shadow-sm">
      <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Check className="size-7" />
      </div>
      <h3 className="mt-4 text-xl">{title}</h3>
      <p className="mt-2 max-w-sm text-muted-foreground">{message}</p>
    </div>
  )
}

export const selectClass =
  'flex h-11 w-full rounded-xl border border-input bg-card px-4 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
