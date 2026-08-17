# Aumevya Yoga

Portfolio website + admin CMS for Aumevya Yoga — built with **Next.js 15**, **Payload CMS 3**, **MongoDB**, **Tailwind CSS v4**, and a cinematic landing page (Lenis + Framer Motion + GSAP).

- **Public site:** `/` — landing, `/about`, `/services`, `/gallery`, `/testimonials`, `/contact`
- **Admin CMS:** `/admin` — every content block is editable
- **Forms:** Book-Now + Contact → saved to Payload + emailed to the admin

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the full design and [`DEPLOY.md`](./DEPLOY.md) for deployment.

## Requirements

- **Node 22 LTS** (`.nvmrc` pins `22`). Node 25 needs the `--no-experimental-webstorage` flag the scripts already pass.
- A MongoDB connection (Atlas for production; a local Mongo for dev).

## Local setup

```bash
nvm use                    # Node 22
cp .env.example .env       # fill DATABASE_URL + PAYLOAD_SECRET (openssl rand -hex 32)
npm install
npm run seed               # optional: load demo content + placeholder images
npm run dev                # http://localhost:3000  (admin at /admin)
```

On first run, open `/admin` to create the initial admin user.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Dev server |
| `npm run build` / `npm run start` | Production build / serve |
| `npm run seed` | Seed globals, services, testimonials, gallery + placeholder media |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run generate:types` | Regenerate `src/payload-types.ts` after content-model changes |
| `npm run generate:importmap` | Regenerate the admin import map |

## Media storage

Phase 1 uses **local disk** (`/media`, served at `/api/media/file/*`). This does **not** persist on Vercel (ephemeral filesystem). Set the `CLOUDINARY_*` env vars to activate the (already-wired) Cloudinary adapter before production launch — no code change needed.

## Content model

- **Globals:** `hero`, `about`, `contact-info`, `seo-defaults`, `cta`
- **Collections:** `services`, `testimonials`, `gallery`, `videos`, `inquiries`, `media`, `users`
