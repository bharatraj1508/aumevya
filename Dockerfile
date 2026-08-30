# syntax=docker/dockerfile:1

# ---------- base ----------
# Node 22 LTS (Node 25 crashes this app via experimental Web Storage).
FROM node:22-bookworm-slim AS base
ENV NODE_OPTIONS="--no-deprecation --no-experimental-webstorage"

# ---------- deps ----------
FROM base AS deps
WORKDIR /app
# .npmrc carries legacy-peer-deps=true — required for the lockfile to validate.
COPY package.json package-lock.json .npmrc ./
RUN npm ci

# ---------- builder ----------
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Placeholder env only for this build step so the Payload config loads. No DB
# connection is made during `next build` (all frontend routes are force-dynamic),
# and these values are not baked into any image layer.
# Cap the heap to fit a small VPS (3.8GB box shared with other containers).
# The 8000 in package.json's build script suits well-provisioned machines;
# NODE_OPTIONS here overrides it for the in-container build only.
RUN PAYLOAD_SECRET=build-only-placeholder \
    MONGO_URI=mongodb://localhost:27017/build \
    NODE_OPTIONS="--no-deprecation --no-experimental-webstorage --max-old-space-size=2048" \
    npm run build

# ---------- runner ----------
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000

# gosu lets the entrypoint drop from root to the app user after fixing volume perms.
RUN apt-get update \
  && apt-get install -y --no-install-recommends gosu \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd -r nodejs && useradd -r -g nodejs -m nextjs

# Next.js standalone output: self-contained server + traced node_modules.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Ensure Payload's image processing (sharp + native libvips) is present.
COPY --from=builder /app/node_modules/sharp ./node_modules/sharp
COPY --from=builder /app/node_modules/@img ./node_modules/@img

# Writable uploads dir (mount a volume or bind mount here to persist media).
RUN mkdir -p /app/media && chown -R nextjs:nodejs /app/media

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# Entrypoint runs as root (fixes media perms), then execs the server as nextjs.
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "server.js"]
