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

  const decisions = Array.from(new Set(trace.events.map((e) => e.decision)));

  return (
    <>
      <a href="/" className="back-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '1rem' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Back to Audit Log
      </a>

      <header className="header">
        <div>
          <h1>Trace Detail</h1>
          <p className="subtitle font-mono text-muted">{params.traceId}</p>
        </div>
      </header>

      <div className="stats-grid" style={{ marginBottom: "2rem" }}>
        <div className="stat-card">
          <div className="stat-title">Events</div>
          <div className="stat-value">{trace.events.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Avg Confidence</div>
          <div className="stat-value">{(avgConf * 100).toFixed(0)}%</div>
        </div>
        <div className="stat-card" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "0.5rem" }}>
          <div className="stat-title">Decisions</div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {decisions.map((d) => (
              <Badge key={d} decision={d} />
            ))}
          </div>
        </div>
      </div>

      {trace.events.length > 0 && (
        <div className="stat-card" style={{ marginBottom: "2rem" }}>
          <div className="stat-title">Actors involved</div>
          <div className="stat-value" style={{ fontSize: '1.25rem', marginTop: '0.5rem' }}>
            {Array.from(new Set(trace.events.map((e) => e.actor))).join(", ")}
          </div>
        </div>
      )}

      <h2 style={{ marginBottom: '1rem' }}>Events</h2>
      <AuditTable events={trace.events} />
    </>
  );
}
