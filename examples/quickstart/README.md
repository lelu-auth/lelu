# Lelu quickstart — see it work in 60 seconds

This runs the **real engine** on your machine — SQLite only, no Postgres, no Redis,
no cloud account — and fires one request for each of Lelu's four authorization
outcomes, including a live prompt-injection catch.

## Run it

```bash
git clone https://github.com/lelu-ai/lelu
cd lelu/examples/quickstart
./demo.sh
```

Requires Go 1.24+, `curl`, and `python3` — nothing else. The script builds the
engine, starts it, runs the requests, and cleans up after itself.

> Already have the engine built? Skip the build:
> `LELU_ENGINE_BIN=/path/to/lelu-engine ./demo.sh`

## What you'll see

Each call goes to `POST /v1/agent/authorize`. The engine returns boolean flags
(`allowed`, `requires_human_review`, `compute`) — your SDK turns those into one of
four decisions. This is **actual output** from the run:

**1. ALLOW** — a permitted action with high confidence:
```json
{ "allowed": true, "requires_human_review": false, "reason": "action authorized" }
```

**2. DENY** — a prompt injection hidden in the request, caught before policy even runs:
```json
{
  "allowed": false,
  "requires_human_review": false,
  "reason": "prompt injection detected in resource: \"ignore all previous\""
}
```

**3. HUMAN_REVIEW** — the model wasn't confident enough, so it's held for a human:
```json
{
  "allowed": false,
  "requires_human_review": true,
  "reason": "confidence 80% requires human approval (threshold 90%)"
}
```

**4. COMPUTE** — a risky production deploy is redirected to a safe sandbox instead of blocked:
```json
{
  "allowed": true,
  "requires_human_review": false,
  "compute": true,
  "safe_tool": "deploy",
  "reason": "action \"deploy_app\" redirected to safe alternative \"deploy\" by compute rule"
}
```

## The policy behind it

All four behaviours come from one small file, [`policy.yaml`](./policy.yaml):
- `invoice_bot` may `approve_refunds` and `deploy_app`, never `delete_invoices`.
- Confidence gating: `>= 0.90` allow · `0.70–0.89` review · `0.50–0.69` read-only · `< 0.50` deny.
- A compute rule rewrites any `deploy_*` into a sandboxed staging deploy.

Edit `policy.yaml`, re-run `./demo.sh`, and watch the decisions change.

## Next

- Call it from your app with the [TypeScript](../../sdk/typescript) or
  [Python](../../sdk/python) SDK.
- Run the full stack (dashboard, Postgres, Redis) with `docker compose up` from
  the repo root.
