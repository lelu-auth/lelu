<!--
TARGET: github.com/agentgateway/agentgateway → Discussions (Show and tell / Ideas)
Tone: a contributor sharing a useful integration + asking a real question.
Disclose it's your project. Keep the repo link low-key. Don't oversell.
-->

**Title:** Using agentgateway ext_authz as the enforcement point for behavioral authorization (injection / confidence / risk)

Hi all — first, thanks for agentgateway; the unified MCP/A2A/LLM data plane with
ext_authz is exactly the right shape for what I was trying to do.

**Context / the gap I hit:** agentgateway answers *who* the agent is and *what*
it's allowed to call (JWT, RBAC/CEL). What I also needed was a check on whether an
*already-authorized* action is safe to run *right now* — i.e. catch prompt
injection in the request, gate on the model's actual confidence (from token
logprobs, not a self-reported number), and route uncertain calls to human review.
That's a decision-point concern, separate from the gateway's enforcement.

**What I did:** I treated agentgateway as the PEP and put a behavioral
decision-point behind it via HTTP ext_authz. Since the contract is
`2xx = allow / non-2xx = deny`, a tiny adapter maps the decision to a status code
and passes the verdict back as response headers:

```
agent ──▶ agentgateway (ext_authz) ──▶ adapter ──▶ engine
                                         2xx/403     allow / deny / review
```

Verified locally — a confident, permitted call returns `200`; a low-confidence
call returns `403`, with `x-lelu-decision` / `x-lelu-reason` surfaced back:

```
HTTP/1.1 200 OK     x-lelu-decision: allow
HTTP/1.1 403 Forbidden  x-lelu-decision: deny
```

(The decision engine is my open-source project, Lelu — MIT; I'll keep the link to
a comment so this stays about the integration. It's complementary to the gateway,
not a competing one — purely the behavioral decision layer.)

**Questions for the maintainers:**

1. For a native integration (no sidecar adapter), is the **gRPC ext_authz** path
   the recommended one? The docs say agentgateway is Envoy-ext_authz-compatible —
   are there agentgateway-specific fields in the `CheckRequest` (e.g. resolved MCP
   tool name, JWT claims) I should read rather than reconstructing them from
   headers?
2. Is there a clean way to forward a **per-request confidence signal** (or other
   model-derived metadata) to the ext_authz service today — via CEL into request
   headers, or otherwise?
3. Would a documented "behavioral authz behind agentgateway" example be useful to
   the project? Happy to contribute one.

Thanks — really like the direction here.
