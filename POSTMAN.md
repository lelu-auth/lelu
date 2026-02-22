# Prism — Postman Testing Guide

> **How to test the Auth Permission Engine API and understand what each endpoint does**

---

## Prerequisites

1. **Engine running locally**
   ```bash
   docker compose up -d
   ```
   Engine will be available at `http://localhost:8082`

2. **Postman** — Download at [postman.com](https://www.postman.com/downloads/)

3. **Health check** — Confirm the engine is up before testing:
   ```
   GET http://localhost:8082/healthz
   ```
   Expected response:
   ```json
  { "status": "ok", "service": "prizm-engine" }
   ```

---

## Project Overview in 60 Seconds

Prism is a **policy engine that guards AI agent actions**. Instead of just checking "does this user have permission?", it also asks:

> *"How confident is the AI about what it's doing — and is that confidence high enough to act?"*

### The 3 things Prism does

| Concept | What it means |
|---|---|
| **RBAC** | Humans get roles with allowed/denied actions (same as Okta) |
| **Agent Scopes** | AI agents get their own scope — they inherit a role but get extra constraints |
| **Confidence Gate ★** | Agent actions are gated on the LLM's confidence score (0.0–1.0) |

### Confidence thresholds (built-in defaults)

| Score | Label | What happens |
|---|---|---|
| ≥ 0.90 | ✅ Full Permission | Agent acts autonomously |
| 0.70–0.89 | ⚠️ Human Review | Action queued, agent gets structured reason |
| 0.50–0.69 | 🔒 Read-Only | Write permissions stripped |
| < 0.50 | 🚫 Hard Deny | Request blocked, security alert |

---

## Postman Setup

### Base URL Variable

In Postman, create a collection and add a variable:

| Variable | Value |
|---|---|
| `base_url` | `http://localhost:8082` |

Use `{{base_url}}` in all requests below.

### Headers (add to all requests)

| Key | Value |
|---|---|
| `Content-Type` | `application/json` |

---

## Endpoints

---

### 1. Health Check

**Purpose:** Verify the engine is running.

```
GET {{base_url}}/healthz
```

**No body required.**

**Expected 200 response:**
```json
{
  "status": "ok",
  "service": "prizm-engine"
}
```

---

### 2. Human Authorization (`/v1/authorize`)

**Purpose:** Check if a **human user** is allowed to perform an action. Standard RBAC.

```
POST {{base_url}}/v1/authorize
```

**Request body:**
```json
{
  "user_id": "user_alice",
  "action": "invoice:view",
  "resource": {
    "invoice_id": "inv_001"
  }
}
```

**Fields explained:**

| Field | Type | Description |
|---|---|---|
| `user_id` | string | The human user's ID |
| `action` | string | The action being attempted (matches `allow` list in `auth.yaml`) |
| `resource` | object | Context about the resource (optional) |

**Expected 200 response (allowed):**
```json
{
  "allowed": true,
  "reason": "action allowed by role",
  "trace_id": "550e8400-e29b-41d4..."
}
```

**Expected 200 response (denied):**
```json
{
  "allowed": false,
  "reason": "no policy permits action \"invoice:delete\"",
  "trace_id": "550e8400-e29b-41d4..."
}
```

> **Try it:** Change `action` to `invoice:delete` — should be denied since it's not in any role's allow list.

---

### 3. Agent Authorization (`/v1/agent/authorize`) ★

**Purpose:** Check if an **AI agent** is allowed to perform an action, gated by its confidence score. This is Prism's core differentiator.

```
POST {{base_url}}/v1/agent/authorize
```

**Request body:**
```json
{
  "actor": "invoice_bot",
  "action": "invoice:create",
  "confidence": 0.95,
  "acting_for": "user_alice",
  "resource": {
    "amount": "45.00"
  }
}
```

**Fields explained:**

| Field | Type | Description |
|---|---|---|
| `actor` | string | The agent's scope name (must match `agent_scopes` in `auth.yaml`) |
| `action` | string | What the agent wants to do |
| `confidence` | float (0–1) | LLM confidence score for this action |
| `acting_for` | string | The human user the agent is acting on behalf of |
| `resource` | object | Context about the resource (optional) |

**Test 1 — High confidence (≥ 0.90) → Allowed**
```json
{ "actor": "invoice_bot", "action": "invoice:create", "confidence": 0.95, "acting_for": "user_alice" }
```
```json
{ "allowed": true, "reason": "action authorized", "requires_human_review": false, "confidence_used": 0.95 }
```

**Test 2 — Medium confidence (0.70–0.89) → Human review queued**
```json
{ "actor": "invoice_bot", "action": "invoice:create", "confidence": 0.78, "acting_for": "user_alice" }
```
```json
{ "allowed": false, "reason": "confidence 78% requires human approval...", "requires_human_review": true, "confidence_used": 0.78 }
```

**Test 3 — Low confidence (< 0.50) → Hard deny**
```json
{ "actor": "invoice_bot", "action": "invoice:create", "confidence": 0.40, "acting_for": "user_alice" }
```
```json
{ "allowed": false, "reason": "confidence 40% is below hard-deny threshold 50%", "requires_human_review": false, "confidence_used": 0.40 }
```

---

### 4. Mint a JIT Token (`/v1/tokens/mint`)

**Purpose:** Issue a short-lived JWT for an agent with a specific scope. The agent presents this token to downstream services to prove it was authorized.

```
POST {{base_url}}/v1/tokens/mint
```

**Request body:**
```json
{
  "scope": "invoice_bot",
  "acting_for": "user_alice",
  "ttl_seconds": 60
}
```

**Fields explained:**

| Field | Type | Description |
|---|---|---|
| `scope` | string | The agent scope the token is issued for |
| `acting_for` | string | Human user the agent is acting on behalf of |
| `ttl_seconds` | int | Token lifetime in seconds (default: 60) |

**Expected 200 response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "token_id": "3f5e2b1a-...",
  "expires_at": 1740000060
}
```

> **Tip:** Copy the `token_id` — you'll need it to test the revoke endpoint.

---

### 5. Revoke a Token (`/v1/tokens/{token_id}`)

**Purpose:** Immediately invalidate a JIT token before it expires. Critical for security incidents.

```
DELETE {{base_url}}/v1/tokens/{{token_id}}
```

Replace `{{token_id}}` with the `token_id` from the mint response.

**No body required.**

**Expected 200 response:**
```json
{ "success": true }
```

---

### 6. List Pending Human Reviews (`/v1/queue/pending`)

**Purpose:** See all agent actions that are waiting for human approval (confidence was 70–89%).

> **Requires:** Redis must be running (`docker compose up -d`)

```
GET {{base_url}}/v1/queue/pending
```

**No body required.**

**Expected 200 response:**
```json
{
  "count": 1,
  "items": [
    {
      "id": "abc123",
      "actor": "invoice_bot",
      "action": "invoice:create",
      "confidence_score": 0.78,
      "reason": "confidence 78% requires human approval",
      "acting_for": "user_alice",
      "enqueued_at": "2026-02-19T12:00:00Z",
      "status": "pending"
    }
  ]
}
```

---

### 7. Get a Single Review Item (`/v1/queue/{id}`)

**Purpose:** Fetch a specific review request by its ID.

```
GET {{base_url}}/v1/queue/{{review_id}}
```

---

### 8. Approve a Review (`/v1/queue/{id}/approve`)

**Purpose:** A human operator approves the queued action.

```
POST {{base_url}}/v1/queue/{{review_id}}/approve
```

**Request body:**
```json
{
  "resolved_by": "admin_bob",
  "note": "Reviewed and looks correct"
}
```

**Expected 200 response:**
```json
{ "success": true }
```

---

### 9. Deny a Review (`/v1/queue/{id}/deny`)

**Purpose:** A human operator rejects the queued action.

```
POST {{base_url}}/v1/queue/{{review_id}}/deny
```

**Request body:**
```json
{
  "resolved_by": "admin_bob",
  "note": "Amount exceeds policy limit"
}
```

---

## End-to-End Test Scenario

Follow these steps in order to see the full Confidence-Aware Auth flow:

### Scenario: Invoice Bot tries to create an invoice with 78% confidence

**Step 1** — Try the agent authorize with medium confidence:
```json
POST /v1/agent/authorize
{ "actor": "invoice_bot", "action": "invoice:create", "confidence": 0.78, "acting_for": "user_alice" }
```
→ Returns `requires_human_review: true`

**Step 2** — Check the pending queue:
```
GET /v1/queue/pending
```
→ See the review item with `status: "pending"`

**Step 3** — Copy the `id` from the queue item

**Step 4** — Approve it as a human operator:
```json
POST /v1/queue/{id}/approve
{ "resolved_by": "admin_bob", "note": "Approved" }
```

**Step 5** — Verify the item status:
```
GET /v1/queue/{id}
```
→ `status: "approved"`

---

## Understanding the Policy (`config/auth.yaml`)

The policy file controls all authorization logic:

```yaml
version: "1.0"

