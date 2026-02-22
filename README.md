# Prism: Auth Permission Engine 🔐

> **The immune system for autonomous AI agents.**

Prism is a developer-first authorization layer built specifically for the Agentic Web. It grants ephemeral, context-aware, and scoped permissions to AI agents, ensuring they act autonomously without hallucinating security breaches. 

Unlike legacy IAM, Prism treats AI agents as first-class actors with their own distinct constraint model, tying authorization decisions directly to **LLM confidence scores**.

[![CI](https://github.com/Abenezer0923/Prism/actions/workflows/ci.yml/badge.svg)](https://github.com/Abenezer0923/Prism/actions/workflows/ci.yml)

---

## 🌟 Key Features

*   **Confidence-Aware Auth:** Automatically downgrade permissions or require human approval if an LLM's confidence score drops below a defined threshold.
*   **Ephemeral Agent Tokens (JIT):** Never give an AI agent a permanent API key. Prism mints Just-In-Time tokens that expire the moment a task completes.
*   **Local Evaluation (Sidecar):** Policies are evaluated in-memory with sub-2ms latency. Zero added latency to your agent's decision loop.
*   **Human-in-the-Loop (HITL):** Seamlessly route uncertain agent actions to a human manager for 1-click approval.
*   **The Black Box Audit:** A Trace Explorer that links the exact LLM prompt to the resulting authorization decision.

---

## 🚀 Quick Start

The easiest way to get started is using Docker Compose, which spins up the Engine, Platform UI, and Redis.

```bash
# 1. Start the engine + Redis sidecar
docker compose up -d

# 2. Check health
curl http://localhost:8082/healthz

# 3. Authorize an agent action
curl -s -X POST http://localhost:8082/v1/agent/authorize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer prism-dev-key" \
  -d '{
    "actor":      "invoice_bot",
    "action":     "approve_refunds",
    "confidence": 0.92,
    "acting_for": "user_123"
  }' | jq .
```

---

## 🧠 How it Works

Modern agentic applications have three distinct actor types: Users, Resources, and Agents. Prism separates Human Roles from Agent Scopes—a fundamental split that traditional IAM tools miss.

### The Architecture

```text
Cloud Control Plane  ──push──►  Local Sidecar Engine (Go)  ◄──►  SDK  ◄──►  Agent
```

| Component | Description |
|---|---|
| **Go Engine** | Sub-2 ms policy evaluation, JIT token minting, and the Confidence Gate. |
| **TypeScript SDK** | Middleware for LangChain, React, and Express. |
| **Python SDK** | Middleware for LangGraph, FastAPI, and AutoGPT. |
| **YAML Config** | Human-readable, Git-diffable policy definitions. |

### Confidence-Aware Auth in Action

LLMs are non-deterministic. Your auth layer shouldn't pretend otherwise. Configure thresholds per-agent in your `auth.yaml`:

| Confidence | Prism's Automated Behaviour |
|---|---|
| **≥ 90%** | Agent acts autonomously (Full Scope) |
| **70–89%** | Action queued for human review |
| **< 70%** | Token downgraded to `read_only` |
| **< 50%** | Hard deny + security alert triggered |

---

## 💻 Development & Deployment

### Prerequisites
- Go 1.22+
- Docker + Docker Compose
- Node 20+ (TypeScript SDK)
- Python 3.11+ (Python SDK)

### Local Commands

```bash
make docker-up       # Run everything in Docker
make test            # Run Go tests with race detector
make build           # Build Go binary
make sdk-ts-build    # Build TypeScript SDK
make sdk-py-test     # Test Python SDK
```

### Kubernetes (Helm)

Prism includes a production-ready Helm chart with security hardening (Secrets, probes, TLS).

```bash
helm install prism ./helm/prism
helm upgrade --install prism ./helm/prism -f ./helm/prism/values-production.yaml
```

### OPA / Rego Compatibility

Prism supports Open Policy Agent (OPA) Rego files. You can load a single Rego file or a directory of Rego plugins (for custom evaluators):

```bash
# Load a single file
export REGO_POLICY_PATH=./config/auth.rego
export REGO_POLICY_QUERY=data.prism.authz

# Or load a directory of plugins
export REGO_POLICY_PATH=./config/plugins/
export REGO_POLICY_QUERY=data.prism.authz
```

---

## 🔌 Integrations Registry

We are actively building integrations for the most popular AI agent frameworks. Want to help? Check out our [Contributing Guide](CONTRIBUTING.md)!

| Framework | Language | Status |
|---|---|---|
| **LangChain** | TypeScript | ✅ Supported (`prism/langchain`) |
| **AutoGPT** | Python | ✅ Supported (`auth_pe.autogpt_plugin`) |
| **LlamaIndex** | Python | 🛠️ [Help Wanted](CONTRIBUTING.md) |
| **CrewAI** | Python | 🛠️ [Help Wanted](CONTRIBUTING.md) |
| **Vercel AI SDK** | TypeScript | 🛠️ [Help Wanted](CONTRIBUTING.md) |
| **Semantic Kernel** | C# / Python | 🛠️ [Help Wanted](CONTRIBUTING.md) |

---

## 📖 API Reference

*Note: All endpoints (except `/healthz`) require an `Authorization: Bearer <API_KEY>` header.*

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

### `POST /v1/authorize`
Standard human authorization check.
```json
{ "user_id": "user_123", "action": "approve_refunds" }
```

---

## 🤝 Contributing

We welcome contributions! Whether it's adding a new SDK integration, writing custom Rego evaluators, or improving the core engine, please see our [Contributing Guide](CONTRIBUTING.md) to get started.

## 📄 License

MIT License

---
*Prism: Auth Permission Engine · Go · TypeScript · Python · 2026*
