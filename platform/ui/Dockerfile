# ── Build + Runtime (uses only golang:1.22-alpine — already cached locally) ──
FROM golang:1.22-alpine AS builder

# Install Node.js + npm from Alpine's CDN (same CDN already working)
RUN apk add --no-cache nodejs npm

WORKDIR /app
COPY package.json ./
RUN npm install

COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ── Runtime ───────────────────────────────────────────────────────────────────
FROM golang:1.22-alpine AS runtime

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
