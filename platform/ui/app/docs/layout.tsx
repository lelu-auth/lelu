export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-73px)] max-w-[1400px] mx-auto">
      {/* Left Sidebar Navigation */}
      <aside className="hidden md:block w-64 shrink-0 border-r border-zinc-200 dark:border-white/[0.08] py-8 pr-6 sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto">
        <nav className="space-y-8">
          <div>
            <h4 className="font-semibold text-zinc-900 dark:text-white mb-3 px-2">Getting Started</h4>
            <ul className="space-y-1 text-sm">
              <li><a href="/docs" className="block px-2 py-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 rounded-md transition-colors">Introduction</a></li>
              <li><a href="/docs/quickstart" className="block px-2 py-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 rounded-md transition-colors">Quickstart</a></li>
              <li><a href="/docs/installation" className="block px-2 py-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 rounded-md transition-colors">Installation</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-900 dark:text-white mb-3 px-2">Concepts</h4>
            <ul className="space-y-1 text-sm">
              <li><a href="/docs/concepts/architecture" className="block px-2 py-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 rounded-md transition-colors">Architecture</a></li>
              <li><a href="/docs/concepts/api" className="block px-2 py-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 rounded-md transition-colors">API</a></li>
              <li><a href="/docs/concepts/client" className="block px-2 py-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 rounded-md transition-colors">Client SDK</a></li>
              <li><a href="/docs/concepts/cli" className="block px-2 py-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 rounded-md transition-colors">CLI &amp; MCP</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-900 dark:text-white mb-3 px-2">Features</h4>
            <ul className="space-y-1 text-sm">
              <li><a href="/docs/confidence" className="block px-2 py-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 rounded-md transition-colors">Confidence Scores</a></li>
              <li><a href="/docs/human-in-loop" className="block px-2 py-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 rounded-md transition-colors">Human-in-the-loop</a></li>
              <li><a href="/docs/audit-trail" className="block px-2 py-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 rounded-md transition-colors">Audit Trail</a></li>
              <li><a href="/docs/sso" className="block px-2 py-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 rounded-md transition-colors">SSO &amp; Authentication</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-900 dark:text-white mb-3 px-2">API Reference</h4>
            <ul className="space-y-1 text-sm">
              <li><a href="/docs/api/authorize" className="block px-2 py-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 rounded-md transition-colors">/authorize</a></li>
              <li><a href="/docs/api/queue" className="block px-2 py-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 rounded-md transition-colors">/queue</a></li>
              <li><a href="/docs/api/agent" className="block px-2 py-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 rounded-md transition-colors">Agent SDK</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-900 dark:text-white mb-3 px-2">Integrations</h4>
            <ul className="space-y-1 text-sm">
              <li><a href="/docs/integrations/backend" className="block px-2 py-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 rounded-md transition-colors">Backend</a></li>
              <li><a href="/docs/integrations/nextjs" className="block px-2 py-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 rounded-md transition-colors">Next.js</a></li>
              <li><a href="/docs/integrations/react" className="block px-2 py-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 rounded-md transition-colors">React / Frontend</a></li>
              <li><a href="/docs/integrations/mobile" className="block px-2 py-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 rounded-md transition-colors">Mobile</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-900 dark:text-white mb-3 px-2">Databases</h4>
            <ul className="space-y-1 text-sm">
              <li><a href="/docs/databases" className="block px-2 py-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 rounded-md transition-colors">Overview</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-900 dark:text-white mb-3 px-2">Plugins</h4>
            <ul className="space-y-1 text-sm">
              <li><a href="/docs/plugins/confidence-plugin" className="block px-2 py-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 rounded-md transition-colors">Confidence Score</a></li>
              <li><a href="/docs/plugins/audit-plugin" className="block px-2 py-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 rounded-md transition-colors">Audit Trail</a></li>
              <li><a href="/docs/plugins/rate-limit" className="block px-2 py-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 rounded-md transition-colors">Rate Limiting</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-900 dark:text-white mb-3 px-2">Guides</h4>
            <ul className="space-y-1 text-sm">
              <li><a href="/docs/guides/production" className="block px-2 py-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 rounded-md transition-colors">Production</a></li>
              <li><a href="/docs/guides/testing" className="block px-2 py-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 rounded-md transition-colors">Testing Policies</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-900 dark:text-white mb-3 px-2">Migrations</h4>
            <ul className="space-y-1 text-sm">
              <li><a href="/docs/migrations" className="block px-2 py-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 rounded-md transition-colors">Database Migrations</a></li>
            </ul>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 py-8 px-6 md:px-12">
        {children}
      </main>
    </div>
  );
}