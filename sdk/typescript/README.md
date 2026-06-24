# lelu-agent-auth

The TypeScript SDK for [Lelu](https://lelu-ai.com) — the confidence-aware authorization engine for autonomous AI agents.

Lelu lets you gate every agent action against a policy, route low-confidence calls to a human reviewer, and keep an immutable audit trail — without running any infrastructure yourself.

## Install

```bash
npm install lelu-agent-auth
```

## Get an API key

Visit **[lelu-ai.com/api-key](https://lelu-ai.com/api-key)** — no signup, no email, instant anonymous key with 500 requests/day free.

## Quick start

```ts
import { createClient } from "lelu-agent-auth";

const lelu = createClient({
  apiKey: process.env.LELU_API_KEY,   // key from lelu-ai.com/api-key
});

const decision = await lelu.agentAuthorize({
  actor: "billing-agent",
  action: "refund:process",
  resource: { orderId: "ord_123" },
  context: { confidence: 0.85 },
});

if (decision.allowed) {
  // proceed
} else if (decision.requiresHumanReview) {
  // agent pauses — action queued for human approval
} else {
  // blocked by policy
  console.error(decision.reason);
}
```

That's it. No Docker. No local server. The SDK routes to the Lelu cloud engine automatically when an API key is provided.

## How URL resolution works

| Situation | Engine used |
|---|---|
| `apiKey` provided, no `baseUrl` | Lelu cloud (`https://lelu-ai.com`) |
| `LELU_BASE_URL` env var set | That URL |
| `baseUrl` passed to `createClient` | That URL |
| No `apiKey`, no env var, no `baseUrl` | `http://localhost:8080` (self-hosted dev) |

## Framework integrations

### Vercel AI SDK

```ts
import { createClient } from "lelu-agent-auth";
import { secureTool } from "lelu-agent-auth/vercel";
import { tool } from "ai";
import { z } from "zod";

const lelu = createClient({ apiKey: process.env.LELU_API_KEY });

const processRefund = secureTool(lelu, "billing-agent", {
  tool: tool({
    description: "Process a customer refund",
    parameters: z.object({ orderId: z.string(), amount: z.number() }),
    execute: async ({ orderId, amount }) => {
      // only runs when Lelu allows it
      return { success: true };
    },
  }),
  action: "refund:process",
  confidence: 0.9,
});
```

### Express middleware

```ts
import { createClient } from "lelu-agent-auth";
import { authorize } from "lelu-agent-auth/express";

const lelu = createClient({ apiKey: process.env.LELU_API_KEY });

app.post(
  "/api/refund",
  authorize(lelu, { action: "refund:process", confidence: 0.9 }),
  (req, res) => res.json({ ok: true }),
);
```

### LangChain

```ts
import { createClient } from "lelu-agent-auth";
import { secureTool } from "lelu-agent-auth/langchain";

const lelu = createClient({ apiKey: process.env.LELU_API_KEY });

const safeTool = secureTool(lelu, "research-agent", myLangChainTool, {
  action: "web:search",
  confidence: 0.8,
});
```

## All methods

```ts
// Authorization
lelu.agentAuthorize({ actor, action, resource?, context })
lelu.authorize({ userId, action, resource? })

// Token management (scoped, time-limited JWTs)
lelu.mintToken({ scope, actingFor?, ttlSeconds? })
lelu.revokeToken(tokenId)

// Multi-agent delegation
lelu.delegateScope({ delegator, delegatee, scopedTo?, ttlSeconds?, confidence? })

// Audit trail
lelu.listAuditEvents({ actor?, action?, decision?, from?, to?, limit?, cursor? })

// Behavioral analytics
lelu.getAgentReputation(agentId)
lelu.getAgentAnomalies(agentId, since?)
lelu.getAgentBaseline(agentId)
lelu.getAlerts(agentId?)

// Health
lelu.isHealthy()  // → boolean
```

## Environment variables

| Variable | Description |
|---|---|
| `LELU_API_KEY` | Your API key — set this and you're done |
| `LELU_BASE_URL` | Override the engine URL (e.g. for self-hosted) |

## Self-hosting

If you run your own Lelu engine (Docker / Kubernetes / Cloud Run), pass the URL directly:

```ts
const lelu = createClient({
  baseUrl: "https://your-engine.example.com",
  apiKey: process.env.LELU_API_KEY,
});
```

Or via environment variable — no code change needed:

```bash
LELU_BASE_URL=https://your-engine.example.com
LELU_API_KEY=your-key
```

See the [self-hosting guide](https://lelu-ai.com/docs/guides/production) for Docker Compose and Kubernetes manifests.

## Links

- [Documentation](https://lelu-ai.com/docs)
- [Get API key](https://lelu-ai.com/api-key)
- [GitHub](https://github.com/lelu-ai/lelu)
- [Issues](https://github.com/lelu-ai/lelu/issues)

## License

MIT
