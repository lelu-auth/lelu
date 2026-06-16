<!--
PUBLISH TARGET: builder.aws.com → Connect → Spaces → Generative AI
This is a copy-paste-ready community article. Notes for you (delete before posting):
  - Title options below — pick one.
  - Tags: generative-ai, amazon-bedrock, ai-agents, open-source, security
  - Cover image: use the injection-caught GIF from docs/demo-record-script.md
  - Replace <your-handle>/links as needed. Everything below the line is the post.
-->

# Title options
1. I built an open-source guardrail for Amazon Bedrock agents — it catches prompt injection before the tool runs
2. Gating Amazon Bedrock agents on the model's *own* confidence (open source)
3. Your Bedrock agent will call tools even when it's wrong. Here's how I stop it.

---

## Your Bedrock agent will call tools even when it's wrong

Amazon Bedrock makes it trivial to give an agent tools — issue a refund, deploy
code, send an email. What it doesn't give you is a sense of **when the model is
unsure**, or **when it's been prompt-injected** into doing something it
shouldn't. A manipulated or simply-uncertain agent will call your tools with
total conviction.

I got tired of that gap, so I built **[Lelu](https://github.com/lelu-auth/lelu)** —
an open-source (MIT) authorization engine that sits between a Bedrock agent and
its tools. Every risky action goes through one check that returns **allow**,
**deny**, **human-review**, or **compute** (redirect to a safe alternative).

The interesting part for Bedrock specifically: Lelu reads the model's **token
log-probabilities** to derive a confidence score the agent *can't fake*, and
gates the action on it.

## The flow

```
Bedrock InvokeModel ──▶ confidenceFrom.bedrock(response) ──▶ agentAuthorize()
   (token likelihoods)        (verified score, 0–1)         (allow/deny/review)
```

**1. Invoke the model, keep the likelihoods** (Cohere Command shown):

```js
const res = await bedrock.send(new InvokeModelCommand({
  modelId: "cohere.command-text-v14",
  body: JSON.stringify({ prompt, max_tokens: 200, return_likelihoods: "ALL" }),
}));
const modelResponse = JSON.parse(new TextDecoder().decode(res.body));
```

**2. Derive a verified confidence score** (not a number the agent reports):

```js
import { LeluClient } from "lelu-agent-auth";
const confidence = LeluClient.confidenceFrom.bedrock(modelResponse); // 0–1, or null
```

**3. Authorize the tool call, gated on it:**

```js
const decision = await lelu.agentAuthorize({
  actor: "invoice_bot",
  action: "approve_refunds",
  context: confidence !== null ? { confidence } : {}, // omit → engine's fail-closed policy
});
if (decision.decision !== "allow") throw new Error(decision.reason);
```

Real output from the runnable example — same agent, same action, only the
model's confidence differs:

```
confident refund : confidence=0.974 → allow
uncertain refund: confidence=0.301 → deny (below hard-deny threshold)
```

And when a prompt injection is hidden in the payload, it's caught before policy
even runs:

```json
{ "allowed": false, "reason": "prompt injection detected in resource: \"ignore all previous\"" }
```

## The honest bit about Bedrock models

Token log-probs are **model-dependent** on Bedrock, so I won't pretend otherwise:

| Model | Log-probs | Result |
|---|---|---|
| Cohere Command | ✅ | verified score |
| Llama / Titan / Nova | ⚠️ config-dependent | score where present |
| Anthropic Claude | ❌ | `null` → engine applies its fail-closed `MissingSignalMode` |

For Claude-backed agents you omit the signal (the engine then denies/escalates
by policy rather than trusting a fabricated value) or derive confidence via
self-consistency sampling.

## Runs in your own account

The engine is a single Go container (`EXPOSE 8080`) that deploys to **ECS
Fargate** with one script — model outputs and decisions never leave your AWS
account. Every decision is logged with tamper-evident input/output/policy hashes
(useful for OWASP-LLM / NIST AI RMF evidence).

## Try it

- 60-second local quickstart (no AWS account needed): `examples/quickstart`
- The Bedrock example above: `examples/bedrock`
- Repo (MIT): **https://github.com/lelu-auth/lelu**
- SDKs: `npm i lelu-agent-auth` · `pip install lelu-agent-auth-sdk`

I'd love feedback from anyone running Bedrock agents in production — especially
on the Claude confidence-signal problem. What are you using today to know when
your agent is unsure?
