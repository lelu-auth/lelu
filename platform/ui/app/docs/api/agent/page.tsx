"use client";

import { useState } from "react";

export default function DocsAgentAuthorizeApi() {
  const [reqTab, setReqTab] = useState<"curl" | "ts" | "py">("curl");

  return (
    <>
      <h1>Agent Authorize API</h1>
      <p className="lead">
        Confidence-aware authorization for AI agents.
      </p>

      <div className="flex items-center gap-3 my-6 p-4 rounded-lg bg-zinc-900/50 border border-zinc-800 font-mono text-sm">
        <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 font-bold">POST</span>
        <span className="text-zinc-300">/v1/agent/authorize</span>
      </div>

      <h2>Description</h2>
      <p>
        The <code>/v1/agent/authorize</code> endpoint evaluates an AI agent's request to perform an action. 
        It takes into account the agent's confidence level and can trigger human-in-the-loop reviews or downgrade scopes if the confidence is too low.
      </p>

      <h2>Request Body</h2>
      <div className="overflow-x-auto my-6 rounded-xl border border-zinc-800 bg-zinc-900/30">
        <table className="w-full text-left text-sm whitespace-nowrap m-0">
          <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50 border-b border-zinc-800">
            <tr>
              <th className="px-6 py-4 font-medium">Field</th>
              <th className="px-6 py-4 font-medium">Type</th>
              <th className="px-6 py-4 font-medium">Required</th>
              <th className="px-6 py-4 font-medium">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            <tr className="hover:bg-zinc-900/30 transition-colors">
              <td className="px-6 py-4 font-mono text-zinc-300">actor</td>
              <td className="px-6 py-4 font-mono text-blue-400">string</td>
              <td className="px-6 py-4 text-zinc-400">Yes</td>
              <td className="px-6 py-4 text-zinc-400">The identity of the AI agent making the request.</td>
            </tr>
            <tr className="hover:bg-zinc-900/30 transition-colors">
              <td className="px-6 py-4 font-mono text-zinc-300">action</td>
              <td className="px-6 py-4 font-mono text-blue-400">string</td>
              <td className="px-6 py-4 text-zinc-400">Yes</td>
              <td className="px-6 py-4 text-zinc-400">The operation being attempted (e.g., <code>s3:DeleteObject</code>).</td>
            </tr>
            <tr className="hover:bg-zinc-900/30 transition-colors">
              <td className="px-6 py-4 font-mono text-zinc-300">resource</td>
              <td className="px-6 py-4 font-mono text-blue-400">object</td>
              <td className="px-6 py-4 text-zinc-400">Yes</td>
              <td className="px-6 py-4 text-zinc-400">The target of the action (e.g., <code>{`{"bucket": "prod-data"}`}</code>).</td>
            </tr>
            <tr className="hover:bg-zinc-900/30 transition-colors">
              <td className="px-6 py-4 font-mono text-zinc-300">confidence</td>
              <td className="px-6 py-4 font-mono text-blue-400">number</td>
              <td className="px-6 py-4 text-zinc-400">Yes</td>
              <td className="px-6 py-4 text-zinc-400">The agent's confidence score for the action, typically between 0.0 and 1.0.</td>
            </tr>
            <tr className="hover:bg-zinc-900/30 transition-colors">
              <td className="px-6 py-4 font-mono text-zinc-300">acting_for</td>
              <td className="px-6 py-4 font-mono text-blue-400">string</td>
              <td className="px-6 py-4 text-zinc-400">No</td>
              <td className="px-6 py-4 text-zinc-400">The user ID the agent is acting on behalf of.</td>
            </tr>
            <tr className="hover:bg-zinc-900/30 transition-colors">
              <td className="px-6 py-4 font-mono text-zinc-300">scope</td>
              <td className="px-6 py-4 font-mono text-blue-400">string</td>
              <td className="px-6 py-4 text-zinc-400">No</td>
              <td className="px-6 py-4 text-zinc-400">The requested scope of the action (e.g., <code>storage:write</code>).</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Example Request</h2>
      <div className="rounded-xl overflow-hidden border border-zinc-800 bg-[#0d0d0d] shadow-2xl my-6 not-prose">
        <div className="flex items-center px-4 py-3 bg-zinc-900/80 border-b border-zinc-800">
          <div className="flex gap-2 mr-6">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
          </div>
          <div className="flex gap-4 text-sm font-medium">
            <button 
              className={`px-2 py-1 rounded transition-colors ${reqTab === "curl" ? "text-white bg-zinc-800" : "text-zinc-500 hover:text-zinc-300"}`}
              onClick={() => setReqTab("curl")}
            >
              cURL
            </button>
            <button 
              className={`px-2 py-1 rounded transition-colors ${reqTab === "ts" ? "text-white bg-zinc-800" : "text-zinc-500 hover:text-zinc-300"}`}
              onClick={() => setReqTab("ts")}
            >
              TypeScript
            </button>
            <button 
              className={`px-2 py-1 rounded transition-colors ${reqTab === "py" ? "text-white bg-zinc-800" : "text-zinc-500 hover:text-zinc-300"}`}
              onClick={() => setReqTab("py")}
            >
              Python
            </button>
          </div>
        </div>
        <div className="p-6 font-mono text-sm overflow-x-auto">
          {reqTab === "curl" && (
            <pre className="text-zinc-300 leading-relaxed m-0 p-0 bg-transparent"><code>{`curl -X POST http://localhost:8082/v1/agent/authorize \\
  -H "Content-Type: application/json" \\
  -d '{
    "actor": "agent-123",
    "action": "s3:DeleteObject",
    "resource": { "bucket": "prod-data" },
    "confidence": 0.85,
    "acting_for": "user-42",
    "scope": "storage:write"
  }'`}</code></pre>
          )}
          {reqTab === "ts" && (
            <pre className="text-zinc-300 leading-relaxed m-0 p-0 bg-transparent"><code>{`import { PrizmClient } from "prizm-engine";

const client = new PrizmClient({ endpoint: "http://localhost:8082" });

const decision = await client.agentAuthorize({
  actor: "agent-123",
  action: "s3:DeleteObject",
  resource: { bucket: "prod-data" },
  confidence: 0.85,
  acting_for: "user-42",
  scope: "storage:write"
});

console.log(decision.allowed); // false
console.log(decision.requires_human_review); // true`}</code></pre>
          )}
          {reqTab === "py" && (
            <pre className="text-zinc-300 leading-relaxed m-0 p-0 bg-transparent"><code>{`from prizm_engine import PrizmClient

client = PrizmClient(endpoint="http://localhost:8082")

decision = client.agent_authorize(
    actor="agent-123",
    action="s3:DeleteObject",
    resource={"bucket": "prod-data"},
    confidence=0.85,
    acting_for="user-42",
    scope="storage:write"
)

print(decision.allowed) # False
print(decision.requires_human_review) # True`}</code></pre>
          )}
        </div>
      </div>

      <h2>Response</h2>
      <div className="overflow-x-auto my-6 rounded-xl border border-zinc-800 bg-zinc-900/30">
        <table className="w-full text-left text-sm whitespace-nowrap m-0">
          <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50 border-b border-zinc-800">
            <tr>
              <th className="px-6 py-4 font-medium">Field</th>
              <th className="px-6 py-4 font-medium">Type</th>
              <th className="px-6 py-4 font-medium">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            <tr className="hover:bg-zinc-900/30 transition-colors">
              <td className="px-6 py-4 font-mono text-zinc-300">allowed</td>
              <td className="px-6 py-4 font-mono text-blue-400">boolean</td>
              <td className="px-6 py-4 text-zinc-400">Whether the request is permitted by the active policies.</td>
            </tr>
            <tr className="hover:bg-zinc-900/30 transition-colors">
              <td className="px-6 py-4 font-mono text-zinc-300">reason</td>
              <td className="px-6 py-4 font-mono text-blue-400">string</td>
              <td className="px-6 py-4 text-zinc-400">Optional explanation for the decision.</td>
            </tr>
            <tr className="hover:bg-zinc-900/30 transition-colors">
              <td className="px-6 py-4 font-mono text-zinc-300">trace_id</td>
              <td className="px-6 py-4 font-mono text-blue-400">string</td>
              <td className="px-6 py-4 text-zinc-400">A unique identifier for the evaluation trace.</td>
            </tr>
            <tr className="hover:bg-zinc-900/30 transition-colors">
              <td className="px-6 py-4 font-mono text-zinc-300">downgraded_scope</td>
              <td className="px-6 py-4 font-mono text-blue-400">string</td>
              <td className="px-6 py-4 text-zinc-400">If the confidence was too low for the requested scope, the engine may return a downgraded scope (e.g., <code>storage:read</code>).</td>
            </tr>
            <tr className="hover:bg-zinc-900/30 transition-colors">
              <td className="px-6 py-4 font-mono text-zinc-300">requires_human_review</td>
              <td className="px-6 py-4 font-mono text-blue-400">boolean</td>
              <td className="px-6 py-4 text-zinc-400">Indicates if the request was queued for human approval.</td>
            </tr>
            <tr className="hover:bg-zinc-900/30 transition-colors">
              <td className="px-6 py-4 font-mono text-zinc-300">confidence_used</td>
              <td className="px-6 py-4 font-mono text-blue-400">number</td>
              <td className="px-6 py-4 text-zinc-400">The confidence score that was evaluated.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <pre className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-300 overflow-x-auto"><code>{`{
  "allowed": false,
  "reason": "Confidence below threshold",
  "trace_id": "tr_7f30c2...",
  "downgraded_scope": "storage:read",
  "requires_human_review": true,
  "confidence_used": 0.85
}`}</code></pre>

      <h2>Status Codes</h2>
      <ul className="space-y-2">
        <li><code className="text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded">200 OK</code>: Request evaluated successfully.</li>
        <li><code className="text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded">400 Bad Request</code>: Missing required fields.</li>
        <li><code className="text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded">500 Internal Server Error</code>: Policy evaluation failed.</li>
      </ul>
    </>
  );
}
