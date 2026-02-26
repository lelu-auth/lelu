# Prism — Action Plan
> **Goal:** Get Prism from "strong architecture" to "YC-competitive" in 8–12 weeks.

---

## 📊 Current State Summary (as of Feb 2026)

| Layer | Status |
|---|---|
| Go Engine – Core | ✅ Fully built (evaluator, tokens, confidence gate, queue, audit, sync, incident) |
| Go Engine – HTTP API | ✅ 12 live routes including HITL queue, shadow mode, policy simulator |
| Confidence-Aware Auth | ✅ Implemented (4 levels + per-scope custom thresholds + logprob extractor) |
| Python SDK | ✅ Built (LangGraph, FastAPI, AutoGPT plugin) |
| TypeScript SDK | ✅ Built (PrismClient, LangChain SecureTool, React hook, Express middleware) |
| Go SDK | ✅ Built |
| MCP SDK | ✅ Built |
| Platform (Cloud Control Plane) | ✅ Built (policy CRUD, audit store, trace explorer, compliance export, OIDC) |
| Prometheus Metrics | ✅ Live (`/metrics` endpoint) |
| S3 Audit Sink | ✅ Built |
| Compliance Export (OWASP / NIST) | ✅ Built with HMAC-signed evidence |
| Shadow Mode | ✅ Fully operational |
| Policy Simulator / Replay | ✅ Fully operational |
| **Design Partners / Customers** | ❌ Zero |
| **Public GitHub / OSS** | ❌ Not published |
| **Brand Consistency** | ❌ `prism` / `prizm-engine` / `auth-pe` mismatch |
| **Paid Tier / Monetization** | ❌ Not started |
| **Demo Video** | ❌ Not created |

---

## 🗺️ The 5 Recommendations — Execution Plan

---

### ✅ Recommendation 1: Ship 3 Design Partners in Production

**Why:** YC invests in "lines, not dots." One real customer > 1000 lines of architecture.

**Target Customer Profile:**
- Fintech or enterprise team
- Currently building with LangChain (TS) or LangGraph (Python)
- Has an AI agent making financial or sensitive decisions
- Concerned about compliance (SOC 2, HIPAA, or GDPR)

#### Steps

- [ ] **Week 1** — Write a 1-page "Design Partner brief" (problem → Prism → what you get for free)
- [ ] **Week 1** — Identify 20 target companies (fintech AI teams on LinkedIn, GitHub, YC alumni network)
- [ ] **Week 2** — Reach out to all 20 personally (not a mass email — specific to their stack)
- [ ] **Week 2** — Offer: free white-glove onboarding, direct Slack access, co-authoring a case study
- [ ] **Week 3** — Target 3 signed design partners; do their integration for them
- [ ] **Week 4** — Document one partner's story as a 500-word case study (with quotes)
- [ ] **Week 6** — Have at least one partner using Prism in CI or staging

**Success Metric:** 1 partner with documented usage in staging; 1 quote you can use in YC application.

---

### ✅ Recommendation 2: Publish OSS Engine on GitHub

**Why:** Stars = social proof = inbound leads = YC signal. The engine is already built.

#### Steps

- [ ] **Week 1** — Unify the brand first (see Recommendation 5 below)
- [ ] **Week 1** — Clean up repo: add `LICENSE` (MIT), finalize `README.md` as the landing page
- [ ] **Week 1** — Write a `QUICKSTART.md` (5-minute path from `git clone` to first confident auth decision)  
- [ ] **Week 2** — Add GitHub Actions badges (CI, test, coverage)
- [ ] **Week 2** — Create GitHub releases with semantic versioning for `engine`, `sdk/go`, `sdk/typescript`, `sdk/python`
- [ ] **Week 2** — Post launch on:
  - Hacker News (Show HN: "I built an auth engine that knows when your AI agent is uncertain")
  - r/MachineLearning, r/LangChain, r/golang
  - Dev.to article: "Why your AI agent needs confidence-aware authorization"
  - LinkedIn + X (Twitter)
- [ ] **Week 3** — Announce on LangChain Discord and LangGraph GitHub discussions
- [ ] **Week 4** — Monitor stars, issues, and PRs; respond within 24 h

**Success Metric:** 200+ GitHub stars in 4 weeks; at least 2 external issues or PRs opened.

