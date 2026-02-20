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
      <table>
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
              <td>{e.id}</td>
              <td>
                <a href={`/traces/${e.trace_id}`}>{e.trace_id.slice(0, 8)}&hellip;</a>
              </td>
              <td>{e.actor}</td>
              <td>{e.action}</td>
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
                  {e.decision}
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
                  <span style={{ fontSize: "0.75rem", color: "#94a3b8", minWidth: 32 }}>
                    {(e.confidence_score * 100).toFixed(0)}%
                  </span>
                </div>
              </td>
              <td style={{ color: "#64748b", whiteSpace: "nowrap" }}>
                {new Date(e.created_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
