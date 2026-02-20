# ── Build stage ────────────────────────────────────────────────────────────────
FROM golang:1.22-alpine AS builder

ENV GOPROXY=https://goproxy.io,direct

WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build \
    -ldflags="-s -w" \
    -o /platform ./cmd/api

# ── Runtime stage ──────────────────────────────────────────────────────────────
FROM alpine:3.19
RUN apk add --no-cache ca-certificates tzdata
COPY --from=builder /platform /platform
EXPOSE 9090
ENTRYPOINT ["/platform"]
