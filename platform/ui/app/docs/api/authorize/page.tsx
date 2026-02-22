"use client";

import { useState } from "react";

export default function DocsAuthorizeApi() {
  const [reqTab, setReqTab] = useState<"curl" | "ts" | "py">("curl");

  return (
    <>
      <h1>Authorize API</h1>
      <p className="lead">
        Evaluate a standard authorization request against your active policies.
      </p>

      <div className="endpoint-badge">
        <span className="method post">POST</span>
        <span className="path">/v1/authorize</span>
      </div>

      <h2>Description</h2>
      <p>
        The <code>/v1/authorize</code> endpoint evaluates a subject's request to perform an action on a resource. 
        It returns a boolean decision (<code>allowed</code>) and an optional <code>reason</code>.
      </p>

      <h2>Request Body</h2>
      <div className="table-wrap">
        <table className="docs-table">
          <thead>
            <tr>
              <th>Field</th>
              <th>Type</th>
              <th>Required</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>user_id</code></td>
              <td><code>string</code></td>
              <td>Yes</td>
              <td>The identity making the request (e.g., user ID, role, or service account).</td>
            </tr>
            <tr>
              <td><code>action</code></td>
              <td><code>string</code></td>
              <td>Yes</td>
              <td>The operation being attempted (e.g., <code>documents:read</code>, <code>write</code>, <code>delete</code>).</td>
            </tr>
            <tr>
              <td><code>resource</code></td>
              <td><code>object</code></td>
              <td>Yes</td>
              <td>The target of the action (e.g., <code>{`{"doc_id": "doc_123"}`}</code>).</td>
            </tr>
            <tr>
              <td><code>context</code></td>
              <td><code>object</code></td>
              <td>No</td>
              <td>Additional key-value pairs for policy evaluation (e.g., IP address, time of day, environment).</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Example Request</h2>
      <div className="code-showcase" style={{ margin: "1.5rem 0" }}>
        <div className="code-tabs">
          <div 
            className={`code-tab ${reqTab === "curl" ? "active" : ""}`}
            onClick={() => setReqTab("curl")}
          >
            cURL
          </div>
          <div 
            className={`code-tab ${reqTab === "ts" ? "active" : ""}`}
            onClick={() => setReqTab("ts")}
          >
            TypeScript
          </div>
          <div 
            className={`code-tab ${reqTab === "py" ? "active" : ""}`}
            onClick={() => setReqTab("py")}
          >
            Python
          </div>
        </div>
        <div className="code-block-wrapper">
          {reqTab === "curl" && (
            <pre><code>{`curl -X POST http://localhost:8082/v1/authorize \\
  -H "Content-Type: application/json" \\
  -d '{
    "user_id": "user-42",
    "action": "documents:read",
    "resource": {
      "doc_id": "doc_123"
    },
    "context": {
      "ip": "192.168.1.1"
    }
  }'`}</code></pre>
          )}
          {reqTab === "ts" && (
            <pre><code>{`import { PrizmClient } from "prizm-engine";

const client = new PrizmClient({ endpoint: "http://localhost:8082" });

const decision = await client.authorize({
  user_id: "user-42",
  action: "documents:read",
  resource: { doc_id: "doc_123" },
  context: { ip: "192.168.1.1" }
});

console.log(decision.allowed); // true or false`}</code></pre>
          )}
          {reqTab === "py" && (
            <pre><code>{`from prizm_engine import PrizmClient

client = PrizmClient(endpoint="http://localhost:8082")

decision = client.authorize(
    user_id="user-42",
    action="documents:read",
    resource={"doc_id": "doc_123"},
    context={"ip": "192.168.1.1"}
)

print(decision.allowed) # True or False`}</code></pre>
          )}
        </div>
      </div>

      <h2>Response</h2>
      <div className="table-wrap">
        <table className="docs-table">
          <thead>
            <tr>
              <th>Field</th>
              <th>Type</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>allowed</code></td>
              <td><code>boolean</code></td>
              <td>Whether the request is permitted by the active policies.</td>
            </tr>
            <tr>
              <td><code>reason</code></td>
              <td><code>string</code></td>
              <td>Optional explanation for the decision, useful for debugging or audit logs.</td>
            </tr>
            <tr>
              <td><code>trace_id</code></td>
              <td><code>string</code></td>
              <td>A unique identifier for the evaluation trace.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <pre><code>{`{
  "allowed": true,
  "reason": "Policy matched",
  "trace_id": "tr_9b213a..."
}`}</code></pre>

      <h2>Status Codes</h2>
      <ul>
        <li><code>200 OK</code>: Request evaluated successfully.</li>
        <li><code>400 Bad Request</code>: Missing required fields (user_id, action, resource).</li>
        <li><code>500 Internal Server Error</code>: Policy evaluation failed.</li>
      </ul>
    </>
  );
}
