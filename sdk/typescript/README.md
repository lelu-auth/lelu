<div align="center">
  <img src="https://lelu-ai.com/logo.svg" alt="Lelu logo" width="120" />
</div>

# Lelu

The TypeScript SDK for Lelu — the confidence-aware authorization engine for autonomous AI agents.

> **Package Renamed:** If you're looking for `@lelu-auth/lelu`, this is the new package name. Simply install `lelu-agent-auth` instead. [Migration guide](https://github.com/lelu-auth/lelu/blob/main/NPM_MIGRATION_STRATEGY.md)

**Author:** Abenezer Getachew  
**Contributors:** [Abenezer Getachew](https://github.com/Abenezer0923)

Lelu provides confidence-aware access control, human-in-the-loop approvals, and SOC 2-ready audit trails for your autonomous agents.

## Installation

```bash
npm install lelu-agent-auth
```

## Start Dashboard (Localhost)

After installing the package, start the local dashboard stack with one command:

```bash
npx lelu-agent-auth dashboard
```

Then open:

```text
http://localhost:3002/audit
```

This command clones/updates the Lelu stack in `~/.lelu-stack` and runs `docker compose up -d --build`.

## Docker Support

Lelu works in Dockerized apps.

The SDK resolves engine URL in this order:

1. `baseUrl` passed to `createClient(...)`
2. `LELU_BASE_URL` environment variable
3. `http://localhost:8080` fallback

Example for containers:

```bash
LELU_BASE_URL=http://host.docker.internal:8083
```

## Quick Start

### Option 1: Use Hosted Engine (Recommended)

Connect to the hosted Lelu engine for instant setup with an API key:

```typescript
import { createClient } from "lelu-agent-auth";

// Initialize with hosted engine and API key
const lelu = createClient({ 
  baseUrl: "https://lelu-engine.onrender.com",
  apiKey: process.env.LELU_API_KEY  // Get your key from the dashboard
});

// Authorize an agent action
async function runAgent() {
  const decision = await lelu.agentAuthorize({
    actor: "billing-agent",
    action: "refund:process",
    resource: { orderId: "12345" },
    context: {
      confidence: 0.85
    }
  });

  if (decision.allowed) {
    console.log("✅ Action permitted!");
  } else {
    console.log("❌ Action denied:", decision.reason);
    if (decision.requiresHumanReview) {
      console.log("⏳ Queued for human review");
    }
  }
}
```

**Get Your API Key:**
1. Visit the [Lelu Dashboard](https://lelu-engine.onrender.com)
2. Generate a beta API key (free, no signup required)
3. Set it as `LELU_API_KEY` environment variable

### Option 2: Run Locally

For development, you can run the engine locally:

```typescript
import { createClient } from "lelu-agent-auth";

// Initialize with local engine
const lelu = createClient({ 
  baseUrl: "http://localhost:8083" 
});
```

Start the local engine:

```bash
npx lelu-agent-auth dashboard
```

Then open: `http://localhost:3002/audit`

## Features

- **Confidence-Aware**: Dynamically adjust permissions based on the AI agent's confidence level.
- **Human-in-the-loop**: Require human approval for low-confidence or high-risk actions.
- **Audit Trails**: SOC 2-ready logging of all agent decisions and actions.
- **Framework Agnostic**: Works with LangChain, AutoGPT, or custom agent frameworks.

## Documentation

For full documentation, visit [https://lelu-ai.com/](https://lelu-ai.com/).

## License

MIT
