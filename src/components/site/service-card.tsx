import Link from 'next/link'
import { ArrowUpRight, Clock, MapPin } from 'lucide-react'
import type { Service } from '@/payload-types'
import { MediaImage } from './media-image'

export function ServiceCard({ service }: { service: Service }) {
  return (
    <Link
      href="/services"
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <MediaImage
          media={service.image}
          fill
          sizes="(min-width: 768px) 33vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <span className="absolute left-4 top-4 rounded-full bg-background/85 px-3 py-1 text-xs font-medium text-foreground backdrop-blur">
          {service.level}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        {service.location && (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-accent">
            <MapPin className="size-3.5" />
            {service.location}
          </span>
        )}
        <div className="mt-1 flex items-start justify-between gap-3">
          <h3 className="text-xl">{service.title}</h3>
          <ArrowUpRight className="mt-1 size-5 shrink-0 text-muted-foreground transition-colors group-hover:text-accent" />
        </div>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {service.summary}
        </p>
        {service.duration && (
          <span className="mt-4 inline-flex items-center gap-1.5 border-t border-border/70 pt-4 text-xs text-muted-foreground">
            <Clock className="size-3.5" />
            {service.duration}
          </span>
        )}
      </div>
    </Link>
  )
}
