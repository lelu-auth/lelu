# ─────────────────────────────────────────────────────────────────────────────
# Multi-stage Dockerfile — Auth Permission Engine
# Stage 1: build a static binary
# Stage 2: minimal distroless runtime image
# ─────────────────────────────────────────────────────────────────────────────

# ── Builder ───────────────────────────────────────────────────────────────────
FROM golang:1.22-alpine AS builder

# Install git + ca-certs (needed for go module downloads over HTTPS)
RUN apk add --no-cache git ca-certificates tzdata

WORKDIR /build

# Cache dependency downloads separately from source changes
COPY engine/go.mod engine/go.sum ./
RUN go mod download

# Copy source
COPY engine/ .

# Build a fully static binary
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-s -w -extldflags '-static'" \
    -o /engine ./cmd/engine

# ── Runtime ───────────────────────────────────────────────────────────────────
FROM gcr.io/distroless/static-debian12 AS runtime

# Non-root user for security
USER nonroot:nonroot

# Copy binary and TLS certs from builder
COPY --from=builder /engine /engine
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /usr/share/zoneinfo /usr/share/zoneinfo

# Default policy mount point
VOLUME ["/etc/prism"]

EXPOSE 8080

ENTRYPOINT ["/engine"]
