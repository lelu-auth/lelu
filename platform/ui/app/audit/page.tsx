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
      <header className="header">
        <div>
          <h1>Audit Log</h1>
          <p className="subtitle">SOC 2-ready immutable event trail</p>
        </div>
        <div className="actions">
          <button className="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            Export CSV
          </button>
        </div>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-title">Total Events</div>
          <div className="stat-value">{total}</div>
          <div className="stat-trend positive">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
              <polyline points="16 7 22 7 22 13"></polyline>
            </svg>
            +12% this week
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Allowed</div>
          <div className="stat-value" style={{ color: "var(--accent-green)" }}>{allowed}</div>
          <div className="stat-trend">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Stable
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Denied</div>
          <div className="stat-value" style={{ color: "var(--accent-red)" }}>{denied}</div>
          <div className="stat-trend negative">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline>
              <polyline points="16 17 22 17 22 11"></polyline>
            </svg>
            -5% this week
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Human Review</div>
          <div className="stat-value" style={{ color: "var(--accent-yellow)" }}>{review}</div>
          <div className="stat-trend">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Stable
          </div>
        </div>
      </div>

      <form method="GET" className="filter-bar">
        <div className="search-input">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input name="actor" defaultValue={searchParams.actor} placeholder="Filter by actor…" />
        </div>
        <div className="search-input">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input name="action" defaultValue={searchParams.action} placeholder="Filter by action…" />
        </div>
        <select name="decision" defaultValue={searchParams.decision ?? ""} className="select-input">
          <option value="">All decisions</option>
          <option value="allowed">Allowed</option>
          <option value="denied">Denied</option>
          <option value="human_review">Human review</option>
        </select>
        <button type="submit" className="btn btn-primary">
          Filter
        </button>
      </form>

      <AuditTable events={events} />
    </>
  );
}
