# Auth Permission Engine 🔐

> **The immune system for autonomous AI agents.**

A policy engine that issues **JIT tokens**, enforces **agent-scoped constraints**, and — uniquely — ties **authorization decisions to LLM confidence scores**.

[![CI](https://github.com/prism/auth-permission-engine/actions/workflows/ci.yml/badge.svg)](https://github.com/prism/auth-permission-engine/actions/workflows/ci.yml)

---

## Quick Start

```bash
# 1. Start the engine + Redis sidecar
docker compose up -d

# 2. Check health
curl http://localhost:8082/healthz

# 3. Authorize an agent action
curl -s -X POST http://localhost:8082/v1/agent/authorize \
  -H "Content-Type: application/json" \
  -d '{
    "actor":      "invoice_bot",
    "action":     "approve_refunds",
    "confidence": 0.92,
    "acting_for": "user_123"
  }' | jq .
```

---

## How it works

Three deployable layers:

```
Cloud Control Plane  ──push──►  Local Sidecar Engine (Go)  ◄──►  SDK  ◄──►  Agent
```

| Layer | What it does |
|---|---|
| **Go Engine** | Sub-2 ms policy evaluation, JIT token minting, Confidence Gate ★ |
| **TypeScript SDK** | LangChain, React, Express integrations |
| **Python SDK** | LangGraph, FastAPI, AutoGPT integrations |
| **YAML Config** | Human-readable, Git-diffable policy file |

---

## Confidence-Aware Auth ★

The feature no competitor has — binding auth to LLM certainty.

| Confidence | Behaviour |
|---|---|
| **≥ 90%** | Agent acts autonomously |
| **70–89%** | Queued for human review |
| **< 70%** | Downgraded to `read_only` |
| **< 50%** | Hard deny + security alert |

Configure thresholds per-agent in `config/auth.yaml`.

---

## Development

### Prerequisites

- Go 1.22+
- Docker + Docker Compose
- Node 20+ (TypeScript SDK)
- Python 3.11+ (Python SDK)

### Commands

```bash
# Run everything in Docker
make docker-up

# Run Go tests with race detector
make test

# Build Go binary
make build

# TypeScript SDK
make sdk-ts-install
make sdk-ts-build
make sdk-ts-test

# Python SDK
make sdk-py-install
make sdk-py-test

# Stop containers
make docker-down
```

### Environment variables

| Variable | Default | Description |
|---|---|---|
| `LISTEN_ADDR` | `:8080` | Engine HTTP listen address |
| `POLICY_PATH` | `/etc/prism/auth.yaml` | Policy file mount path |
| `REDIS_ADDR` | _(empty)_ | Redis address for token store |
| `JWT_SIGNING_KEY` | `change-me-in-production` | HMAC key for JIT tokens |
| `CONTROL_PLANE_URL` | _(empty)_ | Cloud control plane URL (optional) |
| `CP_HMAC_SECRET` | _(empty)_ | HMAC secret for policy signature verification |
| `REGO_POLICY_PATH` | _(empty)_ | Optional Rego policy path (enables OPA compatibility mode) |
| `REGO_POLICY_QUERY` | `data.prism.authz` | Rego query to evaluate |
| `OIDC_ISSUER_URL` | _(empty)_ | Optional OIDC issuer for enterprise SSO on platform APIs |
| `OIDC_AUDIENCE` | _(empty)_ | OIDC client/audience value used in token verification |

### Kubernetes (Helm)

```bash
helm install prism ./helm/prism
```

### OPA / Rego compatibility

```bash
export REGO_POLICY_PATH=./config/auth.rego
export REGO_POLICY_QUERY=data.prism.authz
```

---

## API Reference

### `POST /v1/authorize`
Human authorization check.

```json
{ "user_id": "user_123", "action": "approve_refunds" }
```

### `POST /v1/agent/authorize`
Agent authorization with confidence gate.

```json
{
  "actor":      "invoice_bot",
  "action":     "approve_refunds",
  "confidence": 0.92,
  "acting_for": "user_123"
}
```

### `POST /v1/tokens/mint`
Mint a JIT-scoped token.

```json
{ "scope": "invoice_bot", "acting_for": "user_123", "ttl_seconds": 60 }
```

### `DELETE /v1/tokens/:tokenId`
Revoke a token immediately.

### `GET /healthz`
Returns `{"status":"ok"}` if healthy.

---

## Repository Structure

```
auth-permission-engine/
├── engine/                   # Go source
│   ├── cmd/engine/main.go    # Entrypoint
│   ├── internal/
│   │   ├── evaluator/        # OPA-style policy engine
│   │   ├── tokens/           # JIT token minting + validation
│   │   ├── confidence/       # Confidence-Aware Auth gate ★
│   │   ├── audit/            # Async audit log pipeline
│   │   ├── sync/             # Policy hot-reload worker
│   │   └── server/           # HTTP handler
│   └── proto/auth.proto      # gRPC service definition (Phase 2)
├── sdk/typescript/           # TypeScript SDK
│   └── src/
│       ├── client.ts
│       ├── types.ts
│       └── index.ts
├── sdk/python/               # Python SDK
│   └── auth_pe/
│       ├── client.py
│       ├── models.py
│       └── __init__.py
├── config/auth.yaml          # Sample policy file
├── docker-compose.yml
├── Makefile
└── .github/workflows/ci.yml
```

---

## Roadmap

| Phase | Weeks | Milestone |
|---|---|---|
| **Phase 1** | 1–6 | Go engine + SDK core clients ← *you are here* |
| **Phase 2** | 7–12 | Confidence Gate, LangChain/LangGraph wrappers |
| **Phase 3** | 13–20 | Cloud control plane, Trace Explorer UI, first customer |
| **Phase 4** | 21–28 | OSS release, Helm chart, AutoGPT plugin, Rego compatibility, enterprise SSO |

---

## Status

🚀 **Phase 4 in progress** — Helm chart, Rego adapter, OIDC auth path, and AutoGPT scaffold are now available.

## License

MIT License

---

*Auth Permission Engine · Go · TypeScript · Python · February 2026*
