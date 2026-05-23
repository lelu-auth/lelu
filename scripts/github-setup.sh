#!/usr/bin/env bash
# Run this once with a GitHub PAT that has repo + write:discussion scope:
#   GITHUB_TOKEN=ghp_xxx bash scripts/github-setup.sh
set -e

REPO="lelu-auth/lelu"
API="https://api.github.com"
AUTH="Authorization: Bearer $GITHUB_TOKEN"

echo "▶ Adding topics..."
curl -s -X PUT "$API/repos/$REPO/topics" \
  -H "$AUTH" -H "Accept: application/vnd.github.mercy-preview+json" \
  -H "Content-Type: application/json" \
  -d '{"names":["authorization","ai-agents","llm-security","agent-security","opa","rego","langchain","openai","anthropic","policy-engine","ai-safety","typescript","golang","human-in-the-loop","confidence-scoring"]}' \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print('  topics set:', d.get('names','error'))"

echo "▶ Enabling Discussions..."
curl -s -X PATCH "$API/repos/$REPO" \
  -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"has_discussions":true}' \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print('  discussions:', d.get('has_discussions','error'))"

echo "▶ Creating roadmap issues..."

create_issue() {
  local title="$1"
  local body="$2"
  local labels="$3"
  curl -s -X POST "$API/repos/$REPO/issues" \
    -H "$AUTH" -H "Content-Type: application/json" \
    -d "{\"title\":$(echo "$title" | python3 -c "import sys,json; print(json.dumps(sys.stdin.read().strip()))"),\"body\":$(echo "$body" | python3 -c "import sys,json; print(json.dumps(sys.stdin.read().strip()))"),\"labels\":$labels}" \
    | python3 -c "import sys,json; d=json.load(sys.stdin); print('  #' + str(d.get('number','?')) + ':', d.get('title','error')[:60])"
}

# Create labels first
for label in '{"name":"enhancement","color":"a2eeef"}' \
             '{"name":"integration","color":"0075ca"}' \
             '{"name":"sdk","color":"e4e669"}' \
             '{"name":"roadmap","color":"d93f0b"}'; do
  curl -s -X POST "$API/repos/$REPO/labels" \
    -H "$AUTH" -H "Content-Type: application/json" \
    -d "$label" > /dev/null
done

create_issue \
  "feat: LangChain integration — authorize agent actions mid-chain" \
  "## Overview
LangChain is the most widely used agent framework. Lelu should have a first-class integration that wraps tool calls with authorization checks.

