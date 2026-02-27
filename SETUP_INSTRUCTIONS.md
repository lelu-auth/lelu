# Lelu Project Setup Instructions

## Completed Improvements

All code changes have been successfully implemented:

1. ✅ Version synchronization (TypeScript SDK: 1.0.0 → 0.1.0)
2. ✅ Release Please workflow for automated releases
3. ✅ Redis fallback with in-memory cache
4. ✅ OpenTelemetry instrumentation
5. ✅ Policy dry-run CLI tool

## Required Manual Steps

### 1. Update Go Dependencies

The Go module dependencies need to be updated to include the new OpenTelemetry packages. Run this command:

```bash
cd engine
go mod tidy
cd ..
```

This will update `engine/go.sum` with the new dependency checksums.

### 2. Build and Test

After running `go mod tidy`, you can build the Docker images:

```bash
# Build the engine
docker compose build engine

# Start all services
docker compose up -d

# Check logs
docker compose logs -f engine
```

### 3. Test the New Features

#### Test Redis Fallback

```bash
# Start with fail-open mode
FALLBACK_REDIS_MODE=open docker compose up -d

# Stop Redis to test fallback
docker compose stop redis

# Mint a token (should succeed with in-memory cache)
curl -X POST http://localhost:8083/v1/tokens/mint \
  -H "Authorization: Bearer lelu-dev-key" \
  -H "Content-Type: application/json" \
  -d '{"scope":"test_bot","acting_for":"user_123","ttl_seconds":60}'

# Restart Redis
docker compose start redis
```

#### Test OpenTelemetry

```bash
# Start Jaeger for local testing
docker run -d --name jaeger \
  -p 4317:4317 \
  -p 16686:16686 \
  jaegertracing/all-in-one:latest

# Start engine with OTel enabled
OTEL_ENABLED=true \
OTEL_EXPORTER_OTLP_ENDPOINT=localhost:4317 \
docker compose up -d engine

# Make some requests
curl -X POST http://localhost:8083/v1/agent/authorize \
  -H "Authorization: Bearer lelu-dev-key" \
  -H "Content-Type: application/json" \
  -d '{"actor":"invoice_bot","action":"approve_refunds","confidence":0.92,"acting_for":"user_123"}'

# View traces at http://localhost:16686
```

#### Test CLI Tool

```bash
# Build the CLI
cd engine
go build -o lelu-cli ./cmd/cli

# Test with example files
./lelu-cli -policy ../config/auth.yaml -input ../examples/test-agent-request.json -type agent

# Test with custom input
echo '{"actor":"test_bot","action":"test_action","confidence":0.85}' | \
  ./lelu-cli -policy ../config/auth.yaml -input /dev/stdin -type agent
```

### 4. Configure GitHub Secrets (for Release Please)

To enable automated releases, add these secrets to your GitHub repository:

1. Go to Settings → Secrets and variables → Actions
2. Add the following secrets:
   - `NPM_TOKEN`: Your npm authentication token (for TypeScript SDK publishing)
   - `PYPI_TOKEN`: Your PyPI API token (for Python SDK publishing)

### 5. Verify CI/CD

The existing CI workflow should continue to work. The new Release Please workflow will:

- Create release PRs automatically when you merge to `main`
- Generate changelogs based on conventional commits
- Publish packages to npm and PyPI when releases are created

## Environment Variables Reference

### New Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OTEL_ENABLED` | `false` | Enable OpenTelemetry tracing |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | `localhost:4317` | OTLP gRPC endpoint |
| `OTEL_SAMPLE_RATE` | `1.0` | Trace sampling rate (0.0-1.0) |
| `FALLBACK_REDIS_MODE` | `closed` | Redis fallback mode (`open` or `closed`) |

## Troubleshooting

### Docker Build Fails

If you see "missing go.sum entry" errors:

```bash
cd engine
go mod tidy
cd ..
docker compose build engine
```

### Redis Connection Issues

Check Redis is running:

```bash
docker compose ps redis
docker compose logs redis
```

### OpenTelemetry Not Working

Verify the OTLP endpoint is accessible:

```bash
# Test connection to Jaeger
curl http://localhost:4317
```

## Next Steps

1. Run `go mod tidy` in the engine directory
2. Build and test the Docker images
3. Review the IMPLEMENTATION_SUMMARY.md for detailed feature documentation
4. Configure GitHub secrets for automated releases
5. Test all new features in your environment

## Support

For issues or questions:
- Check IMPLEMENTATION_SUMMARY.md for detailed documentation
- Review the CI/CD workflows in `.github/workflows/`
- Open an issue on GitHub
