"use client";

import { useState } from "react";

export default function DocsQueueApi() {
  const [reqTab, setReqTab] = useState<"curl" | "ts" | "py">("curl");

  return (
    <>
      <h1>Queue API</h1>
      <p className="lead">
        Review and resolve requests that require human approval.
      </p>

      <h2>Endpoints</h2>
      <p>
        The Queue API provides endpoints to manage the human-in-the-loop approval process for AI agents.
      </p>

      <div className="endpoint-badge">
        <span className="method get">GET</span>
        <span className="path">/v1/queue/pending</span>
      </div>
      <p>Retrieves a list of all pending authorization requests that require human review.</p>

      <div className="endpoint-badge">
        <span className="method get">GET</span>
        <span className="path">/v1/queue/{"{id}"}</span>
      </div>
      <p>Retrieves the details of a specific queued request by its ID.</p>

      <div className="endpoint-badge">
        <span className="method post">POST</span>
        <span className="path">/v1/queue/{"{id}"}/approve</span>
      </div>
      <p>Approves a pending request, allowing the agent to proceed with the action.</p>

      <div className="endpoint-badge">
        <span className="method post">POST</span>
        <span className="path">/v1/queue/{"{id}"}/deny</span>
      </div>
      <p>Denies a pending request, blocking the agent from performing the action.</p>

      <h2>Resolve Payload</h2>
      <p>
        When approving or denying a request, you must provide a JSON payload indicating who resolved the request and an optional note.
      </p>
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
              <td><code>resolved_by</code></td>
              <td><code>string</code></td>
              <td>Yes</td>
              <td>The identity of the human reviewer (e.g., email or user ID).</td>
            </tr>
            <tr>
              <td><code>note</code></td>
              <td><code>string</code></td>
              <td>No</td>
              <td>An optional comment explaining the decision.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Example: Approve Request</h2>
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
            <pre><code>{`curl -X POST http://localhost:8082/v1/queue/req_123abc/approve \\
  -H "Content-Type: application/json" \\
  -d '{
    "resolved_by": "admin@company.com",
    "note": "Approved after review"
  }'`}</code></pre>
          )}
          {reqTab === "ts" && (
            <pre><code>{`import { PrizmClient } from "prizm-engine";

const client = new PrizmClient({ endpoint: "http://localhost:8082" });

await client.approveRequest("req_123abc", {
  resolved_by: "admin@company.com",
  note: "Approved after review"
});`}</code></pre>
          )}
          {reqTab === "py" && (
            <pre><code>{`from prizm_engine import PrizmClient

client = PrizmClient(endpoint="http://localhost:8082")

client.approve_request(
    request_id="req_123abc",
    resolved_by="admin@company.com",
    note="Approved after review"
)`}</code></pre>
          )}
        </div>
      </div>

      <h2>Response</h2>
      <p>
        A successful approval or denial returns a <code>200 OK</code> status with the updated request object.
      </p>
      <pre><code>{`{
  "id": "req_123abc",
  "status": "approved",
  "resolved_by": "admin@company.com",
  "resolved_at": "2023-10-27T10:00:00Z",
  "note": "Approved after review"
}`}</code></pre>
    </>
  );
}
