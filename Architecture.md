# Auth Permission Engine — Architecture & Development Plan

> **The Immune System for Autonomous Agents**

**Version:** 2.0 (Updated February 2026 — reflects actual codebase)
**Tech Stack:** Go Engine · TypeScript SDK · Python SDK · Go SDK · MCP SDK · YAML + Rego Config

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [High-Level System Architecture](#high-level-system-architecture)
3. [Go Engine — Core Components](#go-engine--core-components)
4. [Cloud Control Plane (Platform)](#cloud-control-plane-platform)
5. [SDK Design — Go, TypeScript & Python](#sdk-design--go-typescript--python)
6. [YAML + Rego Configuration](#yaml--rego-configuration)
7. [Confidence-Aware Auth ★ Core Differentiator](#confidence-aware-auth--core-differentiator)
8. [Human-in-the-Loop (HITL) Queue](#human-in-the-loop-hitl-queue)
9. [Shadow Mode & Policy Simulator](#shadow-mode--policy-simulator)
10. [Observability & Compliance](#observability--compliance)
11. [Development Roadmap](#development-roadmap)
12. [Repository Structure](#repository-structure)

---

## Executive Summary

### The Problem

Legacy IAM (Okta, SailPoint) was built for humans. AI agents are **non-deterministic**, **ephemeral**, and **act on behalf of users** — none of those systems handle this.

### Our Solution

A policy engine that issues **JIT tokens**, enforces **agent-scoped constraints**, and — uniquely — ties **authorization decisions to LLM confidence scores**.

### The Moat

No competitor links auth to LLM output confidence. **Confidence-Aware Auth** is our defensible technical differentiator.

### Tech Choices

- **Go** for the engine (speed + community)
- **TypeScript, Python, Go SDKs** (where AI devs live)
- **MCP SDK** (Model Context Protocol — Anthropic's emerging agent standard)
- **YAML + OPA/Rego config** (zero friction onboarding)

---

## High-Level System Architecture

**Three layers: Cloud Control Plane · Local Sidecar Engine · Developer SDKs**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CLOUD CONTROL PLANE (Go)                             │
├─────────────┬──────────────┬──────────────┬──────────────┬─────────────────┤
│ Policy Store│ Audit Log DB │Trace Explorer│ Dashboard UI │OIDC / API Auth  │
│ (CRUD API)  │ (PostgreSQL) │  (REST API)  │ (Next.js)    │Compliance Export│
└──────┬──────┴──────┬───────┴──────┬───────┴──────────────┴─────────────────┘
       │ push/pull   │ ingest       │ push
       ↓             ↓              ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                   LOCAL SIDECAR ENGINE — Go                                 │
├──────────────┬─────────────┬───────────────┬────────────────┬───────────────┤
│    Policy    │ JIT Token   │  Confidence   │   HITL         │  Async Audit  │
│  Evaluator   │    Mint     │   Gate ★      │   Queue        │    Writer     │
│  YAML + Rego │   < 2 ms    │  LLM-aware    │ Redis Stream   │ Buffered/S3   │
├──────────────┴─────────────┴───────────────┴────────────────┴───────────────┤
│  Shadow Mode  │  Policy Simulator  │  Incident Webhook  │  Prometheus /metrics│
└──────┬────────┴────────────────────┴────────────────────┴────────────────────┘
       │
       ↓
┌──────────────────┬─────────────────────┬─────────────┬────────────────────┐
│  TypeScript SDK  │    Python SDK       │   Go SDK    │     MCP SDK        │
│  LangChain ·     │  LangGraph ·        │  Backend    │  Anthropic MCP     │
│  React · Express │  FastAPI · AutoGPT  │  Services   │  Tool Server       │
└──────────────────┴─────────────────────┴─────────────┴────────────────────┘
```

---

## Go Engine — Core Components

**Why Go?** Sub-millisecond policy evaluation, goroutines for 10k+ concurrent agent requests, single binary deployment, battle-tested in Hashicorp Vault, OPA, and every major cloud-native auth project.

### Module Breakdown

#### 1. Policy Evaluator (`internal/evaluator/`)

**Responsibilities:**
- Load & hot-swap YAML policies atomically (`sync.RWMutex`)
- OPA / Rego evaluation mode (pluggable via `LoadRegoPolicy`)
- RBAC for humans + agent-scope checks with constraint evaluation

**Domain Types:**
```go
type AuthRequest struct {
    TenantID string; UserID string; Action string; Resource map[string]string
}
type AgentAuthRequest struct {
    TenantID string; Actor string; Action string; Resource map[string]string
    Confidence float64; ActingFor string; Scope string
}
type Decision struct {
    Allowed bool; Reason string; DowngradedScope string
    RequiresHumanReview bool; ConfidenceUsed float64
}
```

**Key Functions:**
```go
func New() *Evaluator
func (e *Evaluator) LoadPolicy(path string) error
func (e *Evaluator) LoadPolicyBytes(data []byte) error       // used by sync worker
func (e *Evaluator) Evaluate(ctx, req AuthRequest) (*Decision, error)
func (e *Evaluator) EvaluateAgent(ctx, req AgentAuthRequest) (*Decision, error)
func (e *Evaluator) LoadRegoPolicy(path, query string) error // enables OPA mode
```

**Evaluation Flow (Agent):**
1. Hard deny overrides (agent `deny:` list)
2. Confidence constraints from `agent_scopes[actor].constraints[]`
3. Inherited role permission check
4. Return `Decision` with optional `downgraded_scope` and `requires_human_review`

---

#### 2. JIT Token Service (`internal/tokens/`)

**Responsibilities:**
- Mint short-lived JWT with scoped claims (HMAC-SHA256)
- Default TTL: 60 s, configurable per request
- Revocation via Redis key deletion

**Key Functions:**
```go
func (s *Service) MintAgentToken(scope, actingFor string, ttl time.Duration) (string, tokenID string, expiresAt int64, error)
func (s *Service) ValidateToken(token string) (*TokenClaims, error)
func (s *Service) RevokeToken(tokenID string) error
```

**Token Structure:**
```json
{
  "sub": "agent_invoice_bot",
  "scope": "invoice_bot",
  "acting_for": "user_123",
  "exp": 1708185060,
  "permissions": ["approve_refund"],
  "constraints": { "max_refund_amount": 50.00 }
}
```

---

#### 3. Confidence Gate (`internal/confidence/`) ★

**Responsibilities:**
- Accept LLM logprob / score input
- Apply 4-level threshold policy
- Support per-scope custom thresholds via `confidence.Policy`

**Confidence Levels:**
```go
const (
    ThresholdFull     = 0.90  // full permission
    ThresholdHuman    = 0.70  // requires human review
    ThresholdHardDeny = 0.50  // hard deny + alert
)

type Level int
const (
    LevelFullPermission Level = iota  // ≥ 90%
    LevelRequiresHuman                // 70–89%
    LevelReadOnly                     // 50–69%
    LevelHardDeny                     // < 50%
)
```

**Per-Scope Custom Thresholds (via `confidence.Policy`):**
```go
type Policy struct {
    FullPermissionAbove float64  // defaults to 0.90
    HumanReviewAbove    float64  // defaults to 0.70
    HardDenyBelow       float64  // defaults to 0.50
}
```

**Key Functions:**
```go
func (g *Gate) Evaluate(ctx, score float64, policy *Policy) (*Decision, error)
```

---

#### 4. Confidence Signal Extractor (`internal/confidence/extract.go`) ★

**New — not in original Architecture.md**

Converts raw LLM provider output to a normalized confidence score.

**Supported Providers:**
| Provider | Input | Method |
|---|---|---|
| `openai` | `token_logprobs []float64` | `exp(logprob)` → average |
| `anthropic` | `token_logprobs []float64` | same as OpenAI |
| `local` | `token_probabilities []float64` or `entropy + entropy_max` | average probs or `1 - (entropy/max)` |

**API:**
```go
type Signal struct {
    Provider           Provider   // "openai" | "anthropic" | "local"
    TokenLogProbs      []float64  // OpenAI/Anthropic
    TokenProbabilities []float64  // local models
    Entropy            *float64   // local models
    EntropyMax         *float64
}

func ExtractScore(sig *Signal) (float64, error)
```

**Usage in agent authorize:**
```json
{
  "actor": "invoice_bot",
  "action": "approve_refunds",
  "confidence_signal": {
    "provider": "openai",
    "token_logprobs": [-0.04, -0.05, -0.03]
  }
}
```

---

#### 5. HTTP API Server (`internal/server/`)

**All 12 Live Routes:**

| Method | Path | Description |
|---|---|---|
| `POST` | `/v1/authorize` | Human authorization check |
| `POST` | `/v1/agent/authorize` | Agent authorization with confidence gate ★ |
| `POST` | `/v1/tokens/mint` | Mint JIT scoped token |
| `DELETE` | `/v1/tokens/{tokenID}` | Revoke a JIT token |
| `POST` | `/v1/simulator/replay` | Policy replay — blast radius before deploying changes |
| `GET` | `/v1/shadow/summary` | Shadow mode statistics (per-minute buckets) |
| `GET` | `/v1/queue/pending` | List pending human review requests |
| `GET` | `/v1/queue/{id}` | Get a single review request |
| `POST` | `/v1/queue/{id}/approve` | Approve a queued agent action |
| `POST` | `/v1/queue/{id}/deny` | Deny a queued agent action |
| `GET` | `/healthz` | Health check |
| `GET` | `/metrics` | Prometheus metrics endpoint |

**Enforcement Modes:**
```go
type EnforcementMode string
const (
    EnforcementModeEnforce EnforcementMode = "enforce"  // default
    EnforcementModeShadow  EnforcementMode = "shadow"   // observe-only
)
// Set via: PRISM_MODE=shadow docker compose up -d
```

**Missing Confidence Signal Modes:**
```go
type MissingConfidenceMode string
const (
    MissingConfidenceDeny     = "deny"      // default — block if no signal
    MissingConfidenceReview   = "review"    // route to human if no signal
    MissingConfidenceReadOnly = "read_only" // downgrade if no signal
)
```

**Shadow Mode Response Fields:**
```json
{
  "allowed": true,
  "shadow_mode": true,
  "would_have_allowed": false,
  "would_have_reason": "confidence 65% downgraded to read_only (threshold 70%)",
  "would_have_requires_human_review": false
}
```

**Prometheus Metrics (live):**
```
prism_http_requests_total{method, path, status}
prism_http_request_duration_seconds{method, path}
prism_auth_decisions_total{type, allowed}
```

---

#### 6. Async Audit Writer (`internal/audit/`)

**Responsibilities:**
- Non-blocking buffered pipeline (channel depth: 4096, flush every 500 ms)
- Batch flush (100 events/batch) to configurable `io.Writer` sink
- Supports stdout (default) and S3 (`audit/s3sink/`)

**Audit Event Schema:**
```go
type Event struct {
    TenantID        string
    TraceID         string            // UUID auto-generated
    Timestamp       time.Time
    Actor           string
    Action          string
    Resource        map[string]string
    ConfidenceScore float64
    Decision        string            // "allowed" | "denied" | "human_review"
    Reason          string
    DowngradedScope string
    LatencyMS       float64
}
```

**Key Functions:**
```go
func New(cfg ...Config) *Writer
func (w *Writer) Log(e Event)
func (w *Writer) LogDecision(ctx, tenantID, actor, action string, resource map[string]string, allowed bool, reason string, conf, latencyMS float64)
func (w *Writer) Close()
```

---

#### 7. Human-Approval Queue (`internal/queue/`)

Backed by **Redis Streams** (`prism:review:stream`) + Redis Hash per item. See [HITL Queue section](#human-in-the-loop-hitl-queue).

---

#### 8. Incident Webhook Notifier (`internal/incident/`)

**New — not in original Architecture.md**

Fires a JSON POST to a configurable webhook URL on high-risk events (deny / human_review). Non-blocking; 2 s default timeout.

**Event Schema:**
```go
type Event struct {
    Timestamp           string
    Type                string  // "authorization.denied" | "authorization.review"
    Severity            string  // "high" | "medium"
    TenantID            string
    Actor               string
    ActingFor           string
    Action              string
    TraceID             string
    Reason              string
    Decision            string
    RequiresHumanReview bool
    ConfidenceUsed      float64
    Resource            map[string]string
}
```

**Configuration:**
```bash
INCIDENT_WEBHOOK_URL=https://your-pagerduty-or-slack-endpoint
INCIDENT_WEBHOOK_TIMEOUT_MS=2000
```

---

#### 9. Policy Sync Worker (`internal/sync/`)

**Responsibilities:**
- Poll control plane every 30 s (default, configurable)
- ETag-based deduplication (skips reload if policy unchanged)
- HMAC-SHA256 signature verification (rejects tampered policies)
- Hot-reload — zero restart needed

**Workflow:**
```
1. GET /api/v1/policies/{name} with If-None-Match: <etag>
2. 304 Not Modified → skip (policy unchanged)
3. 200 OK → verify X-Prism-Signature header (HMAC-SHA256)
4. Signature valid → LoadPolicyBytes() (atomic hot-swap)
5. Update ETag from response header
```

**Key Functions:**
```go
func New(cfg Config, loader PolicyLoader) *Worker
func (w *Worker) Start(ctx context.Context)  // blocks until ctx cancelled
```

---

## Cloud Control Plane (Platform)

The Platform is a separate Go service exposing the management API. It is the source of truth for policies and the long-term audit store.

### Platform HTTP Routes

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v1/policies` | List all policies |
| `GET` | `/api/v1/policies/{name}` | Get a named policy |
| `PUT` | `/api/v1/policies/{name}` | Create or update a policy |
| `DELETE` | `/api/v1/policies/{name}` | Delete a policy |
| `GET` | `/api/v1/audit` | Query audit events (filter by actor, action, decision, time window) |
| `GET` | `/api/v1/audit/trace/{traceID}` | Get all events for a trace |
| `POST` | `/api/v1/audit/ingest` | Receive audit events from engine sidecar |
| `GET` | `/api/v1/compliance/export` | Export compliance evidence (OWASP GenAI / NIST AI RMF) |
| `GET` | `/healthz` | Platform health |

### Authentication (Platform)

The platform supports three authentication mechanisms via the `auth` middleware:
1. **API Key** — `Authorization: Bearer <key>` (SHA-256 constant-time compare)
2. **OIDC JWT** — enterprise identity provider tokens (via `go-oidc/v3`)
3. **Trusted Header** — `X-Forwarded-User` (for internal service mesh deployments)

**OIDC Configuration:**
```bash
OIDC_ISSUER_URL=https://your-idp.example.com
OIDC_AUDIENCE=prism-platform
```

### Compliance Export (`GET /api/v1/compliance/export`)

Generates auditor-ready control evidence mapped to OWASP GenAI or NIST AI RMF frameworks.

**Query Params:**
- `framework`: `owasp_genai` | `nist_ai_rmf` | `all`
- `from` / `to`: RFC3339 time window

**Control Mapping:**
| Event Type | OWASP Control | NIST AI RMF Control |
|---|---|---|
| `denied` | `OWASP-LLM01` Prompt Injection Controls | `NIST-AI-RMF-MAP-2.3` Risk-Based Decision Controls |
| `human_review` | `OWASP-LLM06` Sensitive Action Approval | `NIST-AI-RMF-GOV-1.6` Human Oversight Procedures |
| `denied` or `human_review` | `OWASP-LLM08` Excessive Agency Mitigation | — |
| any | — | `NIST-AI-RMF-MEASURE-2.11` Decision Logging |

**Evidence Signing** (optional):
```bash
EVIDENCE_SIGNING_KEY=replace-with-strong-secret
# Adds HMAC-SHA256 signature to every compliance export response
```

**Response includes:** `checksum_sha256`, optional `signature`, `algorithm: "hmac-sha256"`

---

## SDK Design — Go, TypeScript & Python

**Meet AI developers where they already build.**

### Go SDK (`sdk/go/`)

```go
client := prism.NewClient(prism.ClientConfig{
    BaseURL: "http://localhost:8082",
    APIKey:  "your-api-key",
})

decision, err := client.AgentAuthorize(ctx, prism.AgentAuthRequest{
    Actor:      "support_agent",
    Action:     "issue_refund",
    Confidence: 0.85,
})
```

### TypeScript SDK (`sdk/typescript/`)

**Installation:**
```bash
npm install prizm-engine  # ← will be renamed to prism-auth
```

**`PrismClient` methods:**
```typescript
const prism = new PrismClient({ baseUrl: "http://localhost:8082", apiKey: "..." });

await prism.authorize({ userId, action, resource });
await prism.agentAuthorize({ actor, action, context: { confidence, actingFor, scope } });
await prism.mintToken({ scope, actingFor, ttlSeconds: 60 });
await prism.revokeToken(tokenId);
await prism.isHealthy();
```

**Framework integrations:**
- **LangChain** — `SecureTool` wrapper (`sdk/typescript/src/langchain/`)
- **React** — `useAgentPermission(action)` hook (`sdk/typescript/src/react/`)
- **Express** — `authorize(action)` middleware (`sdk/typescript/src/express/`)

### Python SDK (`sdk/python/`)

**Installation:**
```bash
pip install prizm-engine  # ← will be renamed to prism-auth
```

**Framework integrations:**
- **LangGraph** — `SecureTool` decorator (`auth_pe/langgraph/`)
- **FastAPI** — `Authorize(action)` dependency (`auth_pe/fastapi/`)
- **AutoGPT** — plugin scaffold (`autogpt_plugin/`)

### MCP SDK (`sdk/mcp/`) ★ New

**Model Context Protocol** support — Anthropic's emerging standard for agent tool servers. Prism exposes a Prism-secured MCP tool server that injects authorization checks at the protocol level.

---

## YAML + Rego Configuration

### YAML Policy (`auth.yaml`)

```yaml
version: "1.0"

roles:
  finance_manager:
    allow: [view_invoices, approve_refunds]
    deny: []

agent_scopes:
  invoice_bot:
    inherits: finance_manager
    constraints:
      - max_refund_amount: 50.00
      - require_human_approval_if_confidence_below: 0.90
      - downgrade_to_read_only_if_confidence_below: 0.70
      - hard_deny_if_confidence_below: 0.50
    deny:
      - delete_invoices
```

**Schema:**
- `roles:` — RBAC for humans. `allow` / `deny` action lists.
- `agent_scopes:` — Agents only. Inherits a role + adds AI-specific constraints.
- `constraints:[]` — Numeric limits, confidence gates, and auto-downgrade rules.
- `deny:` — Hard overrides that cannot be inherited or bypassed.

### OPA / Rego Mode

```bash
REGO_POLICY_PATH=./config/auth.rego
REGO_POLICY_QUERY=data.prism.authz
# Or load a directory of plugins:
REGO_POLICY_PATH=./config/plugins/
```

The Rego rule must return:
```rego
{
  "allowed": bool,
  "reason": string,
  "downgraded_scope": string,
  "requires_human_review": bool
}
```

---

## Confidence-Aware Auth ★ Core Differentiator

**The feature no competitor has — binding auth to LLM certainty**

### How It Works

```
┌─────────────┐    ┌──────────────────┐    ┌──────────────┐    ┌─────────────┐    ┌────────────────┐
│   Agent     │ →  │  Signal Extractor│ →  │  Confidence  │ →  │   Policy    │ →  │  Action or     │
│   Request   │    │ (logprobs/entropy)│    │  Gate (Go)   │    │  Evaluator  │    │  Human Queue   │
└─────────────┘    └──────────────────┘    └──────────────┘    └─────────────┘    └────────────────┘
```

### Confidence Thresholds

| Range | Label | Behavior |
|---|---|---|
| **≥ 90%** | Full Permission | Agent acts autonomously. |
| **70–89%** | Human Review | Action queued. Structured reason returned for LLM self-correction. |
| **50–69%** | Read-Only | Write permissions stripped automatically. |
| **< 50%** | Hard Deny | Request blocked. Security alert fired. Audit trace created. |

### Using Raw Confidence vs. Provider Signal

**Raw (simple):**
```json
{ "actor": "invoice_bot", "action": "approve_refunds", "confidence": 0.85 }
```

**Provider-verified (preferred — cannot be spoofed):**
```json
{
  "actor": "invoice_bot",
  "action": "approve_refunds",
  "confidence_signal": {
    "provider": "openai",
    "token_logprobs": [-0.04, -0.05, -0.03]
  }
}
```

**`AllowUnverifiedConfidence` flag:** Control whether raw `confidence` floats are accepted (default: only provider signals).

---

## Human-in-the-Loop (HITL) Queue

**New section — not in original Architecture.md**

When the confidence gate returns `RequiresHumanReview: true`, the action is automatically enqueued for human approval via the HITL Queue.

### Architecture

Backed by **Redis Streams** (`prism:review:stream`) for fan-out + a **Redis Hash per item** (`prism:review:pending:<id>`) for O(1) lookup.

### ReviewRequest Lifecycle

```
Enqueue (confidence too low)
    ↓
Status: pending  (TTL: 24 hours)
    ↓
Human calls POST /v1/queue/{id}/approve  or  POST /v1/queue/{id}/deny
    ↓
Status: approved | denied  (TTL: 7 days for audit)
```

### HITL Queue Functions
```go
func (q *Queue) Enqueue(ctx, tenantID, actor, action string, resource map[string]string, confidence float64, reason, actingFor string) (string, error)
func (q *Queue) Get(ctx, id string) (*ReviewRequest, error)
func (q *Queue) ListPending(ctx, limit int64) ([]ReviewRequest, error)
func (q *Queue) Approve(ctx, id, resolvedBy, note string) error
func (q *Queue) Deny(ctx, id, resolvedBy, note string) error
```

### ReviewRequest Schema

```go
type ReviewRequest struct {
    ID              string
    TenantID        string
    Actor           string
    Action          string
    Resource        map[string]string
    ConfidenceScore float64
    Reason          string
    ActingFor       string
    EnqueuedAt      time.Time
    Status          Status  // pending | approved | denied
    ResolvedAt      *time.Time
    ResolvedBy      string
    ResolutionNote  string
}
```

---

## Shadow Mode & Policy Simulator

**New section — not in original Architecture.md**

### Shadow Mode

Deploy Prism in **observe-before-enforce** mode. All decisions are computed but not enforced.

**Activation:**
```bash
PRISM_MODE=shadow docker compose up -d
```

**Shadow response includes:**
```json
{
  "allowed": true,
  "shadow_mode": true,
  "would_have_allowed": false,
  "would_have_reason": "confidence 65% requires read_only downgrade",
  "would_have_requires_human_review": false
}
```

**Shadow summary endpoint:**
```
GET /v1/shadow/summary?window_minutes=60
```
Returns per-minute buckets of `allow`, `review`, `deny` — ready for dashboard charting.

### Policy Simulator / Replay

Test a proposed policy change against historical or synthetic traces **before deploying it**.

**Endpoint:** `POST /v1/simulator/replay`

```json
{
  "proposed_policy_yaml": "version: \"1.0\"\nagent_scopes:\n  ...",
  "traces": [
    { "id": "t1", "kind": "agent", "actor": "invoice_bot", "action": "approve_refunds", "confidence": 0.92 },
    { "id": "t2", "kind": "human", "user_id": "user_123", "action": "approve_refunds" }
  ]
}
```

**Response includes:**
- Per-trace `before` / `after` outcomes (`allow` | `review` | `deny`)
- Blast radius summary: `changed`, `allow_to_deny`, `allow_to_review`, `review_to_deny`, etc.

---

## Observability & Compliance

### Prometheus Metrics (`GET /metrics`)

```
prism_http_requests_total{method, path, status}
prism_http_request_duration_seconds{method, path}
prism_auth_decisions_total{type, allowed}
```

Integrate with Grafana, Datadog Agent, or any Prometheus-compatible scraper.

### Audit Log Pipeline

```
Agent Request → Engine Decision → audit.Writer (channel buffer 4096)
                                      ↓ (flushes every 500ms, batch 100)
                              stdout JSON  OR  S3 Sink (audit/s3sink/)
                                      ↓
                          POST /api/v1/audit/ingest → Platform DB
```

### Compliance Export (OWASP GenAI / NIST AI RMF)

See [Cloud Control Plane](#compliance-export-get-apiv1complianceexport) section.

---

## Development Roadmap

**Current Status: Phase 01 + Phase 02 + Phase 03 (partial) COMPLETE**

### ✅ Phase 01 — Foundation (Complete)
- Go engine scaffold (HTTP server)
- YAML policy parser & evaluator
- JIT token minting (JWT + Redis)
- TypeScript SDK — core client
- Python SDK — core client
- Go SDK — core client
- Docker sidecar packaging

### ✅ Phase 02 — Confidence Layer (Complete)
- Confidence Gate module (Go) — 4-level threshold
- Confidence Signal Extractor (OpenAI, Anthropic, local entropy)
- Per-scope custom confidence thresholds
- Missing confidence signal modes (deny / review / read_only)
- Human approval queue (Redis stream)
- LangChain SecureTool wrapper (TS)
- LangGraph node wrapper (Python)
- Async audit log
- Incident webhook notifier

### ✅ Phase 03 — Cloud Platform (Partial)
- Cloud control plane (Go)
- Policy CRUD API + hot-reload sync (ETag + HMAC verification)
- Trace Explorer API
- Shadow Mode (full implementation)
- Policy Simulator / Replay (`/v1/simulator/replay`)
- OIDC authentication for Platform
- Compliance Export (OWASP GenAI / NIST AI RMF) with HMAC-signed evidence
- Prometheus metrics endpoint

### 🔲 Phase 03 — Remaining
- Trace Explorer UI (Next.js dashboard)
- React `useAgentPermission` hook
- SOC 2 Type II formal groundwork

### 🔲 Phase 04 — GA & Scale
- **Multi-agent delegation** (agent-to-agent scope delegation)
- OSS engine public release (GitHub)
- Helm chart for k8s (started in `helm/`)
- OPA / Rego compatibility expansion
- Enterprise SSO (SAML / OIDC — foundation exists)
- SCIM provisioning for agent identities
- Public Trace Explorer SaaS
- Slack / PagerDuty native HITL integration
- Brand unification: `prism-auth` npm + PyPI package names

---

## Repository Structure

```
Prism/
├── engine/                        # Go sidecar engine
│   ├── cmd/                       # main.go entry point
│   ├── internal/
│   │   ├── evaluator/             # YAML + Rego policy evaluation
│   │   ├── tokens/                # JIT token mint / revoke
│   │   ├── confidence/            # ★ Confidence Gate + Signal Extractor
│   │   ├── server/                # HTTP API (12 routes)
│   │   ├── queue/                 # Redis Stream HITL queue
│   │   ├── audit/                 # Buffered async audit writer
│   │   │   └── s3sink/            # S3 audit destination
│   │   ├── incident/              # Webhook notifier
│   │   └── sync/                  # Policy sync worker (ETag + HMAC)
│   └── proto/                     # gRPC protobuf (Phase 2)
│
├── platform/                      # Cloud control plane
│   ├── cmd/
│   ├── internal/
│   │   ├── handlers/              # HTTP handlers + OIDC auth
│   │   ├── policy/                # Policy store
│   │   ├── audit/                 # Audit store
│   │   └── db/                    # Database layer
│   └── ui/                        # Dashboard UI (Next.js)
│
├── sdk/
│   ├── go/                        # Go SDK
│   ├── typescript/                # TypeScript SDK (LangChain, React, Express)
│   │   └── src/
│   │       ├── client.ts          # PrismClient
│   │       ├── langchain/         # SecureTool wrapper
│   │       ├── react/             # useAgentPermission hook
│   │       └── express/           # authorize() middleware
│   ├── python/                    # Python SDK
│   │   └── auth_pe/               # ← to be renamed to prism/
│   │       ├── langgraph/
│   │       ├── fastapi/
│   │       └── autogpt_plugin/
│   └── mcp/                       # MCP (Model Context Protocol) SDK
│
├── config/                        # YAML schemas + example Rego
├── helm/                          # Helm chart (k8s)
├── docker-compose.yml
├── Makefile
├── README.md
├── ACTION_PLAN.md                 # ← New: YC action plan
└── Architecture.md                # This document
```

### Tech Stack

| Component | Technology |
|---|---|
| Engine | Go 1.22+, net/http, Redis, JWT |
| Platform | Go 1.22+, PostgreSQL |
| Dashboard | Next.js (in `platform/ui/`) |
| TypeScript SDK | TypeScript 5.x, Zod, Vitest |
| Python SDK | Python 3.11+, Pydantic v2, pytest |
| Go SDK | Go 1.22+ |
| MCP SDK | TypeScript |
| Metrics | Prometheus + Grafana |
| CI/CD | GitHub Actions |
| Containers | Docker multi-stage, Helm (k8s) |

---

## Contact & Links

- **GitHub:** Abenezer0923/Prism
- **Action Plan:** `ACTION_PLAN.md`
- **YC Evaluation:** See artifact `prism_yc_evaluation.md`
- **YC Application Target:** Week 8 (accelerated from original Week 20)

---

*Auth Permission Engine · Go · TypeScript · Python · Go · MCP · February 2026 · v2.0*