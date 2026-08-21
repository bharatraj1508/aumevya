'use client'

import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Grip, X } from 'lucide-react'
import type { Retreat } from '@/payload-types'
import { MediaImage } from '@/components/site/media-image'

type Img = Retreat['images'][number]

export function Gallery({ images, title }: { images: Img[]; title: string }) {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)
  const count = images.length

  const show = useCallback(
    (i: number) => {
      setIndex(((i % count) + count) % count)
      setOpen(true)
    },
    [count],
  )

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % count)
      if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + count) % count)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, count])

  if (count === 0) return null

  const rest = images.slice(1, 5)

  return (
    <>
      {/* Collage: one large lead image + up to four supporting tiles */}
      <div className="grid gap-2 overflow-hidden rounded-2xl md:h-[26rem] md:grid-cols-2">
        <button
          type="button"
          onClick={() => show(0)}
          className="group relative aspect-[4/3] w-full overflow-hidden md:aspect-auto md:h-full"
          aria-label="Open photo 1"
        >
          <MediaImage
            media={images[0]}
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </button>

        {rest.length > 0 && (
          <div className="hidden grid-cols-2 gap-2 md:grid">
            {rest.map((img, i) => (
              <button
                type="button"
                key={i}
                onClick={() => show(i + 1)}
                className="group relative h-full w-full overflow-hidden"
                aria-label={`Open photo ${i + 2}`}
              >
                <MediaImage
                  media={img}
                  fill
                  sizes="25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {i === rest.length - 1 && count > 5 && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-lg font-semibold text-white">
                    +{count - 5}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => show(0)}
        className="mt-3 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold shadow-sm transition-colors hover:bg-muted"
      >
        <Grip className="size-4" />
        Show all {count} photos
      </button>

      {/* Lightbox */}
      {open && (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`${title} photos`}
        >
          <div className="flex items-center justify-between px-4 py-4 text-white/90 sm:px-6">
            <span className="text-sm font-medium">
              {index + 1} / {count}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-white/10"
              aria-label="Close gallery"
            >
              <X className="size-5" />
            </button>
          </div>
          <div className="relative flex flex-1 items-center justify-center px-4 pb-8 sm:px-16">
            <MediaImage
              media={images[index]}
              fill
              sizes="100vw"
              className="!relative !h-auto !max-h-full !w-auto max-w-full object-contain"
            />
            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setIndex((i) => (i - 1 + count) % count)}
                  className="absolute left-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-6"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="size-6" />
                </button>
                <button
                  type="button"
                  onClick={() => setIndex((i) => (i + 1) % count)}
                  className="absolute right-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-6"
                  aria-label="Next photo"
                >
                  <ChevronRight className="size-6" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
