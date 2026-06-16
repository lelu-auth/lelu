# Guardrails for Amazon Bedrock Agents with Lelu

**Reference architecture: gate every Bedrock agent tool call on the model's own
verified confidence — and catch prompt injection before it executes.**

Amazon Bedrock makes it easy to give an agent tools: query a database, issue a
refund, send an email, deploy code. It does **not** tell you *when the model is
unsure* or *when it has been manipulated*. A Bedrock agent that's been
prompt-injected, or that's simply guessing, will call your tools with complete
conviction.

Lelu is an open-source authorization engine that sits between your Bedrock agent
and its tools. It reads the model's token log-probabilities, derives a
confidence score the agent cannot forge, runs a prompt-injection filter and a
policy check, and returns one of four decisions: **allow**, **deny**,
**human-review**, or **compute** (redirect to a safe alternative).

---

## Architecture

```
            ┌───────────────────────────────────────────────┐
            │                  Your application              │
            │                                                │
            │   Amazon Bedrock                               │
            │   (Cohere / Llama / Titan / Claude)            │
            │        │  InvokeModel (return_likelihoods)     │
            │        ▼                                        │
            │   Lelu SDK                                      │
            │   confidenceFrom.bedrock(response) → 0–1        │
            │        │  agentAuthorize({ actor, action,      │
            │        ▼                  context:{confidence}})│
            └────────┼───────────────────────────────────────┘
                     │  POST /v1/agent/authorize
                     ▼
        ┌─────────────────────────────────────────┐
        │   Lelu engine  (ECS Fargate, :8080)      │
        │   injection → confidence gate → policy   │
        │   → risk → most-restrictive merge        │
        │                                          │
        │   Postgres (policies, audit) · Redis     │
        └─────────────────────────────────────────┘
                     │
            allow / deny / human_review / compute
```

The engine is a single stateless Go container. Everything runs in **your** AWS
account — model outputs and decisions never leave it.

---

## How it works

### 1. Invoke a Bedrock model and keep the token likelihoods

Cohere Command on Bedrock returns per-token log-likelihoods when you pass
`return_likelihoods: "ALL"`:

```js
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const bedrock = new BedrockRuntimeClient({ region: "us-east-1" });
const res = await bedrock.send(new InvokeModelCommand({
  modelId: "cohere.command-text-v14",
  contentType: "application/json",
  body: JSON.stringify({ prompt, max_tokens: 200, return_likelihoods: "ALL" }),
}));
const modelResponse = JSON.parse(new TextDecoder().decode(res.body));
```

### 2. Derive a verified confidence score

```js
import { LeluClient } from "lelu-agent-auth";
const confidence = LeluClient.confidenceFrom.bedrock(modelResponse); // 0–1, or null
```

This score comes from the model's actual output distribution — not a number the
agent reports about itself. That distinction is the whole point: a manipulated
agent can claim `1.0`; it cannot fake its logprobs.

### 3. Authorize the tool call, gated on that confidence

```js
const decision = await lelu.agentAuthorize({
  actor: "invoice_bot",
  action: "approve_refunds",
  context: confidence !== null ? { confidence } : {}, // omit → MissingSignalMode
});
if (decision.decision !== "allow") throw new Error(decision.reason);
```

Real output from the [runnable example](../examples/bedrock):

```
confident refund : confidence=0.974 → allow — action authorized
uncertain refund: confidence=0.301 → deny — confidence 30% is below hard-deny threshold (50%)
```

Same agent, same action — the only difference is how sure the model was.

---

## Confidence support by Bedrock model

Token log-probs are **model-dependent** on Bedrock. Lelu is honest about this:

| Bedrock model | Token log-probs | `confidenceFrom.bedrock` |
|---|---|---|
| Cohere Command | ✅ `token_likelihoods` | a verified score |
| Meta Llama / Amazon Titan / Nova | ⚠️ config-dependent | a score where present |
| Anthropic Claude | ❌ none | `null` |

When the model exposes no logprobs (Claude), **omit** `confidence`. The engine
then applies its `MissingSignalMode` policy — `deny` by default — rather than
trusting a fabricated value. For Claude-backed agents, derive confidence with
self-consistency sampling (sample N times; disagreement = low confidence) and
pass the result through the same path.

---

## Deploy on AWS

The engine ships as a container (`EXPOSE 8080`) and deploys to **ECS Fargate**
with one script:

```bash
export AWS_REGION=us-east-1
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
bash infrastructure/aws/deploy.sh
```

This provisions the cluster, pushes the engine image to ECR, and runs the engine
plus Postgres and Redis as Fargate services (task definitions in
[`infrastructure/aws/`](../infrastructure/aws/); Terraform also available). An
EC2 single-box variant is in `deploy-ec2.sh`.

Point your SDK at the engine's load-balancer URL:

```js
const lelu = createClient({ baseUrl: process.env.LELU_BASE_URL, apiKey: process.env.LELU_API_KEY });
```

Set `CONFIDENCE_MISSING_MODE` (`deny` | `review` | `read_only`) and `LELU_MODE`
(`enforce` | `shadow`) to match your rollout posture — start in `shadow` to
observe decisions without blocking, then switch to `enforce`.

---

## Why this matters for production Bedrock agents

- **Prompt injection** is caught before policy even runs — a malicious string in
  a tool argument never reaches your tool.
- **Low-confidence actions** are downgraded or held for a human instead of
  executing on a guess.
- **Every decision is logged** with tamper-evident input/output/policy hashes —
  an audit trail for SOC 2 / OWASP-LLM / NIST AI RMF evidence.
- **It runs in your account** on infrastructure you already operate (ECS).

---

## Try it

- Runnable example: [`examples/bedrock`](../examples/bedrock)
- 60-second local quickstart (no AWS account): [`examples/quickstart`](../examples/quickstart)
- SDKs: [`lelu-agent-auth`](https://www.npmjs.com/package/lelu-agent-auth) (npm) ·
  [`lelu-agent-auth-sdk`](https://pypi.org/project/lelu-agent-auth-sdk/) (PyPI)
