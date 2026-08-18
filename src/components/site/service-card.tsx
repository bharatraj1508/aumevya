import Link from 'next/link'
import { Clock, Heart, MapPin, Star } from 'lucide-react'
import type { Service } from '@/payload-types'
import { MediaImage } from './media-image'

export function ServiceCard({ service }: { service: Service }) {
  return (
    <Link
      href="/services"
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <MediaImage
          media={service.image}
          fill
          sizes="(min-width: 768px) 33vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {service.featured && (
          <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm">
            Featured
          </span>
        )}
        <span
          aria-hidden
          className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-card/90 text-foreground shadow-sm backdrop-blur transition-colors group-hover:text-primary"
        >
          <Heart className="size-4" />
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
          {service.location && (
            <span className="inline-flex items-center gap-1.5 truncate">
              <MapPin className="size-3.5 shrink-0 text-primary" />
              <span className="truncate">{service.location}</span>
            </span>
          )}
          {service.level && (
            <span className="shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground">
              {service.level}
            </span>
          )}
        </div>

        <h3 className="mt-2 line-clamp-2 text-lg font-semibold leading-snug">{service.title}</h3>

        {service.summary && (
          <p className="mt-1.5 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
            {service.summary}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
          <span className="inline-flex items-center gap-1 text-sm">
            <Star className="size-4 fill-accent text-accent" />
            <span className="font-bold text-foreground">5.0</span>
            <span className="text-muted-foreground">· New</span>
          </span>
          {service.duration && (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="size-3.5" />
              {service.duration}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
