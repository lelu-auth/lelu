export default function DocsIntroduction() {
  return (
    <>
      <h1>Introduction</h1>
      <p className="lead">
        Prizm Engine is the most comprehensive Authorization Engine designed specifically for AI Agents.
      </p>
      
      <h2>What is Prizm Engine?</h2>
      <p>
        Traditional authorization systems (like RBAC or ABAC) are binary: a user either has access or they don't. 
        However, AI agents operate probabilistically. An agent might be 99% confident it should delete a file, or only 40% confident.
      </p>
      <p>
        Prizm Engine bridges this gap by introducing <strong>Confidence-Aware Authorization</strong>. It evaluates not just <em>who</em> is asking and <em>what</em> they want to do, but <em>how confident</em> they are in their action.
      </p>

      <h2>Key Features</h2>
      <div className="feature-list">
        <div className="feature-item">
          <h3>🛡️ Confidence-Aware Policies</h3>
          <p>Write Rego policies that dynamically adjust permissions based on the agent's confidence score.</p>
        </div>
        <div className="feature-item">
          <h3>⏸️ Human-in-the-loop (HITL)</h3>
          <p>Automatically route high-risk or low-confidence actions to a human approval queue.</p>
        </div>
        <div className="feature-item">
          <h3>📜 SOC 2-Ready Audit Trails</h3>
          <p>Every decision, confidence score, and human approval is cryptographically logged for compliance.</p>
        </div>
      </div>

      <h2>How it works</h2>
      <p>
        Prizm Engine sits between your AI Agents and your sensitive resources (APIs, Databases, Cloud Infrastructure). 
        Before an agent takes an action, it asks Prizm Engine for permission, providing its current confidence level.
      </p>
      <pre><code>{`// Example Agent Request
{
  "actor": "agent-123",
  "action": "s3:DeleteObject",
  "resource": { "bucket": "production-data" },
  "confidence": 0.85
}`}</code></pre>

      <h2>Next Steps</h2>
      <p>
        Ready to get started? Head over to the <a href="/docs/installation">Installation</a> guide to set up Prizm Engine in your environment, or check out the <a href="/docs/quickstart">Quick Start</a> to see it in action.
      </p>
    </>
  );
}