## Proposed API
\`\`\`python
from lelu import LangChainGuard
guard = LangChainGuard(api_key=os.environ[\"LELU_API_KEY\"])

# Wrap any tool
secure_tool = guard.wrap(search_tool, actor=\"research-agent\", action=\"web:search\")
\`\`\`

## Acceptance criteria
- [ ] Python package \`lelu-langchain\` published to PyPI
- [ ] Works with LangChain \`Tool\`, \`StructuredTool\`, and agents
- [ ] Decision logged in Lelu audit trail
- [ ] Docs page at /docs/integrations/langchain" \
  '["enhancement","integration"]'

create_issue \
  "feat: OpenAI Agents SDK integration" \
  "## Overview
OpenAI's Agents SDK (formerly Swarm) is gaining fast adoption for multi-agent workflows. Lelu should integrate as a guardrail layer.

## Proposed API
\`\`\`python
from lelu.integrations.openai import lelu_guardrail

@lelu_guardrail(actor=\"support-agent\", action=\"email:send\")
async def send_email(ctx, email: str, body: str):
    ...
\`\`\`

## Acceptance criteria
- [ ] Works as a function decorator
- [ ] Supports async agents
- [ ] Human-review pause/resume flow documented
- [ ] Example in /examples/openai-agents/" \
  '["enhancement","integration"]'

create_issue \
  "feat: Anthropic Claude tool-use integration" \
  "## Overview
Claude's tool-use (function calling) API is widely used for agentic tasks. Lelu should wrap tool execution with policy checks before Claude's output is acted on.

## Proposed integration point
Intercept between \`tool_use\` block parsing and actual tool execution — the highest-value guardrail position.

## Acceptance criteria
- [ ] TypeScript helper \`authorizeToolCall(block, actor)\`
- [ ] Works with \`@anthropic-ai/sdk\`
- [ ] Example showing multi-tool agent with confidence gating
- [ ] Docs page at /docs/integrations/anthropic" \
  '["enhancement","integration"]'

create_issue \
  "feat: MCP (Model Context Protocol) authorization middleware" \
  "## Overview
MCP is becoming the standard protocol for agent-to-tool communication. Lelu should act as an authorization middleware layer for MCP servers — every tool call through MCP gets a policy check.

## Architecture
\`\`\`
Claude → MCP Client → [Lelu Auth Middleware] → MCP Server → Tool
\`\`\`

## Acceptance criteria
- [ ] MCP server middleware package
- [ ] Works with any MCP-compatible client
- [ ] Actor derived from MCP session context
- [ ] Docs page at /docs/integrations/mcp" \
  '["enhancement","integration"]'

create_issue \
  "feat: Python SDK — parity with TypeScript SDK" \
  "## Overview
Python is the dominant language for AI development. The Python SDK needs full parity with the TypeScript SDK including confidence gating, human-review, and audit.

## API surface
\`\`\`python
from lelu import create_client

lelu = create_client(api_key=os.environ[\"LELU_API_KEY\"])
decision = await lelu.agent_authorize(
    actor=\"billing-agent\",
    action=\"refund:process\",
    context={\"confidence\": 0.88}
)
\`\`\`

## Acceptance criteria
- [ ] Published to PyPI as \`lelu-agent-auth\`
- [ ] Async-first with sync wrapper
- [ ] Full type hints
- [ ] 90%+ test coverage" \
  '["enhancement","sdk"]'

create_issue \
  "feat: Vercel AI SDK integration" \
  "## Overview
Vercel AI SDK is widely used for building AI applications on Next.js. Lelu should provide a drop-in \`authorize\` wrapper for \`tool\` definitions.

## Proposed API
\`\`\`typescript
import { tool } from 'ai'
import { withLelu } from 'lelu-agent-auth/vercel'

const secureTool = withLelu(tool({
  description: 'Process a refund',
  parameters: z.object({ orderId: z.string() }),
  execute: async ({ orderId }) => processRefund(orderId),
}), { actor: 'billing-agent', action: 'refund:process' })
\`\`\`

## Acceptance criteria
- [ ] Works with Vercel AI SDK \`tool()\`
- [ ] Supports streaming
- [ ] Example app deployed on Vercel
- [ ] Docs page at /docs/integrations/vercel-ai" \
  '["enhancement","integration"]'

create_issue \
  "feat: Policy playground in the dashboard UI" \
  "## Overview
Developers should be able to write Rego policies and test them against sample inputs directly in the browser — no CLI required.

## Features
- Monaco editor with Rego syntax highlighting
- Sample input builder (actor / action / resource / context)
- Live decision output (allow / deny / require_human_review)
- Shareable policy links

## Acceptance criteria
- [ ] Live at /policies/playground
- [ ] No backend required — evaluates client-side via WASM OPA
- [ ] Can import/export .rego files" \
  '["enhancement","roadmap"]'

create_issue \
  "feat: GitHub Actions integration — authorize CI/CD agent actions" \
  "## Overview
CI/CD pipelines are increasingly agentic — auto-deploy, auto-merge, auto-release. Lelu should provide a GitHub Action that gates these operations through policy.

## Example workflow
\`\`\`yaml
- uses: lelu-auth/action@v1
  with:
    actor: github-actions
    action: deploy:production
    context: |
      { \"branch\": \"\${{ github.ref }}\", \"confidence\": 0.95 }
\`\`\`

## Acceptance criteria
- [ ] Published to GitHub Marketplace
- [ ] Supports allow / deny / require-approval flows
- [ ] Approval webhook to Slack/Teams" \
  '["enhancement","integration","roadmap"]'

echo ""
echo "✅ Done. Check https://github.com/$REPO"
