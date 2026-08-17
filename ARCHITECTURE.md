# Aumevya Yoga — Architecture

Source of truth for Phase 1 architecture, system design, and conventions.
Scope is fixed to the agreed ₹23,000 package. This document is a living reference — update it when a decision changes.

---

## 1. Scope

### Phase 1 (this build) — Portfolio + CMS, NO booking engine
Company portfolio website with an admin CMS. The "Book Now" button collects an **inquiry** and emails the admin — it does **not** create appointments.

- Landing page (animated showpiece), About, Services, Gallery, Testimonials, Contact
- Contact form + Book Now inquiry form → email notification to admin
- Admin CMS: every major content block editable; image + video management
- Fully responsive

### Phase 2 (future — architecture must not require a rewrite)
Booking system, calendar, availability, appointment approval, payments, WhatsApp notifications, customer accounts, analytics, AI chatbot.

**Guiding principle:** don't build Phase 2 now; don't block it either. Phase 2 = new entities and webhooks/jobs, all of which Next.js + Payload handle without a separate backend.

---

## 2. Stack (final)

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | **Next.js 15** (App Router) + TypeScript | Full-stack. No separate Express/Nest backend. |
| Styling | **Tailwind CSS** + **shadcn/ui** | Dev-owned design system. |
| CMS / data / API / admin auth | **Payload CMS 3** (`3.88.0`, embedded in Next) | IS the data + REST/GraphQL + admin + auth layer. |
| Framework versions | **Next `15.3.9`**, **React `19.2`** | Pinned to a Payload-supported Next 15 window. |
| Database | **MongoDB Atlas** (M0) via Payload Mongo adapter | Payload manages models — no hand-written Mongoose. |
| Media (now) | **Local disk** — `<project-root>/media`, served at `/api/media/file/<filename>` | Phase 1 default. `media/` is gitignored (tracked via `.gitkeep`). ⚠️ Vercel's filesystem is ephemeral, so local uploads do **not** persist in production — enable Cloudinary before launch. |
| Media (later) | **Cloudinary** via `@jhb.software/payload-cloudinary-plugin` (on official `@payloadcms/plugin-cloud-storage`) | Wired but dormant. Activates automatically when `CLOUDINARY_CLOUD_NAME`/`API_KEY`/`API_SECRET` are set — no code change. `clientUploads: true` (Vercel's 4.5MB server-upload cap). No official Payload Cloudinary adapter exists; this community adapter wraps the official cloud-storage plugin. |
| Email | **Nodemailer + Gmail SMTP** (via Payload email adapter) | Behind an adapter — swap to Resend in minutes if deliverability suffers. |
| Public forms | **Zod + React Hook Form** | Shared Zod schema, client + server. |
| Landing animation | **Lenis + Framer Motion + GSAP/ScrollTrigger** + Aceternity/Magic UI | Landing page only. Rest of site = plain shadcn. |
| Deploy | **Vercel** | |

### Deliberately NOT doing
Separate backend · Mongoose service/repository layers · custom admin UI · custom admin auth · block/page-builder CMS · RBAC · Docker · Redis · REST handlers for content the server renders itself.

> **Why Payload:** a hand-rolled admin CMS was ~40–60% of total effort. Payload provides admin UI, auth, media, validation, and auto-generated REST + GraphQL for free, inside the Next app, self-hosted (no lock-in). It replaces the planned Mongoose models, service layer, repository layer, custom auth, and custom content APIs.

---

## 3. Content model (Payload)

### Globals (singletons — exactly one of each)
- `hero` — headline, subtext, CTA text, background media
- `about` — rich text, images
- `contact-info` — address, phone, email, map, socials, hours
- `seo-defaults` — site title, description, OG image
- `cta` — reusable call-to-action text

### Collections (repeatable, ordered, publishable)
- `services` — title, description, image, `order`, `published`
- `testimonials` — name, quote, avatar, `order`, `published`
- `gallery` — image (Cloudinary), alt, caption, `order`
- `videos` — Cloudinary video / embed URL, title, `order`
- `media` — Payload built-in, backed by Cloudinary
- `inquiries` — see below
- `users` — Payload admin users (single admin seeded in Phase 1)

### `inquiries` collection (Phase 1 → Phase 2 bridge)
Handles both Book-Now and Contact submissions.

| Field | Purpose |
|-------|---------|
| `type` | `booking` \| `contact` |
| `name`, `email`, `phone`, `message` | submitted data |
| `service` (optional) | interest for booking inquiries |
| `status` | `new` \| `contacted` \| `archived` (Phase 1 sets `new`) |
| `notified` | boolean — was the admin email sent? |
| `createdAt` | timestamp |

Phase 2: `Booking` is a **new** entity (slots, payment, approval). Inquiries *convert into* bookings — inquiries are not mutated into them.

---

## 4. API surface

- **Content reads:** Server Components call Payload's **Local API** directly (no network hop).
- **Content writes:** Payload admin + its auto-generated REST/GraphQL.
- **Custom public endpoints (only these):**
  - `POST /api/inquiries` — validate (Zod) → save via Payload Local API → email admin → respond
  - `POST /api/contact` — same pattern
- **Inquiry rules:** save **before** emailing; email is best-effort (failure sets `notified: false` and is logged, never 500s the user). Honeypot + rate limiting on both endpoints.
- On-demand revalidation (`revalidatePath`/`revalidateTag`) fires from Payload `afterChange` hooks so published content busts the static cache immediately.

---

## 5. Folder structure (feature/vertical-slice)

```
src/
├── app/
│   ├── (public)/            # marketing site (RSC reads content via Payload Local API)
│   ├── (payload)/           # Payload admin (auto-mounted at /admin)
│   └── api/
│       ├── inquiries/       # POST — book-now
│       └── contact/         # POST — contact form
├── payload/
│   ├── collections/         # services, testimonials, gallery, videos, inquiries, users
│   ├── globals/             # hero, about, contact-info, seo-defaults, cta
│   └── payload.config.ts
├── features/
│   ├── landing/             # animated sections (Lenis/Framer/GSAP), landing-only
│   ├── inquiries/           # Zod schema, form, submit action
│   └── contact/
├── components/ui/           # shadcn primitives (dev-owned design system)
├── lib/                     # cloudinary, email, revalidation, rate-limit, env (Zod-validated)
└── types/
```

**`lib/` trap:** keep it to genuine cross-cutting infra. If it grows, a boundary is wrong.

---

## 6. Landing page — cinematic scroll

- **Lenis** — smooth momentum scroll (the "expensive" feel).
- **Framer Motion** — reveal-on-scroll, stagger, scroll-linked hero transforms (`useScroll`/`useTransform`).
- **GSAP + ScrollTrigger** — one pinned scroll sequence / horizontal gallery showpiece.
- **Aceternity / Magic UI** — copy-paste polished section components (shadcn-style, code-owned).

**Constraints (non-negotiable for a calm wellness brand):**
- Respect `prefers-reduced-motion` (disable heavy motion).
- Lighter effects on mobile; lazy-load animation-heavy sections.
- Animation confined to the landing page — every other page stays plain shadcn and fast.

---

## 7. Auth & security

- **Phase 1:** single seeded Payload admin user (bcrypt-hashed, built into Payload). No Auth.js needed yet.
- `/admin` protected by Payload. Custom public endpoints validate all input at the boundary.
- Honeypot + rate limit on public forms (bots will find them).
- **Phase 2:** Auth.js only when *customer* accounts arrive; Payload gains a `role` field then.

---

## 8. Deployment notes (Vercel + serverless)

- **Cloudinary storage adapter is required** — Vercel's filesystem is ephemeral; uploads must not touch local disk.
- Atlas region near the Vercel function region to cut latency.
- Env vars validated at startup with Zod (fail fast on a missing secret). Never commit secrets.
- Scheduled export of `inquiries` — those are real business leads, not regenerable content.

---

## 9. Build order (Phase 1 milestones)

1. Skeleton — Next 15 + Payload + Atlas + Cloudinary wired; deploys to Vercel.
2. Content model — all globals + collections; seed data + single admin.
3. Public shell — layout, shadcn, routing, Lenis smooth scroll.
4. **Landing page** — cinematic showpiece (Lenis + Framer + GSAP).
5. Remaining pages — About, Services, Gallery, Testimonials, Contact (content-driven).
6. Forms — inquiry + contact: validation, email (save-first), spam protection, revalidation.
7. Polish — SEO, responsive, `prefers-reduced-motion`, performance pass.
8. Handoff — client admin walkthrough.
