import type { CSSProperties } from 'react'
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
   * Full crop style (object-position plus an optional zoom/rotation transform)
   * from `cropStyle()`. The container must be `overflow: hidden` so the
   * transform's overflow is clipped. Harmless for object-contain.
   */
  cropStyle?: CSSProperties
}

/** Renders a Payload media relationship via next/image, with a graceful fallback. */
export function MediaImage({
  media,
  className,
  sizes,
  priority,
  fill,
  alt,
  cropStyle,
}: MediaImageProps) {
  const url = mediaURL(media)
  if (!url) {
    return <div aria-hidden className={cn('bg-muted', className)} />
  }
  const altText = alt ?? mediaAlt(media)
  const style: CSSProperties | undefined = cropStyle

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
