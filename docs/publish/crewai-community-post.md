<!--
Two artifacts for the CrewAI community:
  1. A value-first community post (community.crewai.com / GitHub Discussions).
  2. An integration-guide draft (for a docs PR or the crewAI-tools repo).
Rules: disclose you're the author, lead with the problem, repo link in a comment,
end with a real question. Polish the integration first (done: tests + example).
-->

# 1) Community post — community.crewai.com / GitHub Discussions (Show & Tell)

**Title:** Gating CrewAI tool calls on the model's confidence (and catching prompt injection) before they run

A CrewAI agent will call its tools with full conviction even when it's been
prompt-injected or is simply unsure. For tools with real side effects — refunds,
emails, deploys — that's the scary part: the agent never doubts itself.

I wanted a way to put a check *between* the agent deciding to call a tool and the
tool actually running. So I built a `BaseTool` subclass that gates every call:

```python
from lelu.crewai import LeluTool

class RefundTool(LeluTool):
    name: str = "process_refund"
    description: str = "Issue a customer refund."
    actor: str = "invoice_bot"
    action: str = "approve_refunds"
    confidence: float = 0.95   # from the model's verified score, not self-reported

    def _execute(self, invoice_id: str) -> str:   # only runs if the check passes
        return f"Refund issued for {invoice_id}."
```

You implement `_execute()` instead of `_run()`. On each call it checks confidence,
runs a prompt-injection filter, and applies a policy — returning one of:
- **allow** → the tool runs,
- **deny** → the tool never runs; the agent gets a refusal string and self-corrects,
- **human review** → the action is held for approval.

So the same refund at `confidence=0.95` goes through, but at `0.30` it comes back
*"denied: confidence below threshold"* and the agent adapts instead of moving money.

The engine behind it is my open-source project (MIT) — I'll drop the link in a
comment to keep this about the pattern, not a pitch. A couple of genuine questions
for folks running CrewAI with side-effectful tools:

1. How are you deciding *when* an agent is sure enough to take an irreversible
   action — confidence, a judge model, self-consistency, or just role/prompt design?
2. Would a `BaseTool`-level guard like this be useful as a community tool, or do
   you handle this at the task/process level instead?

---

# 2) Integration guide — for a docs PR (docs.crewai.com) or the crewAI-tools repo

## Securing CrewAI tools with Lelu

CrewAI agents act through tools. `LeluTool` adds an authorization check before any
tool executes, so a manipulated or low-confidence agent can't trigger a dangerous
action.

### Install

```bash
pip install crewai lelu-agent-auth-sdk
```

### Define a gated tool

Subclass `LeluTool` and implement `_execute()` (not `_run()`):

```python
from lelu import LeluClient
from lelu.crewai import LeluTool

class RefundTool(LeluTool):
    name: str = "process_refund"
    description: str = "Issue a customer refund."
    actor: str = "invoice_bot"        # an agent scope in your Lelu policy
    action: str = "approve_refunds"   # the permission to authorize
    confidence: float = 0.95          # the model's verified confidence for this call

    def _execute(self, invoice_id: str) -> str:
        return f"Refund issued for invoice {invoice_id}."

tool = RefundTool(lelu_client=LeluClient(base_url="http://localhost:8088"))
agent = Agent(role="Finance Assistant", tools=[tool], ...)
```

### Behavior

| Decision | `LeluTool` returns |
|---|---|
| allow | the `_execute()` result |
| deny | a refusal string the LLM can self-correct on (tool never runs) |
| human review | a "queued for approval" message |
| `throw_on_deny=True` | raises `PermissionDeniedError` |

### Runnable example

A full agent + crew example is here: `examples/crewai/secure_refund_agent.py`.

---

## Posting checklist
- Polish first — the integration is tested (`tests/test_crewai.py`) and has a
  runnable example. ✅
- Post #1 in **community.crewai.com → Show & Tell** AND/OR repo **Discussions**.
- Repo link goes in the **first comment**, not the title/body.
- For #2: open a docs PR to **docs.crewai.com** or propose `LeluTool` to the
  **crewAIInc/crewAI-tools** repo (the legitimate home for community tools) — not
  the core repo.
- Engage every reply for the first few hours.
