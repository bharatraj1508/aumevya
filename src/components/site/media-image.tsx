import Image from 'next/image'
import { mediaAlt, mediaDimensions, mediaURL } from '@/lib/media'
import { cn } from '@/lib/utils'

type MediaImageProps = {
  media: unknown
  className?: string
  sizes?: string
  priority?: boolean
  fill?: boolean
  alt?: string
  /**
   * CSS object-position (e.g. "30% 70%") for cover-fit crops. Lets callers pin
   * which part of the photo stays visible; harmless for object-contain.
   */
  objectPosition?: string
}

/** Renders a Payload media relationship via next/image, with a graceful fallback. */
export function MediaImage({
  media,
  className,
  sizes,
  priority,
  fill,
  alt,
  objectPosition,
}: MediaImageProps) {
  const url = mediaURL(media)
  if (!url) {
    return <div aria-hidden className={cn('bg-muted', className)} />
  }
  const altText = alt ?? mediaAlt(media)
  const style = objectPosition ? { objectPosition } : undefined

  if (fill) {
    return (
      <Image
        src={url}
        alt={altText}
        fill
        sizes={sizes ?? '100vw'}
        priority={priority}
        className={className}
        style={style}
      />
    )
  }

  const { width, height } = mediaDimensions(media)
  return (
    <Image
      src={url}
      alt={altText}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      className={className}
      style={style}
    />
  )
}
