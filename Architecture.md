# Auth Permission Engine — Architecture & Development Plan

> **The Immune System for Autonomous Agents**

**Version:** 1.0  
**Date:** February 2026  
**Tech Stack:** Go Engine · TypeScript SDK · Python SDK · YAML Config

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [High-Level System Architecture](#high-level-system-architecture)
3. [Go Engine — Core Components](#go-engine--core-components)
4. [SDK Design — TypeScript & Python](#sdk-design--typescript--python)
5. [YAML Configuration](#yaml-configuration)
6. [Confidence-Aware Auth ★ Core Differentiator](#confidence-aware-auth--core-differentiator)
7. [Development Roadmap](#development-roadmap)
8. [Repository Structure](#repository-structure)
9. [Next Steps](#next-steps)

---

## Executive Summary

### The Problem

Legacy IAM (Okta, SailPoint) was built for humans. AI agents are **non-deterministic**, **ephemeral**, and **act on behalf of users** — none of those systems handle this.

### Our Solution

A policy engine that issues **JIT tokens**, enforces **agent-scoped constraints**, and — uniquely — ties **authorization decisions to LLM confidence scores**.

### The Moat

No competitor links auth to LLM output confidence. **Confidence-Aware Auth** is our defensible technical differentiator and the core of every customer conversation.

### Tech Choices

- **Go** for the engine (speed + community)
- **TypeScript & Python SDKs** (where AI devs live)
- **YAML config** (zero friction onboarding for your first 100 users)

---

## High-Level System Architecture

**Three layers: Cloud Control Plane · Local Sidecar Engine · Developer SDKs**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CLOUD CONTROL PLANE                                  │
├─────────────┬──────────────┬──────────────┬──────────────┬─────────────────┤
│ Policy Store│ Audit Log DB │Trace Explorer│ Dashboard UI │Token Revocation │
└──────┬──────┴──────┬───────┴──────┬───────┴──────────────┴─────────────────┘
       │ push        │ push         │ push
       ↓             ↓              ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                   LOCAL SIDECAR ENGINE — Go                                 │
├──────────────┬─────────────┬───────────────┬────────────────┬───────────────┤
│    Policy    │ JIT Token   │  Confidence   │   Constraint   │  Async Log    │
│  Evaluator   │    Mint     │   Gate ★      │    Engine      │     Flush     │
│  OPA-style   │   < 2 ms    │  LLM-aware    │  YAML rules    │ non-blocking  │
└──────┬───────┴─────┬───────┴───────┬───────┴────────────────┴───────────────┘
       │             │               │
       ↓             ↓               ↓
┌──────────────────┬─────────────────────┬────────────────────────────────────┐
│  TypeScript SDK  │    Python SDK       │       YAML Config                  │
│  LangChain ·     │  LangGraph ·        │  auth.yaml · Policies ·            │
│  React · Express │  FastAPI · AutoGPT  │  Constraints                       │
└──────────────────┴─────────────────────┴────────────────────────────────────┘
```

### Cloud Control Plane

- **Policy Store** — Centralized YAML policy repository
- **Audit Log DB** — Immutable audit trail with full context
- **Trace Explorer** — Links LLM prompts to auth decisions
- **Dashboard UI** — Real-time policy status, agent activity
- **Token Revocation** — Instant JIT token invalidation

### Local Sidecar Engine (Go)

- **Policy Evaluator** — OPA-style rule engine, < 2 ms latency
- **JIT Token Mint** — Ephemeral tokens, 60 s TTL default
- **Confidence Gate ★** — LLM-aware auth (our differentiator)
- **Constraint Engine** — YAML-defined agent boundaries
- **Async Log Flush** — Non-blocking audit pipeline to cloud

### Developer SDKs

**TypeScript SDK:**
- LangChain middleware (`SecureTool`)
- React hook (`useAgentPermission`)
- Express route guards

**Python SDK:**
- LangGraph node wrappers
- FastAPI dependencies
- AutoGPT plugin scaffold

**YAML Config:**
- Simple `auth.yaml` file
- Human-readable policies
- Git-diffable, version-controlled

---

## Go Engine — Core Components

**Why Go?**

Goroutines handle thousands of concurrent agent requests cheaply. Sub-millisecond policy evaluation. Single binary deployment — no runtime dependencies. Battle-tested by Hashicorp (Vault), OPA, and every major cloud-native auth project.

### Module Breakdown

#### 1. Policy Evaluator (`evaluator/`)

**Responsibilities:**
- Load & cache YAML policies from control plane
- OPA-compatible Rego rules (future)
- ReBAC + RBAC + agent scope checks

**Key Functions:**
```go
func Evaluate(ctx context.Context, req AuthRequest) (*Decision, error)
func LoadPolicy(yamlPath string) (*Policy, error)
func CachePolicy(policy *Policy) error
```

---

#### 2. JIT Token Service (`tokens/`)

**Responsibilities:**
- Mint JWT with scoped claims
- TTL: default 60 s, configurable
- HMAC-SHA256 signing · Redis store

**Key Functions:**
```go
func MintAgentToken(scope string, ttl time.Duration, actingFor string) (string, error)
func ValidateToken(token string) (*TokenClaims, error)
func RevokeToken(tokenID string) error
```

**Token Structure:**
```json
{
  "sub": "agent_invoice_bot",
  "scope": "invoice_bot",
  "acting_for": "user_123",
  "exp": 1708185060,
  "permissions": ["approve_refund"],
  "constraints": {
    "max_refund_amount": 50.00
  }
}
```

---

#### 3. Confidence Gate (`confidence/`) ★

**Responsibilities:**
- Accept LLM logprob / score input
- Downgrade scope below threshold
- Route to human queue if < 70%

**Key Functions:**
```go
func EvaluateConfidence(score float64, policy *ConfidencePolicy) (*ConfidenceDecision, error)
func DowngradeScope(originalScope string, confidence float64) string
func QueueForHumanReview(req AuthRequest, reason string) error
```

**This is our moat.** No competitor does this.

---

#### 4. gRPC API Server (`server/`)

**Responsibilities:**
- `authorize()` — human check
- `agentAuthorize()` — agent check
- `mintToken()` — JIT issuing

**Service Definition:**
```protobuf
service AuthPermissionEngine {
  rpc Authorize(AuthRequest) returns (AuthDecision);
  rpc AgentAuthorize(AgentAuthRequest) returns (AgentAuthDecision);
  rpc MintToken(MintTokenRequest) returns (MintTokenResponse);
}
```

---

#### 5. Async Audit Writer (`audit/`)

**Responsibilities:**
- Non-blocking log pipeline
- Buffer + batch flush to cloud
- Structured JSON with trace ID

**Log Schema:**
```json
{
  "trace_id": "trace_abc123",
  "timestamp": "2026-02-17T19:12:00Z",
  "actor": "agent_invoice_bot",
  "action": "approve_refund",
  "resource": {"amount": 45.00},
  "confidence_score": 0.85,
  "decision": "allowed",
  "reason": null,
  "latency_ms": 1.2
}
```

---

#### 6. Policy Sync Worker (`sync/`)

**Responsibilities:**
- Poll control plane every 30 s
- Hot-reload — zero restart needed
- Cryptographic signature verify

**Workflow:**
```
1. Poll: GET /api/policies?version=current
2. Verify: Check HMAC signature
3. Diff: Compare against cached policy
4. Reload: Swap policy in-memory (atomic)
5. Log: Record policy version change
```

---

## SDK Design — TypeScript & Python

**Meet AI developers where they already build.**

### TypeScript SDK

**Installation:**
```bash
npm install prism
```

**Components:**

#### 1. Core Client
```typescript
import { authorize, agentAuthorize, mintAgentToken } from 'prism';

// Human check
const decision = await authorize({
  user: 'user_123',
  action: 'approve_refund',
  resource: { id: 'inv_456' }
});

// Agent check with confidence
const agentDecision = await agentAuthorize({
  actor: 'agent_invoice_bot',
  action: 'approve_refund',
  resource: { amount: 45.00 },
  context: { confidence: 0.85 }  // ← LLM confidence score
});
```

#### 2. LangChain Middleware
```typescript
import { SecureTool } from 'prism/langchain';

const refundTool = new SecureTool({
  name: 'refund_transaction',
  func: async (input) => {
    // Tool implementation
  },
  requiredPermission: 'process_refund'
  // Fails silently if agent lacks permission
  // Returns structured reason to LLM for self-correction
});
```

#### 3. React Hook
```typescript
import { useAgentPermission } from 'prism/react';

function AgentChatBox() {
  const { canExecute, loading } = useAgentPermission('refund_payment');

  return (
    <button disabled={!canExecute || loading}>
      Ask AI to Refund
    </button>
  );
}
```

#### 4. Express Middleware
```typescript
import { authorize } from 'prism/express';

app.post('/refund', authorize('approve_refund'), (req, res) => {
  // Route protected by permission check
});
```

#### 5. Type Definitions
Full TypeScript types for `Policy`, `Decision`, `AgentContext`, `ConfidenceGate`, etc.

---

### Python SDK

**Installation:**
```bash
pip install auth-permission-engine
```

**Components:**

#### 1. Core Client
```python
from auth_pe import authorize, agent_authorize, mint_agent_token

# Human check
decision = await authorize(
    user="user_123",
    action="approve_refund",
    resource={"id": "inv_456"}
)

# Agent check with confidence
agent_decision = await agent_authorize(
    actor="agent_invoice_bot",
    action="approve_refund",
    resource={"amount": 45.00},
    context={"confidence": 0.85}  # ← LLM confidence score
)
```

#### 2. LangGraph Tool Wrapper
```python
from auth_pe.langgraph import SecureTool

@SecureTool(permission="process_refund")
async def refund_transaction(invoice_id: str) -> str:
    # Tool implementation
    pass
```

#### 3. FastAPI Dependency
```python
from auth_pe.fastapi import Authorize

@app.post("/refund")
async def refund(
    body: RefundRequest,
    _: None = Depends(Authorize("approve_refund"))
):
    # Route protected by permission check
    pass
```

#### 4. AutoGPT Plugin
Plugin scaffold for easy AutoGPT integration with context injection at inference time.

#### 5. Pydantic Models
Full schema definitions for `AgentScope`, `Decision`, `ConfidenceContext`, etc.

---

### Shared Design Principles

✓ **Idiomatic to language** — TypeScript uses Promises/async-await, Python uses asyncio  
✓ **Structured error reasons** — LLM gets machine-readable denial reasons for self-correction  
✓ **Async/await first** — Non-blocking by default  
✓ **Zero required config** — Smart defaults, works out of the box

---

## YAML Configuration

**Zero-friction onboarding · Human readable · Version-controlled**

### Example: `auth.yaml`

```yaml
version: "1.0"

roles:
  finance_manager:
    allow: [view_invoices, approve_refunds]

agent_scopes:
  invoice_bot:
    inherits: finance_manager
    constraints:
      - max_refund_amount: 50.00
      - require_human_approval_if_confidence: "< 90%"
      - downgrade_to: read_only_if_confidence: "< 70%"
    deny:
      - delete_invoices
```

### Schema Explained

#### `roles:`
Standard RBAC for human users. Maps directly to familiar allow/deny permission lists.

#### `agent_scopes:`
Agent-only block. Inherits from a role but adds AI-specific constraints that humans never see.

#### `constraints: []`
The safety net. Numeric limits, confidence gates, and auto-downgrade rules live here.

#### `deny:`
Hard denials that override any inherited permission — non-negotiable boundaries for agents.

---

### Why YAML?

- **No SDK required** to change policy
- **Designers & security reviewers** can read it
- **Git-diffable** — version control built-in
- **Maps 1:1** to the `auth.yaml` DevX your first 100 users already expect

---

## Confidence-Aware Auth ★ Core Differentiator

**The feature no competitor has — binding auth to LLM certainty**

### How It Works

```
┌─────────────┐    ┌──────────────┐    ┌──────────────┐    ┌─────────────┐    ┌────────────────┐
│   Agent     │ →  │ Confidence   │ →  │ Confidence   │ →  │   Policy    │ →  │  Action or     │
│   Request   │    │ Score Input  │    │  Gate (Go)   │    │  Decision   │    │  Human Queue   │
└─────────────┘    └──────────────┘    └──────────────┘    └─────────────┘    └────────────────┘
```

### Confidence Thresholds

| Range | Label | Behavior | Icon |
|-------|-------|----------|------|
| **≥ 90%** | **Full Permission** | Agent acts autonomously. Standard agent scope applies. | ✅ |
| **70–89%** | **Requires Human Approval** | Action queued for review. Agent gets structured reason to self-correct. | ⚠️ |
| **< 70%** | **Downgraded to read_only** | Write permissions stripped. Agent can observe but not execute. | 🔒 |
| **< 50%** | **Hard Deny + Alert** | Request blocked. Security alert fired. Audit trace created. | 🚫 |

### Configuration in YAML

```yaml
agent_scopes:
  invoice_bot:
    constraints:
      - require_human_approval_if_confidence: "< 90%"
      - downgrade_to: read_only_if_confidence: "< 70%"
```

### API Call Example

```typescript
const decision = await agentAuthorize({
  actor: 'agent_invoice_bot',
  action: 'approve_refund',
  resource: { amount: 45.00 },
  context: {
    confidence: 0.85  // ← Agent reports 85% confidence
  }
});

if (!decision.allowed) {
  console.log(decision.reason);
  // → "Confidence score 85% requires human approval (threshold: 90%)"
}
```

### Why This Matters

**LLMs are non-deterministic.** Authorization should not pretend otherwise. When an agent is uncertain — signalled by low logprobs or an explicit confidence score — Auth Permission Engine automatically:

1. Downgrades permissions (write → read-only)
2. Routes actions for human review
3. Provides structured feedback to the LLM

**No competitor does this.** This is the moat.

---

## Development Roadmap

**4-Phase Build Plan: From MVP engine to enterprise-ready platform**

### Phase 01 — Foundation (Weeks 1–6)

- Go engine scaffold (gRPC server)
- YAML policy parser & evaluator
- JIT token minting (JWT + Redis)
- TypeScript SDK — core client
- Python SDK — core client
- Docker sidecar packaging

**Milestone:** Design Partner @ Week 4

---

### Phase 02 — Confidence Layer (Weeks 7–12)

- Confidence Gate module (Go)
- Threshold config in YAML
- Human approval queue (Redis stream)
- LangChain SecureTool wrapper (TS)
- LangGraph node wrapper (Python)
- Basic audit log flush to S3

**Milestone:** Confidence Auth Demo @ Week 8

---

### Phase 03 — Cloud Platform (Weeks 13–20)

- Cloud control plane (Go / Postgres)
- Policy push + hot-reload sync
- Trace Explorer UI (Next.js)
- React useAgentPermission hook
- FastAPI / Express middleware
- SOC 2 audit trail groundwork

**Milestone:** First Paying Customer @ Week 16  
**Milestone:** YC Apply @ Week 20

---

### Phase 04 — GA & Scale (Weeks 21–28)

- OSS engine release (GitHub)
- Helm chart for k8s deployment
- AutoGPT Python plugin
- OPA / Rego compatibility layer
- Enterprise SSO (SAML / OIDC)
- Public Trace Explorer SaaS

**Milestone:** Public OSS Launch @ Week 28

---

## Repository Structure

**Monorepo Layout: Single repo, three deployable units — engine, SDKs, platform**

```
auth-permission-engine/
├── engine/                     # Go source
│   ├── evaluator/
│   ├── tokens/
│   ├── confidence/             # ★ differentiator
│   ├── server/                 # gRPC
│   └── audit/
├── sdk/typescript/             # TS SDK
│   ├── src/langchain/
│   └── src/react/
├── sdk/python/                 # Python SDK
│   ├── auth_pe/langgraph/
│   └── auth_pe/fastapi/
├── config/                     # YAML schemas
├── platform/                   # Cloud SaaS
└── docs/                       # This doc
```

### Tech Stack Details

#### Go Engine
- Go 1.22+
- gRPC + protobuf
- Redis (token store)
- Testify (tests)
- Docker multi-stage build

#### TypeScript SDK
- TypeScript 5.x
- Zod (schema validation)
- Vitest (tests)
- npm publish workflow
- ESM + CJS dual output

#### Python SDK
- Python 3.11+
- Pydantic v2
- pytest + httpx
- PyPI publish workflow
- Async-first (asyncio)

### CI/CD

**GitHub Actions:**
- Go tests + race detector
- TS/Python unit tests
- Docker build & push
- Semantic versioning

---

## Next Steps

### Start Building. Ship Confidence-Aware Auth First.

#### Week 1 — Repo + Go scaffold
Init monorepo, gRPC server, YAML parser, first policy evaluator test

#### Week 2 — TypeScript SDK alpha
`authorize()` + `agentAuthorize()` calls wired to Go engine over gRPC

#### Week 3 — Python SDK alpha
Mirror TS SDK in Python. async-first. Pydantic models defined.

#### Week 4 — Design Partner Demo
Confidence gate live. Demo to one fintech AI team. Get feedback.

#### Week 6 — LangChain / LangGraph wrappers
SecureTool (TS) + node wrapper (Python). Silent fail with structured reason.

---

## Appendix — Key Decisions

### Why Go for the Engine?

- **Performance:** Sub-millisecond policy evaluation, handles 10k+ concurrent requests
- **Concurrency:** Goroutines are cheap — perfect for agent request spikes
- **Deployment:** Single binary, no runtime dependencies
- **Ecosystem:** gRPC, protobuf, Redis drivers all first-class
- **Community:** Proven in cloud-native auth (Vault, OPA, Istio)

### Why TypeScript + Python SDKs?

- **Where AI devs are:** LangChain (TS), LangGraph (Python), AutoGPT (Python)
- **Ecosystem fit:** React hooks for TS, FastAPI for Python
- **Type safety:** Both have strong type systems for better DX

### Why YAML for Config?

- **Lowest friction:** No SDK needed to read or write policies
- **Git-friendly:** Diffable, version-controlled, reviewable
- **Universal:** DevOps, security, and non-technical stakeholders can all read it
- **Industry standard:** Kubernetes, Ansible, CI/CD — everyone knows YAML

---

## Contact & Links

- **Documentation:** *(to be published)*
- **GitHub:** *(to be published)*
- **YC Application:** Target Week 20
- **Design Partners:** Seeking fintech AI teams

---

*Auth Permission Engine · Go Engine · TypeScript & Python SDKs · YAML Config · February 2026*