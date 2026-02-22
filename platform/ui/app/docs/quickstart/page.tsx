export default function DocsQuickStart() {
  return (
    <>
      <h1>Quick Start</h1>
      <p className="lead">
        Send your first authorization request and see the decision in seconds.
      </p>

      <h2>1. Start the engine</h2>
      <pre><code>{`docker compose up -d --build`}</code></pre>

      <h2>2. Call the API</h2>
      <p>
        Use the agent authorization endpoint and include a confidence score.
      </p>
      <pre><code>{`curl -X POST http://localhost:8080/v1/agent/authorize \
  -H "Content-Type: application/json" \
  -d '{
    "actor": "agent-123",
    "action": "s3:DeleteObject",
    "resource": { "bucket": "prod-data" },
    "confidence": 0.85,
    "acting_for": "user-42",
    "scope": "storage:write"
  }'`}</code></pre>

      <h2>3. Inspect the decision</h2>
      <pre><code>{`{
  "allowed": true,
  "reason": "Confidence threshold met",
  "trace_id": "tr_7f30c2...",
  "requires_human_review": false,
  "confidence_used": 0.85
}`}</code></pre>

      <h2>4. Use the SDK</h2>
      <pre><code>{`import { PrismClient } from "prizm-engine";

const client = new PrismClient({
  endpoint: "http://localhost:8080",
});

const decision = await client.authorizeAgent({
  actor: "agent-123",
  action: "s3:DeleteObject",
  resource: { bucket: "prod-data" },
  confidence: 0.85,
});`}</code></pre>
    </>
  );
}
