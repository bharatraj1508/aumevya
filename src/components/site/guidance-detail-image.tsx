import { cropStyle, type CropMap } from '@/lib/crops'
import { MediaImage } from '@/components/site/media-image'

/** The large portrait consultation image in the left column of the guidance page. */
export function GuidanceDetailImage({
  media,
  cropMap,
  title,
}: {
  media: unknown
  cropMap: CropMap
  title: string
}) {
  return (
    <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-muted">
      <MediaImage
        media={media}
        fill
        priority
        sizes="(min-width: 1024px) 40vw, 100vw"
        alt={title}
        cropStyle={cropStyle(cropMap, 'detail')}
        className="object-cover"
      />
    </div>
  )
}
