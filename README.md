# Lelu: The Authorization Engine for AI Agents 🔐

> **Confidence-aware access control, human-in-the-loop approvals, and SOC 2-ready audit trails for your autonomous agents.**

Lelu is a developer-first authorization layer built specifically for the Agentic Web. It grants ephemeral, context-aware, and scoped permissions to AI agents, ensuring they act autonomously without hallucinating security breaches. 

Unlike legacy IAM, Lelu treats AI agents as first-class actors with their own distinct constraint model, tying authorization decisions directly to **LLM confidence scores**.

[![CI](https://github.com/Abenezer0923/Lelu/actions/workflows/ci.yml/badge.svg)](https://github.com/Abenezer0923/Lelu/actions/workflows/ci.yml)

---

## 🌟 Why Lelu?

Traditional authorization systems (like OAuth or RBAC) were built for humans and deterministic software. AI agents are non-deterministic. They hallucinate, they get confused, and they make mistakes. 

Lelu bridges this gap by introducing **Confidence-Aware Auth**.

*   **Confidence-Aware Auth:** Automatically downgrade permissions or require human approval if an LLM's confidence score drops below a defined threshold.
*   **Ephemeral Agent Tokens (JIT):** Never give an AI agent a permanent API key. Lelu mints Just-In-Time tokens that expire the moment a task completes.
*   **Local Evaluation (Sidecar):** Policies are evaluated in-memory with sub-2ms latency. Zero added latency to your agent's decision loop.
*   **Human-in-the-Loop (HITL):** Seamlessly route uncertain agent actions to a human manager for 1-click approval.
*   **The Black Box Audit:** A Trace Explorer that links the exact LLM prompt to the resulting authorization decision.

---

## 🚀 Quick Start

The easiest way to get started is using Docker Compose, which spins up the Engine, Platform UI, and Redis.

### 1. Start the Infrastructure

```bash
# Start the engine, platform, and Redis
docker compose up -d
```

Optional configurations:

```bash
# Observe-before-enforce onboarding (shadow mode)
LELU_MODE=shadow docker compose up -d

# Enable OpenTelemetry tracing
OTEL_ENABLED=true OTEL_EXPORTER_OTLP_ENDPOINT=localhost:4317 docker compose up -d

# Enable Redis fallback (fail-open on Redis outage)
FALLBACK_REDIS_MODE=open docker compose up -d
```

### 2. Verify the Engine is Running

```bash
curl http://localhost:8083/healthz
# {"status":"ok","version":"1.0.0"}
```

### 3. Authorize an Agent Action

Lelu evaluates the request against your defined policies (YAML or Rego) and the agent's current confidence score.

```bash
curl -s -X POST http://localhost:8083/v1/agent/authorize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer lelu-dev-key" \
  -d '{
    "actor": "invoice_bot",
    "action": "approve_refunds",
    "confidence": 0.92,
    "acting_for": "user_123"
  }' | jq .
```

**Response:**
```json
{
  "allowed": true,
  "reason": "allowed by agent scope",
  "requires_human_review": false,
  "confidence_used": 0.92
}
```

---

## 💻 SDK Installation

Lelu provides official SDKs for seamless integration into your agent workflows.

### Go

```bash
go get github.com/Abenezer0923/Lelu/sdk/go
```

```go
package main

import (
  "context"
  "fmt"

  lelu "github.com/Abenezer0923/Lelu/sdk/go"
)

func main() {
  client := lelu.NewClient(lelu.ClientConfig{
    BaseURL: "http://localhost:8083",
    APIKey:  "your-api-key",
  })

  decision, err := client.AgentAuthorize(context.Background(), lelu.AgentAuthRequest{
    Actor:      "support_agent",
    Action:     "issue_refund",
    Confidence: 0.85,
  })
  if err != nil {
    panic(err)
  }

  fmt.Println("allowed:", decision.Allowed, "reason:", decision.Reason)
}
```

### TypeScript / Node.js

```bash
npm install lelu
```

```typescript
import { LeluClient } from "lelu";

const client = new LeluClient({
  baseUrl: "http://localhost:8083",
  apiKey: process.env.LELU_API_KEY
});

const decision = await client.agentAuthorize({
  actor: "support_agent",
  action: "issue_refund",
  context: { confidence: 0.85 }
});

if (decision.requiresHumanReview) {
  console.log("Action paused. Waiting for human approval.");
} else if (decision.allowed) {
  console.log("Action approved autonomously.");
}
```

### Python

```bash
pip install lelu
```

```python
from lelu.client import LeluClient

client = LeluClient(
    base_url="http://localhost:8083",
    api_key="your-api-key"
)

decision = client.agent_authorize(
    actor="support_agent",
    action="issue_refund",
    confidence=0.85
)

if decision.requires_human_review:
    print("Action paused. Waiting for human approval.")
elif decision.allowed:
    print("Action approved autonomously.")
```

---

## 🧠 How it Works

Modern agentic applications have three distinct actor types: Users, Resources, and Agents. Lelu separates Human Roles from Agent Scopes—a fundamental split that traditional IAM tools miss.

### The Architecture

```text
Cloud Control Plane  ──push──►  Local Sidecar Engine (Go)  ◄──►  SDK  ◄──►  Agent
```

| Component | Description |
|---|---|
| **Go Engine** | Sub-2 ms policy evaluation, JIT token minting, and the Confidence Gate. |
| **Go SDK** | Native Go client for backend services and microservices. |
| **TypeScript SDK** | Middleware for LangChain, React, and Express. |
| **Python SDK** | Middleware for LangGraph, FastAPI, and AutoGPT. |
| **YAML Config** | Human-readable, Git-diffable policy definitions. |

### Confidence-Aware Auth in Action

LLMs are non-deterministic. Your auth layer shouldn't pretend otherwise. Configure thresholds per-agent in your `auth.yaml`:

| Confidence | Lelu's Automated Behaviour |
|---|---|
| **≥ 90%** | Agent acts autonomously (Full Scope) |
| **70–89%** | Action queued for human review |
| **< 70%** | Token downgraded to `read_only` |
| **< 50%** | Hard deny + security alert triggered |

---

## ⚙️ Configuration

### Policy Definition (auth.yaml)

Lelu uses a simple, declarative YAML format to define roles and agent scopes.

```yaml
version: "1.0"
roles:
  admin:
    allow: ["*"]
  support:
    allow: ["tickets.read", "tickets.update", "refunds.issue"]

agent_scopes:
  support_bot:
    inherits: support
    constraints:
      # Require human approval if the LLM is less than 90% confident
      require_human_approval_if_confidence_below: 0.90
      # Completely deny the action if confidence is below 70%
      hard_deny_if_confidence_below: 0.70
```

### OPA / Rego Compatibility

Lelu also supports Open Policy Agent (OPA) Rego files for advanced, programmatic authorization logic.

```bash
# Load a single file
export REGO_POLICY_PATH=./config/auth.rego
export REGO_POLICY_QUERY=data.lelu.authz

# Or load a directory of plugins
export REGO_POLICY_PATH=./config/plugins/
export REGO_POLICY_QUERY=data.lelu.authz
```

### Incident Webhook (MVP)

Send high-risk authorization outcomes (deny / human review) to incident systems:

```bash
export INCIDENT_WEBHOOK_URL=https://your-webhook-endpoint
export INCIDENT_WEBHOOK_TIMEOUT_MS=2000
```

---

## 🔌 Integrations Registry

We are actively building integrations for the most popular AI agent frameworks. Want to help? Check out our [Contributing Guide](CONTRIBUTING.md)!

| Framework | Language | Status |
|---|---|---|
| **LangChain** | TypeScript | ✅ Supported (`lelu/langchain`) |
| **AutoGPT** | Python | ✅ Supported (`lelu.autogpt_plugin`) |
| **LlamaIndex** | Python | 🛠️ [Help Wanted](CONTRIBUTING.md) |
| **CrewAI** | Python | ✅ Supported (`lelu.LeluTool`) |
| **Vercel AI SDK** | TypeScript | ✅ Supported (`@lelu/sdk/vercel`) |
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

### `POST /v1/simulator/replay`
Replay historical traces against a proposed YAML policy and return decision deltas + blast radius summary.
```json
{
  "proposed_policy_yaml": "version: \"1.0\"\nroles:\n  finance_manager:\n    allow: [view_invoices]\n",
  "traces": [
    { "id": "h-1", "kind": "human", "user_id": "user_123", "action": "approve_refunds" },
    {
      "id": "a-1",
      "kind": "agent",
      "actor": "invoice_bot",
      "action": "approve_refunds",
      "confidence_signal": {
        "provider": "openai",
        "token_logprobs": [-0.04, -0.05, -0.03]
      }
    }
  ]
}
```

Returns per-trace `before`/`after` outcomes (`allow` | `review` | `deny`) and summary counters such as `changed`, `allow_to_deny`, and `allow_to_review`.

### `GET /v1/shadow/summary`
Return shadow-mode *would-have* outcome counts over a recent time window.

Query params:
- `window_minutes` (optional, default `60`, range `1-1440`)

Response includes:
- `mode` (`shadow` or `enforce`)
- `totals` (`allow`, `review`, `deny`)
- `buckets` (per-minute counts for charting/dashboard views)

### `GET /api/v1/compliance/export` (Platform)
Export auditor-ready control evidence summaries mapped to OWASP GenAI or NIST AI RMF.

Query params:
- `framework`: `owasp_genai` | `nist_ai_rmf` | `all` (default: `all`)
- `from` / `to` (optional RFC3339 window)

Response includes:
- `total_events`
- `controls[]` with `id`, `title`, `event_count`, and `sample_trace_ids`
- `evidence` metadata with `checksum_sha256` and optional `signature` when signing is enabled

To enable signed evidence metadata:

```bash
export EVIDENCE_SIGNING_KEY=replace-with-strong-secret
```

---

## 🤝 Contributing

We welcome contributions! Whether it's adding a new SDK integration, writing custom Rego evaluators, or improving the core engine, please see our [Contributing Guide](CONTRIBUTING.md) to get started.

## 🛡️ Code of Conduct

This project follows a contributor code of conduct. By participating, you agree to uphold this standard.

- Read: [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)

## 📄 License

MIT License. See [LICENSE](LICENSE).

---

## 🌐 Deploy UI on Vercel

The Next.js UI under `platform/ui` is a good fit for Vercel deployment.

### 1. Create Vercel project

- Import this repository in Vercel.
- Set the project root directory to `platform/ui`.
- Framework preset: Next.js.

### 2. Configure environment variables

Set these in Vercel Project Settings -> Environment Variables:

- `NEXT_PUBLIC_ENGINE_URL`: Engine API URL (for example `https://engine.yourdomain.com`)
- `NEXT_PUBLIC_PLATFORM_URL`: Platform API URL (for example `https://api.yourdomain.com`)
- `NEXT_PUBLIC_API_KEY`: only for controlled demo environments, avoid exposing production secrets in browser apps

### 3. Keep backend services outside Vercel

Vercel hosts the UI, while backend services run in your own infrastructure:

| Layer | Recommended Runtime |
|---|---|
| `platform/ui` (Next.js) | Vercel |
| `engine` (Go) | Docker/Kubernetes/VM |
| `platform` API (Go) | Docker/Kubernetes/VM |
| Redis/PostgreSQL | Managed services or self-hosted |

### 4. Validate after deployment

- Open the deployed UI and check pages load.
- Confirm the UI can reach Engine/Platform endpoints.
- Validate one end-to-end authorization request and trace view.

---

## 📈 Traction Signals (OSS Application Readiness)

If you are applying to an open source program, keep this section updated with measurable signals:

- GitHub stars: `0` (update as community grows)
- Contributors (last 90 days): `TBD`
- Weekly active developers: `TBD`
- Production adopters: `TBD`
- SDK downloads / installs: `TBD`
- Notable usage examples: `TBD`

Even early-stage numbers are useful if updated consistently.

---
*Lelu: The Authorization Engine for AI Agents · Go · TypeScript · Python · 2026*


---

## 🧪 Policy Dry-Run CLI

Test your `auth.yaml` policies locally without spinning up the full infrastructure:

```bash
# Build the CLI
cd engine
go build -o lelu-cli ./cmd/cli

# Test agent authorization
./lelu-cli -policy ../config/auth.yaml -input ../examples/test-agent-request.json -type agent

# Test human authorization
./lelu-cli -policy ../config/auth.yaml -input ../examples/test-human-request.json -type human

# Test with Rego policy
./lelu-cli -policy ../config/auth.yaml -rego ../config/auth.rego -input ../examples/test-agent-request.json
```

Example output:
```
✓ Policy loaded from config/auth.yaml

─── Agent Authorization Request ───
Actor:      invoice_bot
Action:     approve_refunds
Confidence: 0.92

─── Confidence Gate ───
Level:  high_confidence
Reason: confidence score 0.92 meets threshold

─── Policy Evaluation ───
Allowed:             true
Requires Review:     false

─── Final Decision ───
✅ ALLOWED
Reason: allowed by agent scope
```

---

## 📊 Observability

### OpenTelemetry Integration

Lelu supports OpenTelemetry for distributed tracing and performance monitoring:

```bash
# Enable OpenTelemetry
export OTEL_ENABLED=true
export OTEL_EXPORTER_OTLP_ENDPOINT=localhost:4317
export OTEL_SAMPLE_RATE=0.1  # 10% sampling

docker compose up -d
```

Traces include:
- Authorization request spans with actor, action, and confidence attributes
- Policy evaluation latency (p50, p95, p99)
- Confidence gate decisions
- End-to-end request tracing

Compatible with: Jaeger, Honeycomb, Datadog, New Relic, and any OTLP-compatible backend.

### Redis Fallback Mode

Lelu can operate with degraded Redis availability using an in-memory token cache:

```bash
# Enable fail-open mode (use in-memory cache when Redis is down)
export FALLBACK_REDIS_MODE=open

# Default fail-closed mode (deny requests when Redis is down)
export FALLBACK_REDIS_MODE=closed
```

When Redis becomes unavailable:
- **Fail-open mode:** JIT tokens are stored in-memory with TTL expiration
- **Fail-closed mode:** Token operations are denied
- Automatic recovery when Redis connection is restored
