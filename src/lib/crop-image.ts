// Client-side image baking for the destructive Media editor. Takes the crop
// rectangle + rotation that react-easy-crop reports and renders the final
// pixels to a canvas, returning an encoded Blob ready to re-upload. Runs in the
// browser only (uses canvas); the source is same-origin so the canvas is not
// tainted.

export type PixelArea = { x: number; y: number; width: number; height: number }

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (e) => reject(e))
    image.crossOrigin = 'anonymous'
    image.src = url
  })

/** Bounding-box size of a w×h rectangle rotated by `deg` degrees. */
const rotateSize = (width: number, height: number, deg: number) => {
  const rad = (deg * Math.PI) / 180
  return {
    width: Math.abs(Math.cos(rad) * width) + Math.abs(Math.sin(rad) * height),
    height: Math.abs(Math.sin(rad) * width) + Math.abs(Math.cos(rad) * height),
  }
}

/**
 * Render the selected crop of `src` (after applying `rotation`) to a canvas and
 * return it as a Blob in `mimeType`. `pixelCrop` comes straight from
 * react-easy-crop's `onCropComplete` second argument.
 */
export async function getCroppedImageBlob(
  src: string,
  pixelCrop: PixelArea,
  rotation = 0,
  mimeType = 'image/jpeg',
  quality = 0.92,
): Promise<Blob> {
  const image = await createImage(src)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not get a 2D canvas context')

  const rotRad = (rotation * Math.PI) / 180
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(image.width, image.height, rotation)

  // Draw the full rotated image onto a bounding-box canvas…
  canvas.width = bBoxWidth
  canvas.height = bBoxHeight
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2)
  ctx.rotate(rotRad)
  ctx.translate(-image.width / 2, -image.height / 2)
  ctx.drawImage(image, 0, 0)

  // …then lift out just the crop rectangle and make it the canvas.
  const data = ctx.getImageData(pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height)
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height
  ctx.putImageData(data, 0, 0)

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Canvas export failed'))),
      mimeType,
      quality,
    )
  })
}
