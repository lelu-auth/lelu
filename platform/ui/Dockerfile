# ── Single-stage Build + Runtime (uses only golang:1.22-alpine) ─────────────
FROM golang:1.22-alpine

RUN apk add --no-cache nodejs npm

RUN addgroup -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN npm run build

RUN mkdir -p /app/.next/standalone/.next && \
	cp -r /app/.next/static /app/.next/standalone/.next/static && \
	cp -r /app/public /app/.next/standalone/public

RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000
WORKDIR /app/.next/standalone
CMD ["node", "server.js"]
