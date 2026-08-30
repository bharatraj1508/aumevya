'use client'

import { FieldLabel, useField } from '@payloadcms/ui'
import type { TextFieldClientComponent } from 'payload'

/**
 * Admin field component for the Theme global. Renders a native color picker
 * swatch (plus a read-only hex readout) instead of a plain text input, so
 * editors pick colors visually. The stored value is still a hex string, so the
 * field stays `type: 'text'` in the config.
 */
export const ColorPickerField: TextFieldClientComponent = ({ field, path }) => {
  const { value, setValue } = useField<string>({ path })
  const current = value || '#d64500'
  const description =
    typeof field?.admin?.description === 'string' ? field.admin.description : undefined

  return (
    <div className="field-type text">
      <FieldLabel label={field?.label} required={field?.required} path={path} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <input
          type="color"
          aria-label={typeof field?.label === 'string' ? field.label : 'Color'}
          value={current}
          onChange={(e) => setValue(e.target.value)}
          style={{
            width: 48,
            height: 40,
            padding: 2,
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: 'var(--style-radius-s, 4px)',
            background: 'var(--theme-input-bg)',
            cursor: 'pointer',
          }}
        />
        <code
          style={{
            fontSize: '0.9rem',
            textTransform: 'uppercase',
            color: 'var(--theme-elevation-600)',
          }}
        >
          {current}
        </code>
      </div>
      {description && <div className="field-description">{description}</div>}
    </div>
  )
}

export default ColorPickerField
