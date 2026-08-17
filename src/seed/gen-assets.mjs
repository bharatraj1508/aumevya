// Generates self-contained SVG placeholder art for seeding (no external deps/network).
// Calm yoga palette. Run: node src/seed/gen-assets.mjs
import { mkdirSync, writeFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'assets')
mkdirSync(dir, { recursive: true })

const write = (name, svg) => writeFileSync(path.join(dir, name), svg.trim() + '\n')

const lotus = (cx, cy, r, color, opacity = 0.9) => {
  const petals = []
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4
    const x = cx + Math.cos(a) * r * 0.1
    const y = cy + Math.sin(a) * r * 0.1
    petals.push(
      `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(r * 0.22).toFixed(1)}" ry="${r.toFixed(1)}" fill="${color}" opacity="${opacity}" transform="rotate(${(a * 180) / Math.PI} ${x.toFixed(1)} ${y.toFixed(1)})"/>`,
    )
  }
  return `<g>${petals.join('')}</g>`
}

const grain = `
<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope="0.05"/></feComponentTransfer><feComposite operator="over" in2="SourceGraphic"/></filter>`

const scene = (w, h, stops, sun, motifColor) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      ${stops.map((s, i) => `<stop offset="${(i / (stops.length - 1)).toFixed(2)}" stop-color="${s}"/>`).join('')}
    </linearGradient>
    <radialGradient id="sun" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${sun}" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="${sun}" stop-opacity="0"/>
    </radialGradient>
    ${grain}
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <circle cx="${w * 0.5}" cy="${h * 0.42}" r="${h * 0.5}" fill="url(#sun)"/>
  <circle cx="${w * 0.5}" cy="${h * 0.42}" r="${h * 0.11}" fill="${sun}" opacity="0.55"/>
  <g opacity="0.5"><path d="M0 ${h * 0.8} Q ${w * 0.25} ${h * 0.66}, ${w * 0.5} ${h * 0.78} T ${w} ${h * 0.76} V ${h} H 0 Z" fill="${motifColor}" opacity="0.35"/>
  <path d="M0 ${h * 0.88} Q ${w * 0.3} ${h * 0.78}, ${w * 0.6} ${h * 0.86} T ${w} ${h * 0.85} V ${h} H 0 Z" fill="${motifColor}" opacity="0.55"/></g>
  <rect width="${w}" height="${h}" filter="url(#grain)" opacity="0.6"/>
</svg>`

const card = (w, h, stops, motifColor, label) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    ${stops.map((s, i) => `<stop offset="${(i / (stops.length - 1)).toFixed(2)}" stop-color="${s}"/>`).join('')}
  </linearGradient>${grain}</defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  ${lotus(w * 0.5, h * 0.46, Math.min(w, h) * 0.16, motifColor, 0.5)}
  <circle cx="${w * 0.5}" cy="${h * 0.46}" r="${Math.min(w, h) * 0.05}" fill="${motifColor}" opacity="0.8"/>
  ${label ? `<text x="${w * 0.5}" y="${h * 0.82}" text-anchor="middle" font-family="Georgia, serif" font-size="${Math.round(h * 0.08)}" fill="#ffffff" opacity="0.85">${label}</text>` : ''}
  <rect width="${w}" height="${h}" filter="url(#grain)" opacity="0.5"/>
</svg>`

const avatar = (initial, stops) => `
<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
  <defs><linearGradient id="a" x1="0" y1="0" x2="1" y2="1">
    ${stops.map((s, i) => `<stop offset="${i}" stop-color="${s}"/>`).join('')}
  </linearGradient></defs>
  <rect width="240" height="240" fill="url(#a)"/>
  <text x="120" y="120" dy="0.36em" text-anchor="middle" font-family="Georgia, serif" font-size="110" fill="#ffffff" opacity="0.9">${initial}</text>
</svg>`

// Hero — dawn
write('hero.svg', scene(1920, 1080, ['#1f2a44', '#6b5b7b', '#c98a72', '#e9c9a8'], '#f6d9a0', '#2b3a2f'))
// About — soft sage/sand
write('about.svg', scene(1200, 1400, ['#3a4a3f', '#7c8b6f', '#c9c2a8', '#efe6d2'], '#f3e6c4', '#3a4a3f'))
// OG image
write('og.svg', card(1200, 630, ['#2b3a2f', '#6b7f63', '#c98a72'], '#f6d9a0', 'Aumevya Yoga'))

// Services
write('service-hatha.svg', card(1000, 750, ['#4b5d67', '#7c9aa6', '#cfe0e4'], '#eaf3f4', 'Hatha'))
write('service-vinyasa.svg', card(1000, 750, ['#7a4b52', '#c98a72', '#f0cdb6'], '#fff0e2', 'Vinyasa'))
write('service-meditation.svg', card(1000, 750, ['#3a4a3f', '#6b7f63', '#bcc8a6'], '#eef2df', 'Meditation'))
write('service-prenatal.svg', card(1000, 750, ['#5a4b6b', '#9184a6', '#d6cee0'], '#f2eef7', 'Prenatal'))

// Gallery
const galleryPalettes = [
  ['#26323b', '#5c7482', '#b9cdd4'],
  ['#5a3f3f', '#b07a6a', '#e6c3b0'],
  ['#33402f', '#6f8560', '#c2cfa8'],
  ['#3c3350', '#7c6f96', '#cdc3df'],
  ['#2c4048', '#5e8790', '#bcd6d6'],
  ['#5f4a33', '#b08a5e', '#e6cfa8'],
]
galleryPalettes.forEach((p, i) => write(`gallery-${i + 1}.svg`, card(1000, 1000, p, '#ffffff', '')))

// Avatars
write('avatar-1.svg', avatar('A', ['#6b7f63', '#c9c2a8']))
write('avatar-2.svg', avatar('R', ['#c98a72', '#f0cdb6']))
write('avatar-3.svg', avatar('M', ['#7c9aa6', '#cfe0e4']))

console.log('Generated SVG assets in', dir)
