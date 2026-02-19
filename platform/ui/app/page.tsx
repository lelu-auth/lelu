import { listAuditEvents } from "@/lib/api";
import { AuditTable } from "@/components/AuditTable";

export const dynamic = "force-dynamic";

export default async function AuditPage({
  searchParams,
}: {
  searchParams: { actor?: string; action?: string; decision?: string };
}) {
  const events = await listAuditEvents({
    actor: searchParams.actor,
    action: searchParams.action,
    decision: searchParams.decision,
    limit: 100,
  });

  const total = events.length;
  const allowed  = events.filter((e) => e.decision === "allowed").length;
  const denied   = events.filter((e) => e.decision === "denied").length;
  const review   = events.filter((e) => e.decision === "human_review").length;

  return (
    <>
      <h1>Audit Log</h1>
      <p className="subtitle">SOC 2-ready immutable event trail</p>

      <div className="grid">
        <div className="stat-card">
          <div className="stat-num">{total}</div>
          <div className="stat-label">Total Events</div>
        </div>
        <div className="stat-card">
          <div className="stat-num" style={{ color: "#86efac" }}>{allowed}</div>
          <div className="stat-label">Allowed</div>
        </div>
        <div className="stat-card">
          <div className="stat-num" style={{ color: "#fca5a5" }}>{denied}</div>
          <div className="stat-label">Denied</div>
        </div>
        <div className="stat-card">
          <div className="stat-num" style={{ color: "#fde68a" }}>{review}</div>
          <div className="stat-label">Human Review</div>
        </div>
      </div>

      <form method="GET" className="filter-bar">
        <input name="actor"    defaultValue={searchParams.actor}    placeholder="Filter by actor…" />
        <input name="action"   defaultValue={searchParams.action}   placeholder="Filter by action…" />
        <select name="decision" defaultValue={searchParams.decision ?? ""}>
          <option value="">All decisions</option>
          <option value="allowed">Allowed</option>
          <option value="denied">Denied</option>
          <option value="human_review">Human review</option>
        </select>
        <button
          type="submit"
          style={{
            background: "#a78bfa", color: "#0f0f11", border: "none",
            padding: "0.4rem 1rem", borderRadius: "6px", cursor: "pointer", fontWeight: 600,
          }}
        >
          Filter
        </button>
      </form>

      <AuditTable events={events} />
    </>
  );
}
