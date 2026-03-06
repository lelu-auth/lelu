# Lelu

The TypeScript SDK for Lelu — the confidence-aware authorization engine for autonomous AI agents.

Lelu provides confidence-aware access control, human-in-the-loop approvals, and SOC 2-ready audit trails for your autonomous agents.

## Installation

```bash
npm install lelu
```

## Quick Start

```typescript
import { createClient } from "lelu";

// Initialize the client
const lelu = createClient({ 
  baseUrl: "http://localhost:8082" 
});

// Authorize an agent action
async function runAgent() {
  const { allowed, reason } = await lelu.agentAuthorize({
    agentId: "agent-123",
    action: "read_database",
    resource: "users_table",
    context: {
      confidence: 0.95
    }
  });

  if (allowed) {
    console.log("Action permitted!");
  } else {
    console.log("Action denied:", reason);
  }
}
```

## Features

- **Confidence-Aware**: Dynamically adjust permissions based on the AI agent's confidence level.
- **Human-in-the-loop**: Require human approval for low-confidence or high-risk actions.
- **Audit Trails**: SOC 2-ready logging of all agent decisions and actions.
- **Framework Agnostic**: Works with LangChain, AutoGPT, or custom agent frameworks.

## Documentation

For full documentation, visit [https://github.com/lelu-auth/lelu](https://github.com/lelu-auth/lelu).

## License

MIT
