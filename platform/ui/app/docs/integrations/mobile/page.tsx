export default function DocsIntegrationsMobile() {
  return (
    <div className="max-w-3xl">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 text-sm font-medium mb-6">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" />
          </svg>
          Integrations
        </div>
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4 tracking-tight">
          Mobile (React Native)
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Use Lelu in React Native apps to authorize AI agent actions on-device. Because mobile
          clients cannot safely store API keys, all Lelu calls must be proxied through your backend.
        </p>
      </div>

      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">
            Recommended Architecture
          </h2>
          <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 mb-6">
            <ol className="relative border-l-2 border-zinc-300 dark:border-zinc-700 ml-3 space-y-5">
              {[
                {
                  title: "Mobile app proposes action",
                  desc: "The React Native app sends the action + confidence score to your backend API (not to Lelu directly).",
                },
                {
                  title: "Backend calls Lelu Engine",
                  desc: "Your server receives the request and calls the Lelu Engine /authorize with the API key stored server-side.",
                },
                {
                  title: "Poll for approval (if needed)",
                  desc: "Backend returns a requestId. The mobile app polls your backend endpoint until the human approves or denies.",
                },
                {
                  title: "Result returned to app",
                  desc: "The backend returns the final allow/deny to the mobile app. The app proceeds or shows an error.",
                },
              ].map((s, i) => (
                <li key={i} className="pl-6">
                  <div className="absolute -left-[7px] w-3 h-3 rounded-full bg-orange-400 dark:bg-orange-500"></div>
                  <h4 className="font-semibold text-zinc-900 dark:text-white text-sm mb-1">
                    {i + 1}. {s.title}
                  </h4>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{s.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">
            React Native Client
          </h2>
          <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden">
            <div className="px-4 py-2 border-b border-zinc-800 dark:border-white/10 bg-zinc-950 dark:bg-white/5">
              <span className="text-xs text-zinc-500 font-mono">hooks/useLeluAction.ts</span>
            </div>
            <pre className="p-4 font-mono text-sm text-zinc-300 overflow-x-auto">{`import { useState } from "react";

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

export function useLeluAction() {
  const [status, setStatus] = useState<"idle" | "pending" | "approved" | "denied">("idle");

  async function authorize(action: string, confidence: number) {
    setStatus("pending");

    // Call your own backend (which calls Lelu internally)
    const res = await fetch(\`\${API_BASE}/authorize\`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, confidence }),
    });

    const { status: decision, requestId } = await res.json();

    if (decision === "pending") {
      // Poll for approval every 2 seconds
      return pollForApproval(requestId);
    }

    setStatus(decision === "allow" ? "approved" : "denied");
    return decision;
  }

  async function pollForApproval(requestId: string) {
    const poll = setInterval(async () => {
      const res = await fetch(\`\${API_BASE}/authorize/\${requestId}\`);
      const { status: decision } = await res.json();
      if (decision !== "pending") {
        clearInterval(poll);
        setStatus(decision === "allow" ? "approved" : "denied");
      }
    }, 2000);
  }

  return { authorize, status };
}`}</pre>
          </div>
        </section>
      </div>

      <div className="flex justify-between items-center pt-12 mt-12 border-t border-zinc-200 dark:border-white/10">
        <a
          href="/docs/integrations/react"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Previous: React
        </a>
        <a
          href="/docs/databases"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          Next: Databases
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </div>
  );
}
