export default function DocsAuditTrail() {
  return (
    <>
      <h1>Audit Trails</h1>
      <p className="lead">
        Every authorization decision is logged with full context and traceability.
      </p>

      <h2>What gets logged</h2>
      <p>
        Audit entries include actor, action, resource, decision, reason, confidence,
        and a trace ID that you can use to investigate outcomes across services.
      </p>

      <h2>Audit Log UI</h2>
      <p>
        Use the Audit Log in the platform UI to filter by actor, action, or decision,
        and export a CSV for compliance reporting.
      </p>

      <h2>Storage options</h2>
      <p>
        The engine supports local and external sinks (for example, S3) to store
        audit events in durable, immutable storage.
      </p>
    </>
  );
}
