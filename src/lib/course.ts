import type { Course, Media } from '@/payload-types'
import { formatPrice } from '@/lib/retreat'

/** Card price label: "Free" when the price is 0, otherwise the ₹ amount. */
export function priceLabel(price?: number | null): string {
  if (price == null) return ''
  if (price <= 0) return 'Free'
  return formatPrice(price)
}

type RichTextDoc = Course['about']

/** A section on the course page. The admin picks its shape (a "block") in the
 * CMS; this is the normalised view the page renders. */
export type CourseSection =
  | { kind: 'content'; label: string; content: RichTextDoc }
  | {
      kind: 'itinerary'
      label: string
      intro?: string | null
      items: { id?: string | null; heading: string; description: string }[]
    }
  | {
      kind: 'gallery'
      label: string
      intro?: string | null
      items: {
        id?: string | null
        name: string
        price?: number | null
        image: string | Media
        description?: string | null
      }[]
    }
  | {
      kind: 'accommodation'
      label: string
      intro?: string | null
      items: {
        id?: string | null
        name: string
        image: string | Media
        description?: string | null
        /** Full price for this option (base price, plus any add-on). */
        total: number
        /** Extra added on top of the base price (0 when priced at base). */
        addOn: number
      }[]
    }

/** A rich-text document is only worth showing if it has real content —
 * a document of empty paragraphs would render blank space. */
export function hasRichText(doc: RichTextDoc): boolean {
  const children = doc?.root?.children
  if (!children?.length) return false
  return children.some(
    (node) => Array.isArray(node.children) && (node.children as unknown[]).length > 0,
  )
}

/** Normalise the admin's tab blocks into a flat list of sections, dropping any
 * that are empty. The "about" doc leads as the "Overview" section. */
export function buildCourseSections(course: Course): CourseSection[] {
  const sections: CourseSection[] = []
  if (hasRichText(course.about)) {
    sections.push({ kind: 'content', label: 'Overview', content: course.about })
  }
  for (const block of course.tabs ?? []) {
    if (!block.label?.trim()) continue
    if (block.blockType === 'contentTab') {
      if (hasRichText(block.content)) {
        sections.push({ kind: 'content', label: block.label, content: block.content })
      }
    } else if (block.blockType === 'itineraryTab') {
      if (block.items?.length) {
        sections.push({
          kind: 'itinerary',
          label: block.label,
          intro: block.intro,
          items: block.items,
        })
      }
    } else if (block.blockType === 'galleryTab') {
      if (block.items?.length) {
        sections.push({ kind: 'gallery', label: block.label, intro: block.intro, items: block.items })
      }
    } else if (block.blockType === 'accommodationTab') {
      if (block.options?.length) {
        sections.push({
          kind: 'accommodation',
          label: block.label,
          intro: block.intro,
          items: block.options.map((opt) => {
            const addOn = opt.priceMode === 'addon' ? (opt.addOn ?? 0) : 0
            return {
              id: opt.id,
              name: opt.name,
              image: opt.image,
              description: opt.description,
              addOn,
              total: course.price + addOn,
            }
          }),
        })
      }
    }
  }
  return sections
}

/** A stable, URL-safe id for a section, used for the journey-rail anchors. */
export function sectionId(index: number, label: string): string {
  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return `s${index + 1}-${slug || 'section'}`
}