roles:
  finance_manager:
    allow:
      - invoice:view
      - invoice:create
      - invoice:approve
    deny:
      - invoice:delete

agent_scopes:
  invoice_bot:
    inherits: finance_manager      # inherits role permissions
    constraints:
      - max_refund_amount: 50.00
      - require_human_approval_if_confidence_below: 0.90
      - downgrade_to_read_only_if_confidence_below: 0.70
      - hard_deny_if_confidence_below: 0.50
    deny:
      - invoice:delete             # hard deny overrides inherited permissions
```

**To test a policy change:**
1. Edit `config/auth.yaml`
2. The engine hot-reloads within 30 seconds (or restart with `docker compose restart engine`)
3. Re-run your Postman request — the new policy applies immediately

---

## Postman Collection Import

You can save all requests above as a Postman Collection:

1. In Postman: **File → Import → Raw text**
2. Paste any of the curl examples from the `README.md`
3. Or manually create a collection named **"Prism Engine"** with a folder per section above

---

## Common Errors

| Error | Cause | Fix |
|---|---|---|
| `connection refused` | Engine not running | Run `docker compose up -d` |
| `queue not configured` | Redis not running | Check `docker compose ps` |
| `confidence: score X is out of range` | Confidence must be 0.0–1.0 | Fix the `confidence` value |
| `unknown agent scope "X"` | Actor not in `auth.yaml` | Add the scope to `config/auth.yaml` |
| `item already approved/denied` | Tried to resolve twice | Fetch the item to check its status first |
