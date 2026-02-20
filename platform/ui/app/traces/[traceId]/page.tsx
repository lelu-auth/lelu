import { getTrace } from "@/lib/api";
import { AuditTable } from "@/components/AuditTable";
import { Badge } from "@/components/Badge";

export const dynamic = "force-dynamic";

export default async function TracePage({
  params,
}: {
  params: { traceId: string };
}) {
  const trace = await getTrace(params.traceId);

  const avgConf =
    trace.events.length > 0
      ? trace.events.reduce((s, e) => s + e.confidence_score, 0) / trace.events.length
      : 0;

  const decisions = [...new Set(trace.events.map((e) => e.decision))];

  return (
    <>
      <a href="/" className="back-link">← Back to Audit Log</a>

      <h1>Trace Detail</h1>
      <p className="subtitle" style={{ fontFamily: "monospace" }}>{params.traceId}</p>

      <div className="grid" style={{ marginBottom: "2rem" }}>
        <div className="stat-card">
          <div className="stat-num">{trace.events.length}</div>
          <div className="stat-label">Events</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{(avgConf * 100).toFixed(0)}%</div>
          <div className="stat-label">Avg Confidence</div>
        </div>
        <div className="stat-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
          {decisions.map((d) => (
            <Badge key={d} decision={d} />
          ))}
          <div className="stat-label">Decisions</div>
        </div>
      </div>

      {trace.events.length > 0 && (
        <div className="card" style={{ marginBottom: "2rem" }}>
          <div className="card-label">Actors involved</div>
          <div className="card-value">
            {[...new Set(trace.events.map((e) => e.actor))].join(", ")}
          </div>
        </div>
      )}

      <h2>Events</h2>
      <AuditTable events={trace.events} />
    </>
  );
}
