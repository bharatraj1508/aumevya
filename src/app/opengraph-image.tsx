import { ImageResponse } from 'next/og'

// Generated social-share card, used whenever a route doesn't supply its own
// raster OG image (see the CMS-image fallback in (frontend)/layout.tsx). Served
// as a real PNG, which social platforms render reliably — unlike an SVG.
export const alt = 'Aumevya — Yoga Retreats'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          color: '#fff',
          fontFamily: 'sans-serif',
          background:
            'linear-gradient(135deg, #2a1206 0%, #7a2600 45%, #d64500 100%)',
        }}
      >
        <div
          style={{
            fontSize: 34,
            letterSpacing: 8,
            textTransform: 'uppercase',
            opacity: 0.85,
          }}
        >
          Aumevya
        </div>
        <div style={{ fontSize: 78, fontWeight: 800, lineHeight: 1.05, marginTop: 24 }}>
          Yoga Retreats to Unplug, De-stress &amp; Recharge
        </div>
        <div style={{ fontSize: 30, opacity: 0.9, marginTop: 28 }}>
          Handpicked Hatha, Vinyasa, meditation &amp; Ayurveda retreats — for every level.
        </div>
      </div>
    ),
    { ...size },
  )
}
