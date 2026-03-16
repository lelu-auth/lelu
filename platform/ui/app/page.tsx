import Link from 'next/link';

const pillars = [
  {
    title: "Policy-Driven Decisions",
    text: "Lelu applies Rego policies at action time so every tool call can be evaluated, gated, and audited before hitting your APIs.",
    icon: (
      <svg className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: "Human-in-the-Loop",
    text: "High-risk AI actions (like issuing refunds or dropping tables) are automatically paused and routed to human reviewers in a beautiful UI.",
    icon: (
      <svg className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    title: "Tamper-Proof Audit Trail",
    text: "Every allow, deny, and escalation is captured with confidence context, trace IDs, and decision metadata for absolute observability.",
    icon: (
      <svg className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 002-2M9 5a2 2 0 012 2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Multi-Agent Delegation",
    text: "Agents can safely mint short-lived, scopes-down tokens for sub-agents, ensuring the principle of least privilege extends to swarms.",
    icon: (
      <svg className="h-6 w-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
  }
];

export default function Home() {
  return (
    <div className="relative min-h-screen bg-white text-black dark:bg-[#000000] dark:text-white overflow-hidden selection:bg-indigo-500/30">

      {/* Dynamic Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-20%] left-[20%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-4000" />
      </div>

      <div className="mx-auto max-w-7xl px-6 pt-24 pb-32">

        {/* Hero Section */}
        <div className="flex flex-col items-center text-center space-y-8 animate-fade-in-up">
          <div className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50/50 px-3 py-1 text-sm text-zinc-600 backdrop-blur-md dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500 mr-2 animate-pulse"></span>
            Lelu Engine v1.0 is live
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-black to-zinc-600 dark:from-white dark:to-zinc-500 max-w-4xl">
            The authorization layer <br className="hidden md:block" /> for AI Agents.
          </h1>

          <p className="max-w-2xl text-lg md:text-xl text-zinc-600 dark:text-zinc-400">
            Control what your agents can do. Lelu brings confidence-aware gating, interactive human-review, and tamper-proof auditing to your autonomous AI workflows.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-4">
            <Link href="/docs" className="inline-flex items-center justify-center rounded-full bg-black px-8 py-3.5 text-sm font-medium text-white shadow-lg transition-transform hover:scale-105 hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200">
              Get Started
            </Link>
            <a href="https://github.com/lelu-auth/lelu" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white/50 px-8 py-3.5 text-sm font-medium text-zinc-900 backdrop-blur-md transition-colors hover:bg-zinc-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
              View on GitHub
            </a>
          </div>
        </div>

        {/* Code/Terminal Showcase */}
        <div className="mt-20 flex justify-center w-full opacity-0 animate-[fadeInUp_0.8s_ease-out_0.2s_forwards]">
          <div className="w-full max-w-4xl overflow-hidden rounded-2xl border border-zinc-200 bg-white/40 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-black/50">
            <div className="flex items-center border-b border-zinc-200 px-4 py-3 dark:border-white/10">
              <div className="flex space-x-2">
                <div className="h-3 w-3 rounded-full bg-rose-500/80"></div>
                <div className="h-3 w-3 rounded-full bg-amber-500/80"></div>
                <div className="h-3 w-3 rounded-full bg-emerald-500/80"></div>
              </div>
              <div className="ml-4 text-xs font-medium text-zinc-500">agent.ts</div>
            </div>
            <div className="p-6 overflow-x-auto text-sm">
              <pre className="font-mono leading-relaxed">
                <code className="text-zinc-800 dark:text-zinc-200">
                  <span className="text-purple-600 dark:text-purple-400">import</span> {"{ "}lelu{" }"} <span className="text-purple-600 dark:text-purple-400">from</span> <span className="text-emerald-600 dark:text-emerald-400">'@lelu/sdk'</span>;<br />
                  <span className="text-purple-600 dark:text-purple-400">import</span> {"{ "}OpenAI{" }"} <span className="text-purple-600 dark:text-purple-400">from</span> <span className="text-emerald-600 dark:text-emerald-400">'openai'</span>;<br /><br />
                  <span className="text-zinc-500 dark:text-zinc-500">// Wrap your agent tools securely</span><br />
                  <span className="text-blue-600 dark:text-blue-400">const</span> agent = openai.beta.assistants.create({"{"}<br />
                  {"  "}instructions: <span className="text-emerald-600 dark:text-emerald-400">"You are a helpful billing assistant."</span>,<br />
                  {"  "}tools: [<br />
                  {"    "}<span className="text-blue-600 dark:text-blue-400">lelu</span>.secureTool({"{"}<br />
                  {"      "}name: <span className="text-emerald-600 dark:text-emerald-400">"issue_refund"</span>,<br />
                  {"      "}policy: <span className="text-emerald-600 dark:text-emerald-400">"billing_rules.yaml"</span>,<br />
                  {"      "}requiresConfidence: <span className="text-amber-600 dark:text-amber-400">0.90</span>,<br />
                  {"    "}{"}"})<br />
                  {"  "}]<br />
                  {"}"});<br /><br />
                  <span className="text-zinc-500 dark:text-zinc-500">// If confidence {'<'} 0.90, the agent is securely paused and</span><br />
                  <span className="text-zinc-500 dark:text-zinc-500">// routed to the Lelu Human Review dashboard.</span>
                </code>
              </pre>
            </div>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="mt-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Security infrastructure for your agents.</h2>
            <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">A comprehensive suite to monitor, control, and audit autonomous workflows.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pillars.map((pillar, idx) => (
              <div key={idx} className="group relative overflow-hidden rounded-3xl border border-zinc-200 bg-white/50 p-8 hover:bg-white/80 transition-colors backdrop-blur-sm dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-white/10">
                  {pillar.icon}
                </div>
                <h3 className="mb-3 text-xl font-semibold text-zinc-900 dark:text-white">{pillar.title}</h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{pillar.text}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
