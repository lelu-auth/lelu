import { AuditEvent } from "@/lib/api";

function confClass(c: number) {
  if (c >= 0.9) return "conf-high";
  if (c >= 0.7) return "conf-mid";
  return "conf-low";
}

export function AuditTable({ events }: { events: AuditEvent[] }) {
  if (!events.length) return <div className="empty">No audit events found.</div>;
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Trace</th>
            <th>Actor</th>
            <th>Action</th>
            <th>Decision</th>
            <th>Confidence</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => (
            <tr key={e.id}>
              <td className="font-mono text-muted">{e.id}</td>
              <td className="font-mono">
                <a href={`/traces/${e.trace_id}`} style={{ color: 'var(--accent-purple)', textDecoration: 'none' }}>
                  {e.trace_id.slice(0, 8)}&hellip;
                </a>
              </td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                    🤖
                  </div>
                  {e.actor}
                </div>
              </td>
              <td className="font-mono text-sm">{e.action}</td>
              <td>
                <span
                  className={
                    "badge " +
                    (e.decision === "allowed"
                      ? "badge-allowed"
                      : e.decision === "denied"
                      ? "badge-denied"
                      : "badge-review")
                  }
                >
                  {e.decision === "human_review" ? "Review" : e.decision.charAt(0).toUpperCase() + e.decision.slice(1)}
                </span>
              </td>
              <td>
                <div className="conf">
                  <div className="conf-bar">
                    <div
                      className={`conf-fill ${confClass(e.confidence_score)}`}
                      style={{ width: `${Math.round(e.confidence_score * 100)}%` }}
                    />
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", minWidth: 32 }}>
                    {(e.confidence_score * 100).toFixed(0)}%
                  </span>
                </div>
              </td>
              <td className="text-muted text-sm" style={{ whiteSpace: "nowrap" }}>
                {new Date(e.created_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
