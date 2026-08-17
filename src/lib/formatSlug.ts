import type { FieldHook } from 'payload'

export const slugify = (val: string): string =>
  val
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')

/**
 * Field hook that derives a slug from `fallback` (e.g. "title") when the slug
 * field is left empty. Keeps a manually-entered slug untouched.
 */
export const formatSlug =
  (fallback: string): FieldHook =>
  ({ value, originalDoc, data }) => {
    if (typeof value === 'string' && value.length > 0) return slugify(value)
    const source = data?.[fallback] ?? originalDoc?.[fallback]
    if (typeof source === 'string' && source.length > 0) return slugify(source)
    return value
  }
