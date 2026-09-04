import { cn } from '@/lib/utils'

/**
 * A horizontal spray-paint splatter centered behind the hero title — a dense
 * brushed band through the middle, a procedural fine-mist spray that fades out
 * toward the edges, scattered droplets, and a couple of drips running down.
 * Reads like the canvas was hit with a spray can.
 *
 * It animates itself on once, over ~5s, as if being sprayed across the canvas:
 * the band draws left-to-right, mist and droplets pop in staggered across the
 * width (as if the can is moving), then the drips run down. The animation is
 * pure CSS so it starts on first paint — it never waits for images to load —
 * and is skipped for `prefers-reduced-motion`.
 *
 * Built from SVG filters:
 *   - the mist is high-frequency turbulence thresholded into specks, clipped to
 *     an elliptical falloff so it's dense at the center and sparse at the edges,
 *   - the core band and drips are frayed by displacement so no edge is clean.
 *
 * The color is driven by the `--color-hero-brush` CSS variable (set from the
 * Theme global, defaulting to the primary color), so editors can recolor it
 * from the CMS.
 *
 * Purely decorative — sits behind the hero title across all breakpoints.
 */
export function BrushBackdrop({ className }: { className?: string }) {
  const brush = 'var(--color-hero-brush)'

  return (
    <svg
      aria-hidden
      viewBox="0 0 900 360"
      preserveAspectRatio="none"
      className={cn('brush-spray h-full w-full', className)}
    >
      <style>{`
        .brush-spray .band {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: brush-draw 2.6s ease-out forwards;
        }
        .brush-spray .band-2 { animation-duration: 2.9s; animation-delay: 0.25s; }
        .brush-spray .band-3 { animation-duration: 3s; animation-delay: 0.45s; }
        .brush-spray .mist { opacity: 0; animation: brush-fade 2.9s ease-out 0.15s forwards; }
        .brush-spray .drops { opacity: 0; }
        .brush-spray .drops-l { animation: brush-fade 1.3s ease-out 0.4s forwards; }
        .brush-spray .drops-c { animation: brush-fade 1.4s ease-out 1s forwards; }
        .brush-spray .drops-r { animation: brush-fade 1.4s ease-out 1.7s forwards; }
        .brush-spray .drips {
          opacity: 0;
          transform: scaleY(0);
          transform-box: fill-box;
          transform-origin: top;
          animation: brush-drip 1.6s ease-out 3.2s forwards;
        }
        @keyframes brush-draw { to { stroke-dashoffset: 0; } }
        @keyframes brush-fade { to { opacity: 1; } }
        @keyframes brush-drip {
          0% { opacity: 0; transform: scaleY(0); }
          25% { opacity: 1; }
          100% { opacity: 1; transform: scaleY(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .brush-spray .band,
          .brush-spray .mist,
          .brush-spray .drops,
          .brush-spray .drips {
            animation: none;
            opacity: 1;
            stroke-dashoffset: 0;
            transform: none;
          }
        }
      `}</style>

      <defs>
        {/* Elliptical falloff: opaque through the center, transparent at the
            edges — dense spray in the middle, mist at the extremes. */}
        <radialGradient id="hero-spray-fall" cx="50%" cy="50%" r="58%">
          <stop offset="0%" style={{ stopColor: brush, stopOpacity: 0.95 }} />
          <stop offset="45%" style={{ stopColor: brush, stopOpacity: 0.85 }} />
          <stop offset="100%" style={{ stopColor: brush, stopOpacity: 0 }} />
        </radialGradient>

        {/* Turn the falloff into scattered spray specks. */}
        <filter id="hero-spray" x="-10%" y="-20%" width="120%" height="140%">
          <feTurbulence
            type="turbulence"
            baseFrequency="0.085 0.11"
            numOctaves="2"
            seed="6"
            result="noise"
          />
          <feColorMatrix
            in="noise"
            type="matrix"
            values="0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 11 -5.4"
            result="specks"
          />
          {/* Keep specks only where the falloff is painted (center-weighted). */}
          <feComposite in="SourceGraphic" in2="specks" operator="in" />
        </filter>

        {/* Hand-drawn brushed band: fray the outline hard, erode speckles for
            grit, and keep a solid core so it stays a band, not a slab. */}
        <filter id="hero-band" x="-15%" y="-60%" width="130%" height="220%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.016 0.09"
            numOctaves="3"
            seed="4"
            result="bandNoise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="bandNoise"
            scale="30"
            xChannelSelector="R"
            yChannelSelector="G"
            result="frayed"
          />
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.13 0.14"
            numOctaves="3"
            seed="9"
            result="speck"
          />
          <feColorMatrix
            in="speck"
            type="matrix"
            values="0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 3.1 -0.7"
            result="speckMask"
          />
          <feComposite in="frayed" in2="speckMask" operator="in" result="speckled" />
          <feMorphology in="frayed" operator="erode" radius="6" result="core" />
          <feMerge>
            <feMergeNode in="speckled" />
            <feMergeNode in="core" />
          </feMerge>
        </filter>

        {/* Light fray for the thin drips (no erosion — it would eat them). */}
        <filter id="hero-fray" x="-15%" y="-40%" width="130%" height="180%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.02 0.08"
            numOctaves="3"
            seed="4"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="14"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>

      {/* Fine spray mist, densest at center. */}
      <rect
        className="mist"
        x="0"
        y="0"
        width="900"
        height="360"
        fill="url(#hero-spray-fall)"
        filter="url(#hero-spray)"
      />

      {/* Dense central band — the main swipe of paint, wobbling like a
          hand-drawn line, laid down in a few uneven passes. */}
      <g filter="url(#hero-band)" fill="none" strokeLinecap="round" style={{ stroke: brush }}>
        <path
          className="band"
          pathLength={100}
          d="M130 202 C206 150 292 252 396 206 C500 166 556 254 656 202 C714 172 772 232 800 196"
          strokeWidth="82"
        />
        <path
          className="band band-2"
          pathLength={100}
          d="M182 186 C272 150 360 232 470 194 C560 164 636 228 726 190"
          strokeWidth="34"
          opacity="0.45"
        />
        <path
          className="band band-3"
          pathLength={100}
          d="M224 222 C322 244 410 186 520 220 C612 246 690 198 758 224"
          strokeWidth="20"
          opacity="0.4"
        />
      </g>

      {/* Drips running down from the band, each ending in a bead. */}
      <g className="drips" filter="url(#hero-fray)" style={{ fill: brush, stroke: brush }} strokeLinecap="round">
        <path d="M330 206 L330 288" strokeWidth="6" fill="none" />
        <circle cx="330" cy="296" r="7" />
        <path d="M486 214 L486 312" strokeWidth="7" fill="none" />
        <circle cx="486" cy="320" r="8" />
        <path d="M612 202 L612 268" strokeWidth="5" fill="none" />
        <circle cx="612" cy="274" r="6" />
      </g>

      {/* Discrete droplets for character, grouped left/center/right so they pop
          in across the width like the can is sweeping. */}
      <g style={{ fill: brush }}>
        <g className="drops drops-l">
          <circle cx="250" cy="120" r="9" opacity="0.85" />
          <circle cx="150" cy="150" r="6" opacity="0.6" />
          <circle cx="120" cy="196" r="4" opacity="0.5" />
          <circle cx="96" cy="172" r="3" opacity="0.4" />
          <circle cx="185" cy="236" r="4" opacity="0.5" />
          <circle cx="300" cy="250" r="8" opacity="0.8" />
          <circle cx="270" cy="96" r="5" opacity="0.7" />
        </g>
        <g className="drops drops-c">
          <circle cx="410" cy="118" r="7" opacity="0.8" />
          <circle cx="470" cy="90" r="4" opacity="0.65" />
          <circle cx="560" cy="112" r="8" opacity="0.8" />
          <circle cx="400" cy="268" r="5" opacity="0.7" />
          <circle cx="520" cy="256" r="9" opacity="0.8" />
          <circle cx="600" cy="270" r="5" opacity="0.65" />
        </g>
        <g className="drops drops-r">
          <circle cx="620" cy="94" r="5" opacity="0.7" />
          <circle cx="690" cy="120" r="9" opacity="0.75" />
          <circle cx="660" cy="248" r="7" opacity="0.7" />
          <circle cx="760" cy="150" r="6" opacity="0.6" />
          <circle cx="800" cy="188" r="4" opacity="0.5" />
          <circle cx="828" cy="168" r="3" opacity="0.4" />
          <circle cx="726" cy="230" r="4" opacity="0.5" />
        </g>
      </g>
    </svg>
  )
}
