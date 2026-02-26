# Prism: The Authorization Engine for AI Agents 🔐

> **Confidence-aware access control, human-in-the-loop approvals, and SOC 2-ready audit trails for your autonomous agents.**

Prism is a developer-first authorization layer built specifically for the Agentic Web. It grants ephemeral, context-aware, and scoped permissions to AI agents, ensuring they act autonomously without hallucinating security breaches. 

Unlike legacy IAM, Prism treats AI agents as first-class actors with their own distinct constraint model, tying authorization decisions directly to **LLM confidence scores**.

[![CI](https://github.com/Abenezer0923/Prism/actions/workflows/ci.yml/badge.svg)](https://github.com/Abenezer0923/Prism/actions/workflows/ci.yml)

---

## 🌟 Why Prism?

Traditional authorization systems (like OAuth or RBAC) were built for humans and deterministic software. AI agents are non-deterministic. They hallucinate, they get confused, and they make mistakes. 

Prism bridges this gap by introducing **Confidence-Aware Auth**.

*   **Confidence-Aware Auth:** Automatically downgrade permissions or require human approval if an LLM's confidence score drops below a defined threshold.
*   **Ephemeral Agent Tokens (JIT):** Never give an AI agent a permanent API key. Prism mints Just-In-Time tokens that expire the moment a task completes.
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

Optional (observe-before-enforce onboarding):

```bash
# Compute/log decisions but do not enforce denies/reviews
PRISM_MODE=shadow docker compose up -d
```

### 2. Verify the Engine is Running

```bash
curl http://localhost:8082/healthz
# {"status":"ok","version":"1.0.0"}
```

### 3. Authorize an Agent Action

Prism evaluates the request against your defined policies (YAML or Rego) and the agent's current confidence score.

```bash
curl -s -X POST http://localhost:8082/v1/agent/authorize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer prism-dev-key" \
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

Prism provides official SDKs for seamless integration into your agent workflows.

### Go

```bash
go get github.com/Abenezer0923/Prism/sdk/go
```

```go
package main

import (
  "context"
  "fmt"

  prism "github.com/Abenezer0923/Prism/sdk/go"
)

func main() {
  client := prism.NewClient(prism.ClientConfig{
    BaseURL: "http://localhost:8082",
    APIKey:  "your-api-key",
  })

  decision, err := client.AgentAuthorize(context.Background(), prism.AgentAuthRequest{
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
npm install prizm-engine
```

```typescript
import { PrismClient } from "prizm-engine";

const client = new PrismClient({
  baseUrl: "http://localhost:8082",
  apiKey: process.env.PRISM_API_KEY
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
pip install prizm-engine
```

```python
from auth_pe.client import PrismClient

client = PrismClient(
    base_url="http://localhost:8082",
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

Modern agentic applications have three distinct actor types: Users, Resources, and Agents. Prism separates Human Roles from Agent Scopes—a fundamental split that traditional IAM tools miss.

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

| Confidence | Prism's Automated Behaviour |
|---|---|
| **≥ 90%** | Agent acts autonomously (Full Scope) |
| **70–89%** | Action queued for human review |
| **< 70%** | Token downgraded to `read_only` |
| **< 50%** | Hard deny + security alert triggered |

---

## ⚙️ Configuration

### Policy Definition (auth.yaml)

Prism uses a simple, declarative YAML format to define roles and agent scopes.

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

Prism also supports Open Policy Agent (OPA) Rego files for advanced, programmatic authorization logic.

```bash
# Load a single file
export REGO_POLICY_PATH=./config/auth.rego
export REGO_POLICY_QUERY=data.prism.authz

# Or load a directory of plugins
export REGO_POLICY_PATH=./config/plugins/
export REGO_POLICY_QUERY=data.prism.authz
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

## 📄 License

MIT License

---
*Prism: The Authorization Engine for AI Agents · Go · TypeScript · Python · 2026*
