export default function DocsConfidence() {
  return (
    <>
      <h1>Confidence-Aware Authorization</h1>
      <p className="lead">
        Prizm Engine evaluates policy decisions using both context and confidence.
      </p>

      <h2>Why confidence matters</h2>
      <p>
        AI agents make probabilistic decisions. Confidence-aware authorization lets
        you apply stricter rules as confidence drops, without blocking safe actions.
      </p>

      <h2>Example policy</h2>
      <pre><code>{`package prizm.policy

default allow = false

allow {
  input.confidence >= 0.8
  input.action == "s3:DeleteObject"
  input.resource.bucket == "prod-data"
}`}</code></pre>

      <h2>Typical thresholds</h2>
      <pre><code>{`0.90 - 1.00  => allow
0.60 - 0.89  => allow with reduced scope
0.00 - 0.59  => require human review`}</code></pre>
    </>
  );
}
