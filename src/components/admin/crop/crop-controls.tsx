'use client'

import { RotateCcw, RotateCw } from 'lucide-react'
import type { AspectOption } from '@/lib/crops'

// Shared control chrome for the crop editors — a rotate pair, a zoom slider, and
// an aspect-ratio selector. Styled with Payload admin CSS variables so it sits
// natively inside the field. Kept framework-light (plain inputs/buttons) to match
// the existing custom pointer-event editor.

const pill: React.CSSProperties = {
  padding: '3px 9px',
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 600,
  lineHeight: 1.4,
  border: '1px solid var(--theme-elevation-200)',
  background: 'var(--theme-elevation-0)',
  color: 'var(--theme-elevation-700)',
  cursor: 'pointer',
}

const pillActive: React.CSSProperties = {
  ...pill,
  border: '1px solid var(--theme-elevation-800)',
  background: 'var(--theme-elevation-800)',
  color: 'var(--theme-elevation-0)',
}

const iconBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 28,
  height: 28,
  borderRadius: 6,
  border: '1px solid var(--theme-elevation-200)',
  background: 'var(--theme-elevation-0)',
  color: 'var(--theme-elevation-700)',
  cursor: 'pointer',
}

/** Row of aspect-ratio pills; the active box drives the preview frame's shape. */
export function AspectSelector({
  options,
  selected,
  onSelect,
}: {
  options: AspectOption[]
  /** Active ratio value (number), or `null` for the free-form box. */
  selected: number | null
  onSelect: (value: number | null) => void
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
      {options.map((opt) => {
        const active =
          opt.value === null ? selected === null : selected != null && Math.abs(selected - opt.value) < 1e-4
        return (
          <button
            key={opt.label}
            type="button"
            onClick={() => onSelect(opt.value)}
            style={active ? pillActive : pill}
            title={opt.value === null ? 'Free-form crop box' : `${opt.label} crop box`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

/** Rotate pair + zoom slider for a single crop frame. */
export function CropControls({
  zoom,
  onZoomChange,
  onRotate,
}: {
  zoom: number
  onZoomChange: (zoom: number) => void
  onRotate: (deltaDeg: 90 | -90) => void
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', gap: 5 }}>
        <button type="button" style={iconBtn} onClick={() => onRotate(-90)} title="Rotate left">
          <RotateCcw size={15} />
        </button>
        <button type="button" style={iconBtn} onClick={() => onRotate(90)} title="Rotate right">
          <RotateCw size={15} />
        </button>
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 120 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--theme-elevation-600)' }}>
          Zoom
        </span>
        <input
          type="range"
          min={1}
          max={5}
          step={0.05}
          value={zoom}
          onChange={(e) => onZoomChange(Number(e.target.value))}
          style={{ flex: 1, cursor: 'pointer' }}
        />
        <span
          style={{
            fontSize: 11,
            fontVariantNumeric: 'tabular-nums',
            color: 'var(--theme-elevation-600)',
            minWidth: 30,
            textAlign: 'right',
          }}
        >
          {zoom.toFixed(2)}×
        </span>
      </label>
    </div>
  )
}
