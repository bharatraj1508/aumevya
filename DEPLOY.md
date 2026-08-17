# Deployment — Vercel

The app is a single Next.js 15 project with Payload 3 embedded. Deploying the Next app deploys the site, the admin panel (`/admin`), and the API together.

## Prerequisites

1. **MongoDB Atlas** cluster (free M0 tier is fine for Phase 1).
   - Create a database user + password.
   - Network access: allow `0.0.0.0/0` (Vercel functions have dynamic IPs) or Vercel's IP ranges.
   - Copy the `mongodb+srv://...` connection string.
2. **Vercel account** with this repo connected (GitHub/GitLab/Bitbucket).

## Environment variables (set in Vercel → Project → Settings → Environment Variables)

| Variable | Notes |
|----------|-------|
| `DATABASE_URL` | Atlas `mongodb+srv://` connection string. |
| `PAYLOAD_SECRET` | Generate with `openssl rand -hex 32`. Keep stable — changing it invalidates sessions. |
| `NEXT_PUBLIC_SERVER_URL` | Production URL, e.g. `https://aumevya.vercel.app` (or the custom domain). |

Media-storage and email vars are added when those features are wired (see `.env.example`).

## Notes

- **Connection handling:** Payload manages its own MongoDB connection lifecycle and caches it across serverless invocations via `getPayload` — no manual global-connection caching needed.
- **Build command:** `npm run build` (Vercel auto-detects Next.js). **Install:** `npm install`.
- **Node:** use **Node 22 LTS** (`.nvmrc` pins `22`; `engines` requires `>=22.4.0`). Set Vercel's Node version to **22.x**. Node 25 (non-LTS "Current") ships the experimental Web Storage globals that crash server rendering; the npm scripts pass `--no-experimental-webstorage` to stay safe if you run Node 25 locally, but Node 22 LTS is the supported target.
- **Media on Vercel:** Phase 1 currently uses **local disk** storage (`<project-root>/media`), which works locally but does **not** persist on Vercel (ephemeral filesystem) — files vanish on each deploy/restart. Before production launch, set the three `CLOUDINARY_*` env vars; the Cloudinary plugin is already wired and activates automatically with no code change. See `ARCHITECTURE.md` Media rows.
- **First deploy:** after the first successful deploy, open `/admin` on the production URL to create the initial admin user (Payload shows a create-first-user screen when the users collection is empty).

## Local development

```bash
cp .env.example .env      # fill DATABASE_URL + PAYLOAD_SECRET
npm install
npm run dev               # http://localhost:3000  (admin at /admin)
```
