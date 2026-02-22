export default function DocsHumanInLoop() {
  return (
    <>
      <h1>Human-in-the-loop</h1>
      <p className="lead">
        Route risky or low-confidence actions to a human approval queue.
      </p>

      <h2>How it works</h2>
      <p>
        If policy rules or confidence checks require review, Prizm Engine enqueues
        the request and marks the decision as requiring human approval.
      </p>

      <h2>Queue endpoints</h2>
      <pre><code>{`GET  /v1/queue/pending
GET  /v1/queue/{id}
POST /v1/queue/{id}/approve
POST /v1/queue/{id}/deny`}</code></pre>

      <h2>Approve a request</h2>
      <pre><code>{`curl -X POST http://localhost:8080/v1/queue/req_123/approve \
  -H "Content-Type: application/json" \
  -d '{
    "resolved_by": "admin@company.com",
    "note": "Approved for compliance review"
  }'`}</code></pre>
    </>
  );
}
