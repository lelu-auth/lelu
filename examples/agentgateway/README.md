# Lelu × agentgateway — behavioral authorization at the gateway

[agentgateway](https://agentgateway.dev) (by Solo.io) is the data plane for agent
traffic — MCP, A2A, and LLM — with auth, RBAC, and routing. It's a **Policy
Enforcement Point (PEP)**: it sits in the path and enforces decisions.

Lelu is the **Policy Decision Point (PDP)**: it decides whether an *authorized*
action is *safe to run right now* — prompt-injection check, confidence gate
(from the model's logprobs, not self-reported), risk model, human-in-the-loop.

agentgateway proves **who** the agent is and **what** it may call. Lelu adds the
layer it doesn't: **is this agent being manipulated, or acting on a guess?**

```
agent ──▶ agentgateway (PEP) ──ext_authz──▶ Lelu adapter ──▶ Lelu engine (PDP)
              │  identity, RBAC, routing        2xx / 403        allow/deny/review
              ▼
        forwards the call ONLY on allow
```

## How it works

agentgateway's HTTP ext_authz contract is **2xx = allow, non-2xx = deny**. Lelu's
engine returns `200` with the decision in the JSON body, so a tiny adapter
([`lelu-extauthz-adapter.mjs`](./lelu-extauthz-adapter.mjs), zero dependencies)
translates a Lelu decision into the status code agentgateway expects and surfaces
the decision/reason/trace as response headers.

## Run it

```bash
# 1. a Lelu engine on :8088  (see ../quickstart)
# 2. the adapter on :9000
node lelu-extauthz-adapter.mjs
```

Simulate what agentgateway sends (it forwards these headers):

```bash
# confident, permitted → 200 (gateway forwards the call)
curl -i -H "x-lelu-actor: invoice_bot" -H "x-lelu-action: approve_refunds" \
        -H "x-lelu-confidence: 0.95" localhost:9000/

# low confidence → 403 (gateway blocks it)
curl -i -H "x-lelu-actor: invoice_bot" -H "x-lelu-action: approve_refunds" \
        -H "x-lelu-confidence: 0.30" localhost:9000/
```

Actual output:

```
HTTP/1.1 200 OK
x-lelu-decision: allow
x-lelu-reason: action authorized
x-lelu-trace-id: eb1f0a55-…

HTTP/1.1 403 Forbidden
x-lelu-decision: deny
```

If the engine is unreachable, the adapter **fails closed** (403) — never
fail-open.

## Wire it into agentgateway

Point agentgateway's ext_authz at the adapter — see
[`agentgateway-extauthz.yaml`](./agentgateway-extauthz.yaml). Populate
`x-lelu-actor` / `x-lelu-action` / `x-lelu-confidence` from JWT claims and your
gateway policy (e.g. action = the MCP tool name, confidence = the verified score
from the model response via `LeluClient.confidenceFrom.*`).

## Production note

This adapter is the fast path to a working integration. The clean productionized
form is a native Lelu engine endpoint that speaks agentgateway's gRPC ext_authz
(Envoy-compatible) directly — no sidecar. The adapter exists so you can run the
whole thing today and see real allow/deny at the gateway.
