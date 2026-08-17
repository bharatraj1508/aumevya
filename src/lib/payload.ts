import 'server-only'
import { cache } from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Config } from '@/payload-types'

// Client-safe media helpers live in ./media (this module is server-only).
export { mediaURL, mediaAlt, mediaDimensions } from './media'

type Globals = Config['globals']
type Collections = Config['collections']

export const getPayloadClient = cache(async () => getPayload({ config }))

export const getGlobal = cache(
  async <T extends keyof Globals>(slug: T): Promise<Globals[T]> => {
    const payload = await getPayloadClient()
    return (await payload.findGlobal({ slug: slug as never, depth: 2 })) as Globals[T]
  },
)

export const getDocs = cache(
  async <T extends keyof Collections>(
    collection: T,
    opts?: { where?: Record<string, unknown>; limit?: number; sort?: string },
  ): Promise<Collections[T][]> => {
    const payload = await getPayloadClient()
    const res = await payload.find({
      collection: collection as never,
      depth: 2,
      limit: opts?.limit ?? 100,
      sort: opts?.sort,
      where: opts?.where as never,
    })
    return res.docs as Collections[T][]
  },
)

