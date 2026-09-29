import 'server-only'
import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Config } from '@/payload-types'

// Client-safe media helpers live in ./media (this module is server-only).
export { mediaURL, mediaAlt, mediaDimensions } from './media'

type Globals = Config['globals']
type Collections = Config['collections']

// How long a CMS read stays cached across requests. The public site keeps
// `force-dynamic` (so builds never touch the DB), but without a data cache
// every request re-queries Mongo — that was the ~1s TTFB. Caching the query
// results means the DB is hit at most once per window instead of per request.
// Admin edits appear within this window; drop it or wire `revalidateTag`
// ('payload') into collection hooks if you need instant propagation.
const DATA_REVALIDATE = 60

export const getPayloadClient = cache(async () => getPayload({ config }))

export const getGlobal = cache(
  async <T extends keyof Globals>(slug: T): Promise<Globals[T]> => {
    const load = unstable_cache(
      async () => {
        const payload = await getPayloadClient()
        return payload.findGlobal({ slug: slug as never, depth: 2 })
      },
      ['global', String(slug)],
      { revalidate: DATA_REVALIDATE, tags: ['payload', `global:${String(slug)}`] },
    )
    return (await load()) as Globals[T]
  },
)

export const getDocs = cache(
  async <T extends keyof Collections>(
    collection: T,
    opts?: { where?: Record<string, unknown>; limit?: number; sort?: string },
  ): Promise<Collections[T][]> => {
    const load = unstable_cache(
      async () => {
        const payload = await getPayloadClient()
        const res = await payload.find({
          collection: collection as never,
          depth: 2,
          limit: opts?.limit ?? 100,
          sort: opts?.sort,
          where: opts?.where as never,
        })
        return res.docs
      },
      ['docs', String(collection), JSON.stringify(opts ?? {})],
      { revalidate: DATA_REVALIDATE, tags: ['payload', `collection:${String(collection)}`] },
    )
    return (await load()) as Collections[T][]
  },
)