---

### ✅ Recommendation 3: Unify the Brand to "Prism"

**Why:** Brand inconsistency signals incomplete product thinking to YC and developers.

**Current Problem:**
- Project name: `Prism`
- TypeScript npm package: `prizm-engine`
- Python import: `auth_pe`
- Architecture doc calls it: "Auth Permission Engine"
- Go module: `github.com/prism/engine`

#### Steps

- [ ] **Week 1 — Decision:** Confirm final name. Recommendation: **Prism** everywhere.
- [ ] **Week 1 — Go module:** `github.com/prism/engine` → keep or rename to `github.com/yourusername/prism`
- [ ] **Week 1 — TypeScript npm:** Rename `prizm-engine` package → `@prism/sdk` or `prism-auth`
- [ ] **Week 1 — Python PyPI:** Rename `auth_pe` → `prism-auth` or `prism-sdk`
- [ ] **Week 1 — Python import:** `from auth_pe import ...` → `from prism import ...`
- [ ] **Week 1 — Update all README, Architecture.md, POSTMAN.md** references
- [ ] **Week 1 — Update docker-compose.yml** service names if needed
- [ ] **Week 2 — Register domain:** `prism.dev` or `useprism.dev` or `prismauth.dev`

**Files to update:**
- `sdk/typescript/package.json` — package name field
- `sdk/python/pyproject.toml` — package name field
- `sdk/python/auth_pe/` folder — rename to `prism/`
- `Architecture.md` — all references to "Auth Permission Engine"
- `README.md` — SDK install commands
- `POSTMAN.md` — any references

---

### ✅ Recommendation 4: Add Multi-Agent Authorization (Agent-to-Agent)

**Why:** Biggest open whitespace. CrewAI, LangGraph multi-agent, AutoGPT all run agent chains. No standard exists for agent-to-agent delegation scopes. **This is your patent moat expansion.**

#### Design

An agent (`orchestrator_agent`) should be able to delegate a constrained sub-scope to another agent (`research_agent`) without passing its full scope.

```yaml
# auth.yaml — new delegation block
agent_scopes:
  orchestrator_agent:
    allow: [research, write_report, approve_budget]
    can_delegate:
      - to: research_agent
        scoped_to: [research]
        max_ttl_seconds: 300
        require_confidence_above: 0.85
```

#### Steps

- [ ] **Week 5** — Add `can_delegate` block to YAML `AgentScope` schema in `evaluator/evaluator.go`
- [ ] **Week 5** — Add `POST /v1/agent/delegate` endpoint to `server/server.go`
  - Input: `{ delegator: "orchestrator", delegatee: "research_agent", scope: [...], ttl: 300, confidence: 0.92 }`
  - Validates delegator's `can_delegate` rules
  - Mints a constrained child JIT token via `tokens/tokens.go`
- [ ] **Week 5** — Add `delegation_chain` field to audit events
- [ ] **Week 6** — Add SDK support: `prism.delegateScope(...)` in TypeScript and Python
- [ ] **Week 7** — Write integration test with a CrewAI-style 2-agent scenario
- [ ] **Week 8** — Publish blog post: "The missing standard for AI agent-to-agent authorization"

**Success Metric:** Working demo of orchestrator delegating constrained scope to sub-agent, with full audit trail showing delegation chain.

---

### ✅ Recommendation 5: Make Shadow Mode the Primary Sales Motion

**Why:** Enterprises will never deploy a new auth layer in enforce mode day one. Shadow mode eliminates procurement friction and gives Prism a free-tier land-and-expand mechanic.

**Current State:** Shadow mode is already fully implemented (`EnforcementModeShadow`, `handleShadowSummary`). The problem is that **no one knows it exists** — it's not prominently featured in any marketing or onboarding flow.

#### Steps

- [ ] **Week 1** — Add a dedicated "Shadow Mode" section to `README.md` with the `PRISM_MODE=shadow docker compose up -d` quick start
- [ ] **Week 2** — Build a "Shadow Mode Dashboard View" in the Platform UI:
  - Show `would_have_allowed` vs `allowed` counts over time
  - Show the delta (how many would have been blocked in enforce mode)
  - Call to action: "Ready to enforce? Change one env var."
