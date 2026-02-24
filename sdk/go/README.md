# Prism Go SDK

Go client for [Prism](https://github.com/Abenezer0923/Prism) — confidence-aware authorization for AI agents.

## Install

```bash
go get github.com/Abenezer0923/Prism/sdk/go
```

## Quick Start

```go
package main

import (
	"context"
	"fmt"
	"log"

	prism "github.com/Abenezer0923/Prism/sdk/go"
)

func main() {
	ctx := context.Background()
	client := prism.NewClient(prism.ClientConfig{
		BaseURL: "http://localhost:8080",
		APIKey:  "prism-dev-key",
	})

	decision, err := client.AgentAuthorize(ctx, prism.AgentAuthRequest{
		Actor:      "invoice_bot",
		Action:     "approve_refunds",
		Confidence: 0.92,
		ActingFor:  "user_123",
	})
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("allowed:", decision.Allowed, "reason:", decision.Reason)
}
```

## API

- `Authorize(ctx, req)` — human authorization via `/v1/authorize`
- `AgentAuthorize(ctx, req)` — confidence-aware agent authorization via `/v1/agent/authorize`
- `MintToken(ctx, req)` — mint JIT tokens via `/v1/tokens/mint`
- `RevokeToken(ctx, tokenID)` — revoke token via `DELETE /v1/tokens/{tokenID}`
- `IsHealthy(ctx)` — health check via `/healthz`

## License

MIT
