# Lelu: Authorization Engine for AI Agents

Lelu is a policy enforcement engine for AI agents. It combines policy rules, confidence-aware controls, runtime risk checks, and human-review workflows so agent actions can be approved safely in production.

## What Lelu Solves

Traditional IAM is built for deterministic systems. Agent behavior is probabilistic. Lelu adds runtime controls designed for agentic workloads:

- Confidence-aware authorization decisions
- Prompt-injection prefiltering before policy evaluation
- Runtime risk scoring and restrictive decision merge
- Human-in-the-loop review queue for uncertain actions
- Short-lived (JIT) scoped tokens for agent tasks
- Audit trail, incident hooks, and shadow mode for safe rollout

## Architecture

```text
Client/SDK/MCP
   |
   v
Lelu Engine (Go)
  -> Injection Check
  -> Confidence Resolve + Gate
  -> Policy Eval (YAML/Rego)
  -> Risk Eval
  -> Restrictive Merge
   |
   +-> Audit / Incident / Review Queue
```

Core components:

- `engine/`: authorization runtime and policy evaluator
- `platform/`: control-plane API + UI backend
- `platform/ui/`: Next.js UI
- `sdk/`: Go, TypeScript, Python, and MCP integrations

## Quick Start (Local)

### 1. Start stack

```bash
docker compose up -d --build
```

### 2. Health checks

```bash
curl http://localhost:8083/healthz
curl http://localhost:9091/healthz
curl http://localhost:3002/healthz
```

### 3. Agent authorization example

```bash
curl -s -X POST http://localhost:8083/v1/agent/authorize \
  -H "Authorization: Bearer lelu-dev-key" \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "acme",
    "actor": "invoice_bot",
    "action": "payment.refund",
    "resource": {"invoice_id": "INV-0091", "amount": "1200"},
    "confidence": 0.72,
    "acting_for": "user_123",
    "scope": "invoice_bot"
  }'
```

## API Surface (Engine)

- `POST /v1/authorize`
- `POST /v1/agent/authorize`
- `POST /v1/agent/delegate`
- `POST /v1/tokens/mint`
- `DELETE /v1/tokens/{tokenID}`
- `GET /v1/queue/pending`
- `GET /v1/queue/{id}`
- `POST /v1/queue/{id}/approve`
- `POST /v1/queue/{id}/deny`
- `POST /v1/simulator/replay`
- `GET /v1/fallback/status`
- `GET /healthz`
- `GET /metrics`

## SDKs

- Go: `sdk/go`
- TypeScript: `sdk/typescript`
- Python: `sdk/python`
- MCP server: `sdk/mcp`

## Configuration Highlights

- `POLICY_PATH`: YAML policy file path
- `REGO_POLICY_PATH`: Rego policy path/directory
- `API_KEY`: engine API key
- `CONFIDENCE_MISSING_MODE`: `deny | review | read_only`
- `CONFIDENCE_ALLOW_UNVERIFIED`: allow top-level raw `confidence`
- `LELU_MODE`: `enforce | shadow`
- `INCIDENT_WEBHOOK_URL`: webhook target for deny/review alerts

## Deploy UI on Vercel

`platform/ui` is designed for Vercel deployment.

1. Import repository into Vercel
2. Set root directory to `platform/ui`
3. Configure environment variables:
   - `NEXT_PUBLIC_ENGINE_URL`
   - `NEXT_PUBLIC_PLATFORM_URL`
4. Keep Engine/Platform API + Redis/Postgres in your own infra (Docker/Kubernetes/managed services)

## Open Source Readiness

For program applications (for example Vercel OSS), maintain these project signals:

- active commits and release cadence
- usage metrics (stars, users, adopters, SDK installs)
- clear deployment documentation
- contributor standards and governance

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Code of Conduct

See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## License

MIT. See [LICENSE](LICENSE).
