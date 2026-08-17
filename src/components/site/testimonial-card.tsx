import { Star } from 'lucide-react'
import type { Testimonial } from '@/payload-types'
import { MediaImage } from './media-image'

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const rating = testimonial.rating ?? 5
  return (
    <figure className="flex h-full flex-col rounded-2xl border border-border bg-card p-7 shadow-sm">
      <div className="flex gap-0.5 text-accent">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} className="size-4 fill-current" />
        ))}
      </div>
      <blockquote className="mt-4 flex-1 text-lg leading-relaxed text-foreground/90">
        “{testimonial.quote}”
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        <div className="relative size-11 overflow-hidden rounded-full bg-muted">
          <MediaImage media={testimonial.avatar} fill sizes="44px" className="object-cover" />
        </div>
        <div>
          <div className="font-medium text-foreground">{testimonial.name}</div>
          {testimonial.role && (
            <div className="text-sm text-muted-foreground">{testimonial.role}</div>
          )}
        </div>
      </figcaption>
    </figure>
  )
}
