# auth-permission-engine · Python SDK

Python client for [Prism](https://github.com/Abenezer0923/Prism) — the confidence-aware authorization engine for autonomous AI agents.

## Installation

```bash
pip install prism-engine
```

## Quick start

```python
import asyncio
from auth_pe import PrismClient, AgentAuthorizeRequest

async def main():
    async with PrismClient(base_url="http://localhost:8082") as client:
        result = await client.agent_authorize(AgentAuthorizeRequest(
            actor="invoice_bot",
            action="invoice:create",
            confidence=0.92,
            acting_for="user_123",
        ))
        print(result.allowed, result.reason)

asyncio.run(main())
```

## API

| Method | Description |
|---|---|
| `agent_authorize(req)` | Confidence-aware agent authorization |
| `authorize(req)` | Human RBAC authorization |
| `mint_token(req)` | Mint a JIT-scoped JWT |
| `revoke_token(token_id)` | Revoke a token immediately |
| `is_healthy()` | Health-check the engine |

## License

MIT
