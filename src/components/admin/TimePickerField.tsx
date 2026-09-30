'use client'

import { FieldLabel, useField } from '@payloadcms/ui'
import type { TextFieldClientComponent } from 'payload'

/**
 * Admin field component for booking slot times. Renders a native time picker
 * (`<input type="time">`) but stores a plain "HH:MM" 24-hour string, so the
 * field stays `type: 'text'` and the value is timezone-safe (unlike Payload's
 * `date` timeOnly picker, which stores a full ISO timestamp).
 */
export const TimePickerField: TextFieldClientComponent = ({ field, path }) => {
  const { value, setValue } = useField<string>({ path })
  const description =
    typeof field?.admin?.description === 'string' ? field.admin.description : undefined

  return (
    <div className="field-type text">
      <FieldLabel label={field?.label} required={field?.required} path={path} />
      <input
        type="time"
        aria-label={typeof field?.label === 'string' ? field.label : 'Time'}
        value={value || ''}
        onChange={(e) => setValue(e.target.value)}
        style={{
          height: 40,
          padding: '0 0.75rem',
          border: '1px solid var(--theme-elevation-150)',
          borderRadius: 'var(--style-radius-s, 4px)',
          background: 'var(--theme-input-bg)',
          color: 'var(--theme-elevation-800)',
          cursor: 'pointer',
        }}
      />
      {description && <div className="field-description">{description}</div>}
    </div>
  )
}

export default TimePickerField