- [ ] **Week 2** — Create a `GET /v1/shadow/report` endpoint that returns a formatted human-readable blast radius report (PDF-ready summary)
- [ ] **Week 3** — Write pricing page copy: "Start Free in Shadow Mode. Pay when you enforce."
- [ ] **Week 3** — For design partners: deploy shadow mode first, show them their blast radius report after 1 week, then offer enforce mode upgrade
- [ ] **Week 4** — Record a 90-second demo video:
  - Start: agent runs in shadow mode, logs pile up
  - Middle: blast radius report shows "12 would-have-been-unsafe actions in 7 days"  
  - End: one env var flip → enforce mode → agent stopped dead on low confidence
  
**Success Metric:** All 3 design partners onboarded through shadow mode. At least one shadow-to-enforce conversion documented.

---

## 📅 8-Week Sprint Calendar

| Week | Primary Focus | Deliverables |
|---|---|---|
| **1** | Brand unification + OSS prep + outreach start | Unified repo, `QUICKSTART.md`, 20 outreach emails sent |
| **2** | OSS launch + design partner funnel | GitHub public launch, Show HN post, 3 partner calls booked |
| **3** | Design partner onboarding | Shadow mode live for 1-2 partners, blast radius reports shared |
| **4** | Shadow → enforce conversion + demo video | Demo video published, 1 partner in enforce mode |
| **5** | Multi-agent delegation design + build | `agent_scopes.can_delegate` YAML schema + engine endpoint |
| **6** | SDK delegation support + SDK integrations | `prism.delegateScope()` in TS + Python; CrewAI integration |
| **7** | Documentation sprint + compliance story | API docs published, compliance case study drafted |
| **8** | YC application polish | 3 design partners ✅, OSS live ✅, demo ✅ → Apply |

---

## 🚦 YC Application Readiness Checklist

> Target: Week 20 per roadmap → **Accelerate to Week 8** based on where engine currently is.

- [ ] **Brand:** All packages, docs, and endpoints say "Prism"
- [ ] **OSS:** GitHub is public with ≥ 100 stars and README as landing page
- [ ] **Customer:** ≥ 1 design partner using Prism in staging or production
- [ ] **Quote:** ≥ 1 testimonial from a technical founder or security engineer
- [ ] **Demo:** 90-second video showing confidence gate + HITL queue in action
- [ ] **One-liner:** "Prism is the auth layer that stops AI agents from doing dangerous things — especially when the AI isn't sure itself."
- [ ] **Competitive answer:** 30-second crisp response to "How are you different from Alter?" (Confidence-Aware Auth is the answer)
- [ ] **ICP defined:** "Fintech AI teams deploying LangChain/LangGraph agents handling $50+ financial decisions"
- [ ] **Domain registered:** `prism.dev` or equivalent
- [ ] **Metrics to share:** GitHub stars, weekly active users, latency benchmarks

---

## 🔗 Key Files Reference

| Purpose | File |
|---|---|
| Engine entry point | `engine/cmd/` |
| All HTTP routes | `engine/internal/server/server.go` |
| Confidence gate logic | `engine/internal/confidence/confidence.go` |
| Logprob extractor (OpenAI/Anthropic) | `engine/internal/confidence/extract.go` |
| YAML policy evaluator | `engine/internal/evaluator/evaluator.go` |
| OPA/Rego evaluation | `engine/internal/evaluator/rego.go` |
| HITL queue (Redis Stream) | `engine/internal/queue/queue.go` |
| Incident webhook notifier | `engine/internal/incident/notifier.go` |
| Async audit pipeline | `engine/internal/audit/audit.go` |
| S3 audit sink | `engine/internal/audit/s3sink/s3sink.go` |
| Policy sync worker | `engine/internal/sync/sync.go` |
| Platform policy CRUD | `platform/internal/handlers/handlers.go` |
| Platform OIDC auth | `platform/internal/handlers/oidc.go` |
| Compliance export (OWASP/NIST) | `platform/internal/handlers/handlers.go` → `handleComplianceExport` |
| TypeScript SDK client | `sdk/typescript/src/client.ts` |
| Python SDK | `sdk/python/auth_pe/` |
| MCP SDK | `sdk/mcp/` |
| Architecture (now updated) | `Architecture.md` |

---

*Prism Action Plan · February 2026 · v1.0*
