import Link from "next/link";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="docs-layout">
      <aside className="docs-sidebar">
        <nav>
          <div className="sidebar-group">
            <h3>Getting Started</h3>
            <ul>
              <li><Link href="/docs" className="active">Introduction</Link></li>
              <li><Link href="/docs/installation">Installation</Link></li>
              <li><Link href="/docs/quickstart">Quick Start</Link></li>
            </ul>
          </div>
          <div className="sidebar-group">
            <h3>Core Concepts</h3>
            <ul>
              <li><Link href="/docs/confidence">Confidence-Aware Auth</Link></li>
              <li><Link href="/docs/human-in-loop">Human-in-the-loop</Link></li>
              <li><Link href="/docs/audit-trail">Audit Trails</Link></li>
            </ul>
          </div>
          <div className="sidebar-group">
            <h3>API Reference</h3>
            <ul>
              <li><Link href="/docs/api/authorize">/v1/authorize</Link></li>
              <li><Link href="/docs/api/agent">/v1/agent/authorize</Link></li>
              <li><Link href="/docs/api/queue">/v1/queue</Link></li>
            </ul>
          </div>
        </nav>
      </aside>
      <main className="docs-content prose">
        {children}
      </main>
    </div>
  );
}
