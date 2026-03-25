import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Lelu - AI Agent Authorization Platform',
  description: 'Lelu is an authorization and security platform for AI agents. We help companies safely deploy autonomous AI systems with real-time access control, human oversight, and complete audit trails.',
};

export default function AboutPage() {
  return (
    <div className="relative min-h-screen bg-white text-black dark:bg-[#000000] dark:text-white">
      <div className="mx-auto max-w-5xl px-6 py-24">
        
        {/* Hero Section */}
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            About Lelu
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-3xl">
            Lelu is an authorization and security platform for AI agents. We help companies safely deploy autonomous AI systems by providing real-time access control, human oversight, and complete audit trails.
          </p>
        </div>

        {/* The Problem */}
        <div className="mb-16 pb-16 border-b border-zinc-200 dark:border-white/10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">The Problem We Solve</h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
            AI agents are becoming powerful enough to take real actions—processing refunds, modifying databases, sending emails, and making business decisions. But current authorization systems weren't built for AI.
          </p>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Traditional access control assumes deterministic, human-driven actions. AI agents operate with uncertainty, make probabilistic decisions, and can be manipulated through prompt injection attacks. Companies need a new security layer designed specifically for autonomous AI systems.
          </p>
        </div>

        {/* Our Solution */}
        <div className="mb-16 pb-16 border-b border-zinc-200 dark:border-white/10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Our Solution</h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed mb-8">
            Lelu provides a complete authorization engine that evaluates every AI agent action in real-time, considering:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="rounded-xl border border-zinc-200 dark:border-white/10 p-6 bg-white/50 dark:bg-white/5">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-lg font-semibold mb-2">Confidence-Aware Control</h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Automatically routes low-confidence decisions to human reviewers, preventing costly mistakes.
              </p>
            </div>
            
            <div className="rounded-xl border border-zinc-200 dark:border-white/10 p-6 bg-white/50 dark:bg-white/5">
              <div className="text-3xl mb-3">🛡️</div>
              <h3 className="text-lg font-semibold mb-2">Prompt Injection Defense</h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Detects and blocks malicious prompts before they can manipulate agent behavior.
              </p>
            </div>
            
            <div className="rounded-xl border border-zinc-200 dark:border-white/10 p-6 bg-white/50 dark:bg-white/5">
              <div className="text-3xl mb-3">📋</div>
              <h3 className="text-lg font-semibold mb-2">Policy Enforcement</h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Define what agents can and cannot do using simple YAML or advanced Rego policies.
              </p>
            </div>
            
            <div className="rounded-xl border border-zinc-200 dark:border-white/10 p-6 bg-white/50 dark:bg-white/5">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-lg font-semibold mb-2">Complete Audit Trail</h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Every decision is logged with full context for compliance and debugging.
              </p>
            </div>
          </div>

          <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Companies integrate Lelu into their AI applications using our SDKs (TypeScript, Python, Go), and all agent actions are evaluated through our authorization engine before execution.
          </p>
        </div>

        {/* Who We Serve */}
        <div className="mb-16 pb-16 border-b border-zinc-200 dark:border-white/10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Who We Serve</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-3 text-indigo-600 dark:text-indigo-400">
                Enterprise Development Teams
              </h3>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Companies building AI agents for customer support, internal automation, data analysis, and business operations. Teams that need to deploy AI safely while maintaining security and compliance standards.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-3 text-indigo-600 dark:text-indigo-400">
                AI Platform Providers
              </h3>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Companies offering AI agent platforms to their customers who need built-in authorization and security features without building them from scratch.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-3 text-indigo-600 dark:text-indigo-400">
                Regulated Industries
              </h3>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Financial services, healthcare, and other industries requiring strict audit trails, human oversight, and compliance documentation for AI-driven decisions.
              </p>
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="mb-16 pb-16 border-b border-zinc-200 dark:border-white/10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Real-World Use Cases</h2>
          
          <div className="space-y-8">
            <div className="rounded-xl border border-zinc-200 dark:border-white/10 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
              <h3 className="text-lg font-semibold mb-2">Customer Support Automation</h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                AI agents handle routine support tickets automatically, but high-value actions like refunds or account modifications require human approval based on confidence thresholds.
              </p>
            </div>
            
            <div className="rounded-xl border border-zinc-200 dark:border-white/10 p-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
              <h3 className="text-lg font-semibold mb-2">Database Operations</h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                AI agents can query databases freely but destructive operations (DELETE, DROP) are blocked or require explicit human review, preventing catastrophic mistakes.
              </p>
            </div>
            
            <div className="rounded-xl border border-zinc-200 dark:border-white/10 p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
              <h3 className="text-lg font-semibold mb-2">Multi-Agent Systems</h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Parent agents delegate tasks to specialized sub-agents with scoped, time-limited permissions—ensuring the principle of least privilege across agent swarms.
              </p>
            </div>
          </div>
        </div>

        {/* Technology */}
        <div className="mb-16 pb-16 border-b border-zinc-200 dark:border-white/10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Technology Stack</h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
            Lelu is built as a modern, cloud-native platform with enterprise-grade reliability:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border border-zinc-200 dark:border-white/10 p-4 bg-white/50 dark:bg-white/5">
              <div className="font-semibold mb-2">Authorization Engine</div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">Go-based engine with sub-50ms latency</div>
            </div>
            
            <div className="rounded-lg border border-zinc-200 dark:border-white/10 p-4 bg-white/50 dark:bg-white/5">
              <div className="font-semibold mb-2">Policy Language</div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">YAML for simplicity, Rego for advanced rules</div>
            </div>
            
            <div className="rounded-lg border border-zinc-200 dark:border-white/10 p-4 bg-white/50 dark:bg-white/5">
              <div className="font-semibold mb-2">Storage</div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">SQLite for local dev, PostgreSQL for production</div>
            </div>
            
            <div className="rounded-lg border border-zinc-200 dark:border-white/10 p-4 bg-white/50 dark:bg-white/5">
              <div className="font-semibold mb-2">Deployment</div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">Docker, Kubernetes, or cloud-hosted</div>
            </div>
            
            <div className="rounded-lg border border-zinc-200 dark:border-white/10 p-4 bg-white/50 dark:bg-white/5">
              <div className="font-semibold mb-2">Observability</div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">OpenTelemetry tracing, metrics, and alerts</div>
            </div>
            
            <div className="rounded-lg border border-zinc-200 dark:border-white/10 p-4 bg-white/50 dark:bg-white/5">
              <div className="font-semibold mb-2">SDKs</div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">TypeScript, Python, Go with framework integrations</div>
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="mb-16 pb-16 border-b border-zinc-200 dark:border-white/10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Our Team</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-zinc-200 dark:border-white/10 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shrink-0">
                  AG
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1">Abenezer Getachew</h3>
                  <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium mb-3">Co-Founder & Software Engineer</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Software engineer with 5+ years of experience building scalable systems. Passionate about AI safety and making autonomous systems trustworthy for production use.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Company Info */}
        <div className="mb-16 pb-16 border-b border-zinc-200 dark:border-white/10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">About the Company</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Mission</h3>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Our mission is to make AI agents safe and trustworthy for production use. We believe autonomous AI will transform how businesses operate, but only if companies can deploy it with confidence and control.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Open Source Commitment</h3>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Lelu is open source (MIT License) and available on GitHub. We believe security infrastructure should be transparent, auditable, and community-driven. Companies can self-host or use our managed cloud service.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Product Status</h3>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Lelu v1.0 is production-ready and actively used by development teams building AI agent applications. We provide SDKs, documentation, deployment guides, and community support.
              </p>
            </div>
          </div>
        </div>

        {/* Why Now */}
        <div className="mb-16 pb-16 border-b border-zinc-200 dark:border-white/10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Why This Matters Now</h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
            AI agents are moving from research prototypes to production systems. Companies like Anthropic, OpenAI, and Google are releasing increasingly capable models that can take real-world actions.
          </p>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
            But with this power comes risk. An AI agent with database access could accidentally delete critical data. A customer support agent could issue unauthorized refunds. A code-writing agent could introduce security vulnerabilities.
          </p>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Lelu provides the security infrastructure that makes AI agents safe for production deployment—allowing companies to move fast without breaking things.
          </p>
        </div>

        {/* Contact & Resources */}
        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Get Started</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-zinc-200 dark:border-white/10 p-6 bg-white/50 dark:bg-white/5">
              <h3 className="text-lg font-semibold mb-3">For Developers</h3>
              <ul className="space-y-2 text-zinc-600 dark:text-zinc-400">
                <li>
                  <Link href="/docs/quickstart" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                    Quick Start Guide →
                  </Link>
                </li>
                <li>
                  <a href="https://github.com/lelu-auth/lelu" target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                    GitHub Repository →
                  </a>
                </li>
                <li>
                  <Link href="/docs" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                    Full Documentation →
                  </Link>
                </li>
              </ul>
            </div>
            
            <div className="rounded-xl border border-zinc-200 dark:border-white/10 p-6 bg-white/50 dark:bg-white/5">
              <h3 className="text-lg font-semibold mb-3">Contact & Support</h3>
              <ul className="space-y-2 text-zinc-600 dark:text-zinc-400">
                <li>Email: <a href="mailto:support@lelu-ai.com" className="text-indigo-600 dark:text-indigo-400 hover:underline">support@lelu-ai.com</a></li>
                <li>Security: <a href="mailto:security@lelu-ai.com" className="text-indigo-600 dark:text-indigo-400 hover:underline">security@lelu-ai.com</a></li>
                <li>
                  <a href="https://github.com/lelu-auth/lelu/discussions" target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                    Community Discussions →
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 p-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to secure your AI agents?
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8 max-w-2xl mx-auto">
              Install Lelu in minutes and start building AI applications with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/docs/quickstart" className="inline-flex items-center justify-center rounded-full bg-black px-8 py-3.5 text-sm font-medium text-white shadow-lg transition-transform hover:scale-105 hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200">
                Get Started
                <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <a href="https://github.com/lelu-auth/lelu" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white/50 px-8 py-3.5 text-sm font-medium text-zinc-900 backdrop-blur-md transition-colors hover:bg-zinc-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                View on GitHub
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
