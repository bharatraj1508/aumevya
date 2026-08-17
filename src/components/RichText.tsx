import { RichText as LexicalRichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { cn } from '@/lib/utils'

export function RichText({
  data,
  className,
}: {
  data?: SerializedEditorState | null
  className?: string
}) {
  if (!data) return null
  return (
    <div className={cn('prose-content', className)}>
      <LexicalRichText data={data} />
    </div>
  )
}
