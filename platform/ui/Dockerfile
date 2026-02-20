# ── Deps + Build (reuses the cached golang:1.22-alpine layer — no new pull) ───
FROM golang:1.22-alpine AS builder

# Install Node.js + npm from Alpine's package repo (same CDN already working)
RUN apk add --no-cache nodejs npm

WORKDIR /app
COPY package.json ./
RUN npm install

COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ── Runtime (reuses cached alpine:3.19) ──────────────────────────────────────
FROM alpine:3.19 AS runtime

RUN apk add --no-cache nodejs
RUN addgroup -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs

WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
