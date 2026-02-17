# Auth Permission Engine

> The Immune System for Autonomous Agents

**Developer-first authorization layer built for the Agentic Web**

[![Version](https://img.shields.io/badge/version-2.0-blue.svg)](https://github.com/yourusername/auth-permission-engine)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## Overview

Auth Permission Engine grants ephemeral, context-aware, and scoped permissions to AI agents — ensuring they act autonomously without hallucinating security breaches. Unlike legacy IAM, it treats AI agents as first-class actors with their own distinct constraint model.

**The core insight:** LLMs are non-deterministic, but authorization must be. Every decision is policy-bound, auditable, and uniquely confidence-aware.

### What's New in v2.0

- **Confidence-Aware Auth**: Hallucination guardrails that tie authorization to LLM confidence scores
- **Enhanced ICP Guidance**: Focused on regulated industries (fintech, legal, healthcare)
- **Expanded Competitive Analysis**: Market positioning and differentiation strategy

## Key Features

- 🎯 **Confidence-Aware Authorization** - Automatically downgrade permissions when AI confidence is low
- ⚡ **Ephemeral Agent Tokens** - JIT tokens that expire when tasks complete
- 🔒 **Policy-as-Code** - Separate human roles from agent scopes
- 📊 **Black Box Audit Trail** - Link LLM prompts to exact auth decisions
- 🚀 **Sub-2ms Latency** - Local sidecar evaluation with async audit logging
- 🔌 **Native Integrations** - LangChain, LangGraph, React, and more

## Quick Start

### Installation

```bash
npm install auth-permission-engine
```

### Define Your Policy

Create an `auth.yaml` file that separates human roles from agent scopes:

```yaml
version: "1.0"

roles:
  finance_manager:
    allow:
      - view_invoices
      - approve_large_refunds

agent_scopes:
  invoice_bot:
    inherits: finance_manager
    constraints:
      - max_refund_amount: 50.00
      - require_human_approval_if_confidence: "< 90%"
    deny:
      - delete_invoices
```

### Authorization for Humans

Standard RBAC/ReBAC checks:

```javascript
const { authorize } = require("auth-permission-engine");

app.post("/refund", authorize("approve_large_refunds"), (req, res) => {
  refundService.process(req.body.id);
});
```

### Authorization for AI Agents

Confidence-aware checks with dynamic context:

```javascript
const { agentAuthorize } = require("auth-permission-engine");

app.post("/agent/refund", async (req, res) => {
  const { agentId, refundAmount, confidenceScore } = req.body;
  
  const decision = await agentAuthorize({
    actor: agentId,
    action: "approve_refund",
    resource: { amount: refundAmount },
    context: { confidence: confidenceScore }
  });

  if (!decision.allowed) {
    return res.status(403).json({
      error: "Refund denied",
      reason: decision.reason
    });
  }

  refundService.process(req.body.id);
});
```

## Core Concepts

### The Triangle of Auth

Modern agentic applications have three distinct actor types:

| Actor | Identity Model | Key Characteristic |
|-------|---------------|-------------------|
| **Users** | Long-lived, identity-based (RBAC) | Deterministic; human in the loop |
| **Resources** | Objects being protected | Invoices, tickets, databases |
| **Agents** | Ephemeral actors — act on behalf of users | Non-deterministic; require tighter bounds |

### Ephemeral Agent Tokens (JIT Auth)

Never give an AI agent a permanent API key. Use Just-in-Time tokens:

```javascript
const token = auth.mintAgentToken({
  scope: "invoice_bot",
  ttl: "60s",
  acting_for: "user_123"
});
```

**Flow:**
1. User asks Agent to perform action
2. System mints token valid for 60s, scoped to specific resource
3. Agent performs action
4. Token expires — zero residual access

### Confidence-Aware Auth ⭐

**Our core differentiator.** When an agent is uncertain (low confidence score), Auth Permission Engine automatically:

- Downgrades permissions from `write` to `read_only`
- Routes actions for human review
- Prevents hallucinated security breaches

```yaml
agent_scopes:
  invoice_bot:
    constraints:
      - require_human_approval_if_confidence: "< 90%"
      - downgrade_to: read_only_if_confidence: "< 70%"
```

## Integrations

### LangChain / LangGraph

Wrap tools with permission checks that fail gracefully:

```javascript
const { SecureTool } = require("auth-permission-engine/langchain");

const refundTool = new SecureTool({
  name: "refund_transaction",
  func: async (input) => { /* ... */ },
  requiredPermission: "process_refund"
});
```

### React Frontend

Sync agent permissions to UI state:

```javascript
import { useAgentPermission } from 'auth-permission-engine/react';

function AgentChatBox() {
  const { canExecute } = useAgentPermission("refund_payment");
  
  return (
    <button disabled={!canExecute}>
      Ask AI to Refund
    </button>
  );
}
```

## Architecture

### Local Evaluation (Sidecar Model)

| Component | Location / Mode | Notes |
|-----------|----------------|-------|
| **Policy Push** | Cloud → Sidecar | Background sync; no hot-path latency |
| **Evaluation** | In-memory, local | < 2ms per decision |
| **Audit Logs** | Async flush | Cloud-stored; queryable via Trace Explorer |
| **Token Minting** | Local, JIT | 60s TTL default; fully configurable |

### Trace Explorer

Debug agent decisions with full context:

```
Agent:      CustomerSupportBot-9000
Action:     delete_database
Result:     DENIED
Reason:     Policy safety_level_high prevents deletion
Confidence: 61% → Downgraded to read_only scope
Linked Prompt: "User asked me to clear all data..."
```

## Competitive Advantage

**Our Moat:** No competitor currently ties authorization decisions to LLM confidence scores. Confidence-Aware Auth is our unique, defensible position.

### Market Position

- **Permit.io**: No confidence-aware auth or hallucination guardrails
- **Aembit**: Enterprise-first; no LLM-native context model
- **AuthZed/SpiceDB**: Infrastructure layer; not agent-opinionated
- **Cerbos**: General-purpose; no confidence scoring
- **agent.security**: Closest competitor; gateway layer approach

## Ideal Customers

Series A–B AI-native startups deploying LangChain/AutoGPT agents in regulated industries:

- 🏦 Fintech
- ⚖️ Legal
- 🏥 Healthcare

These companies face compliance pressure but lack enterprise IAM teams.

## Pricing Model

- **Free Tier**: Unlimited agents, limited audit retention
- **Paid Tiers**: 
  - Extended audit log retention
  - SLA guarantees
  - Enterprise SSO/SAML
  - Advanced hallucination guardrail analytics

## Documentation

- [Full API Reference](docs/api.md)
- [Policy Language Guide](docs/policy-language.md)
- [Integration Examples](docs/integrations.md)
- [Security Best Practices](docs/security.md)

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

- 📧 Email: [support@example.com](mailto:support@example.com)
- 💬 Discord: [Join our community](https://discord.gg/example)
- 📖 Docs: [docs.example.com](https://docs.example.com)

---

**Built for the Agentic Web** | v2.0 | February 2026
