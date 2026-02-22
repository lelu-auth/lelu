import Link from "next/link";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-73px)] max-w-7xl mx-auto">
      <aside className="w-64 shrink-0 border-r border-zinc-800/50 p-6 hidden md:block sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto">
        <nav className="space-y-8">
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Getting Started</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/docs" className="text-blue-400 font-medium hover:text-blue-300 transition-colors">Introduction</Link></li>
              <li><Link href="/docs/installation" className="text-zinc-400 hover:text-zinc-200 transition-colors">Installation</Link></li>
              <li><Link href="/docs/quickstart" className="text-zinc-400 hover:text-zinc-200 transition-colors">Quick Start</Link></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Core Concepts</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/docs/confidence" className="text-zinc-400 hover:text-zinc-200 transition-colors">Confidence-Aware Auth</Link></li>
              <li><Link href="/docs/human-in-loop" className="text-zinc-400 hover:text-zinc-200 transition-colors">Human-in-the-loop</Link></li>
              <li><Link href="/docs/audit-trail" className="text-zinc-400 hover:text-zinc-200 transition-colors">Audit Trails</Link></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">API Reference</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/docs/api/authorize" className="text-zinc-400 hover:text-zinc-200 transition-colors">/v1/authorize</Link></li>
              <li><Link href="/docs/api/agent" className="text-zinc-400 hover:text-zinc-200 transition-colors">/v1/agent/authorize</Link></li>
              <li><Link href="/docs/api/queue" className="text-zinc-400 hover:text-zinc-200 transition-colors">/v1/queue</Link></li>
            </ul>
          </div>
        </nav>
      </aside>
      <main className="flex-1 p-8 md:p-12 max-w-3xl prose prose-invert prose-zinc prose-a:text-blue-400 hover:prose-a:text-blue-300 prose-headings:text-zinc-100 prose-p:text-zinc-400 prose-strong:text-zinc-200 prose-code:text-zinc-300 prose-code:bg-zinc-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none">
        {children}
      </main>
    </div>
  );
}
