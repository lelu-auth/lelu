export default function DocsInstallation() {
  const steps = [
    { num: 1, title: "Prerequisites" },
    { num: 2, title: "Clone the Repository" },
    { num: 3, title: "Set Environment Variables" },
    { num: 4, title: "Start the Services" },
    { num: 5, title: "Verify the Installation" },
    { num: 6, title: "Install the SDK" },
    { num: 7, title: "Authorize Your First Agent" },
  ];

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 text-sm font-medium mb-6">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          </svg>
          Installation
        </div>
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4 tracking-tight">
          Get started with Prism
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Prism is self-hosted, runs on your own infrastructure, and integrates
          with your AI agent in minutes. Follow these steps to get a
          production-ready authorization layer up and running.
        </p>
      </div>

      {/* On-page step nav */}
      <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 mb-12">
        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
          Steps in this guide
        </p>
        <ol className="space-y-1.5">
          {steps.map((s) => (
            <li key={s.num}>
              <a
                href={`#step-${s.num}`}
                className="inline-flex items-center gap-2.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                <span className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs flex items-center justify-center font-medium shrink-0">
                  {s.num}
                </span>
                {s.title}
              </a>
            </li>
          ))}
        </ol>
      </div>

      <div className="space-y-16">

        {/* Step 1 */}
        <section id="step-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 text-white text-sm font-bold flex items-center justify-center shrink-0">
              1
            </div>
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">
              Prerequisites
            </h2>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            Make sure you have the following tools installed on your machine
            before continuing.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { name: "Docker", version: "v24+", desc: "Container runtime & Compose" },
              { name: "Git", version: "any", desc: "To clone the repository" },
              { name: "curl / httpie", version: "optional", desc: "To test the API" },
            ].map((t) => (
              <div
                key={t.name}
                className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4"
              >
                <div className="font-semibold text-zinc-900 dark:text-white text-sm mb-1">
                  {t.name}
                </div>
                <div className="text-xs font-mono text-purple-600 dark:text-purple-400 mb-2">
                  {t.version}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-500">{t.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Step 2 */}
        <section id="step-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 text-white text-sm font-bold flex items-center justify-center shrink-0">
              2
            </div>
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">
              Clone the Repository
            </h2>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            Clone the Prism repository to your local machine. All deployment
            files and configuration live in the repository root.
          </p>
          <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden">
            <div className="px-4 py-2 border-b border-zinc-800 dark:border-white/10 bg-zinc-950 dark:bg-white/5">
              <span className="text-xs text-zinc-500 font-mono">terminal</span>
            </div>
            <pre className="p-4 font-mono text-sm text-zinc-300 leading-relaxed overflow-x-auto">
              {`git clone https://github.com/Abenezer0923/Prism.git\ncd Prism`}
            </pre>
          </div>
        </section>

        {/* Step 3 */}
        <section id="step-3">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 text-white text-sm font-bold flex items-center justify-center shrink-0">
              3
            </div>
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">
              Set Environment Variables
            </h2>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            Create a{" "}
            <code className="text-sm px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono">
              .env
            </code>{" "}
            file in the repository root. Never commit this file — add it to{" "}
            <code className="text-sm px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono">
              .gitignore
            </code>
            .
          </p>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4 flex gap-3 mb-6">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <div className="text-sm text-amber-800 dark:text-amber-300">
              <strong>Security notice:</strong> All keys marked{" "}
              <code className="bg-amber-100 dark:bg-amber-900/50 px-1 rounded font-mono">
                CHANGE_ME
              </code>{" "}
              <strong>must</strong> be replaced with strong, randomly generated
              secrets before any production deployment. Use{" "}
              <code className="bg-amber-100 dark:bg-amber-900/50 px-1 rounded font-mono">
                openssl rand -base64 32
              </code>{" "}
              to generate each one.
            </div>
          </div>

          <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden mb-6">
            <div className="px-4 py-2 border-b border-zinc-800 dark:border-white/10 bg-zinc-950 dark:bg-white/5">
              <span className="text-xs text-zinc-500 font-mono">.env</span>
            </div>
            <pre className="p-4 font-mono text-sm text-zinc-300 leading-loose overflow-x-auto">
              {`# Engine\nJWT_SIGNING_KEY=CHANGE_ME_min_32_chars\nAPI_KEY=CHANGE_ME_engine_api_key\n\n# Platform\nPLATFORM_API_KEY=CHANGE_ME_platform_key\nPOSTGRES_PASSWORD=CHANGE_ME_db_password\n\n# SSO (optional)\n# OIDC_ISSUER_URL=https://your-idp.example.com\n# OIDC_AUDIENCE=your-client-id`}
            </pre>
          </div>

          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 font-medium">
            All environment variables:
          </p>
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-4 py-3 font-medium text-zinc-900 dark:text-white">Variable</th>
                  <th className="px-4 py-3 font-medium text-zinc-900 dark:text-white">Service</th>
                  <th className="px-4 py-3 font-medium text-zinc-900 dark:text-white">Description</th>
                  <th className="px-4 py-3 font-medium text-zinc-900 dark:text-white">Required</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
                {[
                  ["JWT_SIGNING_KEY", "Engine", "Signs agent JIT tokens. Min 32 chars.", "Yes"],
                  ["API_KEY", "Engine", "Bearer token for authorization requests.", "Yes"],
                  ["PLATFORM_API_KEY", "Platform", "Bearer token the platform API expects.", "Yes"],
                  ["POSTGRES_PASSWORD", "Postgres", "Password for the PostgreSQL prism user.", "Yes"],
                  ["DATABASE_URL", "Platform", "Full Postgres DSN. Auto-built in Compose.", "Auto"],
                  ["CONTROL_PLANE_URL", "Engine", "Platform API URL for policy sync.", "No"],
                  ["OIDC_ISSUER_URL", "Platform", "OIDC discovery URL for enterprise SSO.", "No"],
                  ["OIDC_AUDIENCE", "Platform", "Client ID of your OIDC application.", "No"],
                  ["SSO_TRUSTED_HEADER", "Platform", "HTTP header carrying a pre-authenticated email.", "No"],
                  ["SSO_TRUSTED_EMAIL_DOMAIN", "Platform", "Only accept emails from this domain.", "No"],
                ].map(([v, svc, desc, req]) => (
                  <tr key={v}>
                    <td className="px-4 py-2.5 font-mono text-purple-600 dark:text-purple-400">{v}</td>
                    <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">{svc}</td>
                    <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">{desc}</td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          req === "Yes"
                            ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                            : req === "Auto"
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                        }`}
                      >
                        {req}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Step 4 */}
        <section id="step-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 text-white text-sm font-bold flex items-center justify-center shrink-0">
              4
            </div>
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">
              Start the Services
            </h2>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            A single command builds all images and starts all five containers
            (engine, platform API, UI, Postgres, Redis) in the background.
          </p>
          <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden mb-6">
            <div className="px-4 py-2 border-b border-zinc-800 dark:border-white/10 bg-zinc-950 dark:bg-white/5">
              <span className="text-xs text-zinc-500 font-mono">terminal</span>
            </div>
            <pre className="p-4 font-mono text-sm text-zinc-300 leading-relaxed overflow-x-auto">
              {`docker compose up -d --build`}
            </pre>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl p-4 flex gap-3 mb-6">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <p className="text-sm text-blue-800 dark:text-blue-300">
              On first run, Docker downloads base images. Expect 1–3 minutes.
              Subsequent builds are much faster due to layer caching.
            </p>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3 font-medium">
            Once running, services are available at:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: "UI Dashboard", url: "http://localhost:3000" },
              { label: "Engine API", url: "http://localhost:8082" },
              { label: "Platform API", url: "http://localhost:9090" },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4"
              >
                <div className="text-xs text-zinc-500 dark:text-zinc-500 mb-1">
                  {s.label}
                </div>
                <code className="text-sm text-zinc-800 dark:text-zinc-200 font-mono">
                  {s.url}
                </code>
              </div>
            ))}
          </div>
        </section>

        {/* Step 5 */}
        <section id="step-5">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 text-white text-sm font-bold flex items-center justify-center shrink-0">
              5
            </div>
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">
              Verify the Installation
            </h2>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            Run these health checks to confirm every service started correctly.
          </p>
          <div className="space-y-4">
            <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden">
              <div className="px-4 py-2 border-b border-zinc-800 dark:border-white/10 bg-zinc-950 dark:bg-white/5">
                <span className="text-xs text-zinc-500 font-mono">
                  Check all containers
                </span>
              </div>
              <pre className="p-4 font-mono text-sm text-zinc-300 leading-relaxed">
                {`docker compose ps`}
              </pre>
            </div>
            <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden">
              <div className="px-4 py-2 border-b border-zinc-800 dark:border-white/10 bg-zinc-950 dark:bg-white/5">
                <span className="text-xs text-zinc-500 font-mono">
                  Engine health
                </span>
              </div>
              <pre className="p-4 font-mono text-sm text-zinc-300 leading-relaxed overflow-x-auto">
                {`curl http://localhost:8082/healthz\n# {"status":"ok","version":"1.0.0"}`}
              </pre>
            </div>
            <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden">
              <div className="px-4 py-2 border-b border-zinc-800 dark:border-white/10 bg-zinc-950 dark:bg-white/5">
                <span className="text-xs text-zinc-500 font-mono">
                  Platform health
                </span>
              </div>
              <pre className="p-4 font-mono text-sm text-zinc-300 leading-relaxed overflow-x-auto">
                {`curl http://localhost:9090/healthz\n# {"status":"ok","service":"prism-platform"}`}
              </pre>
            </div>
          </div>
        </section>

        {/* Step 6 */}
        <section id="step-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 text-white text-sm font-bold flex items-center justify-center shrink-0">
              6
            </div>
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">
              Install the SDK
            </h2>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            Install the official Prism SDK into your AI agent project.
          </p>
          <div className="space-y-4">
            <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden">
              <div className="px-4 py-2 border-b border-zinc-800 dark:border-white/10 bg-zinc-950 dark:bg-white/5">
                <span className="text-xs text-zinc-500 font-mono">npm</span>
              </div>
              <pre className="p-4 font-mono text-sm text-zinc-300">
                {`npm install prizm-engine`}
              </pre>
            </div>
            <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden">
              <div className="px-4 py-2 border-b border-zinc-800 dark:border-white/10 bg-zinc-950 dark:bg-white/5">
                <span className="text-xs text-zinc-500 font-mono">pip</span>
              </div>
              <pre className="p-4 font-mono text-sm text-zinc-300">
                {`pip install auth-pe`}
              </pre>
            </div>
          </div>
        </section>

        {/* Step 7 */}
        <section id="step-7">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white text-sm font-bold flex items-center justify-center shrink-0">
              7
            </div>
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">
              Authorize Your First Agent
            </h2>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            Call the engine from your agent to authorize an action. Replace{" "}
            <code className="text-sm px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono">
              YOUR_API_KEY
            </code>{" "}
            with the{" "}
            <code className="text-sm px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono">
              API_KEY
            </code>{" "}
            from your{" "}
            <code className="text-sm px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono">
              .env
            </code>
            .
          </p>
          <div className="space-y-4">
            <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden">
              <div className="px-4 py-2 border-b border-zinc-800 dark:border-white/10 bg-zinc-950 dark:bg-white/5">
                <span className="text-xs text-zinc-500 font-mono">TypeScript</span>
              </div>
              <pre className="p-4 font-mono text-sm text-zinc-300 leading-loose overflow-x-auto">
                {`import { PrismClient } from "prizm-engine";

const prism = new PrismClient({
  baseUrl: process.env.PRISM_URL ?? "http://localhost:8082",
  apiKey: process.env.PRISM_API_KEY!,
});

const decision = await prism.agentAuthorize({
  actor: "support_agent",
  action: "issue_refund",
  context: { confidence: 0.87 },
});

if (decision.requiresHumanReview) {
  await waitForApproval(decision.requestId);
} else if (decision.allowed) {
  await issueRefund();
}`}
              </pre>
            </div>
            <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden">
              <div className="px-4 py-2 border-b border-zinc-800 dark:border-white/10 bg-zinc-950 dark:bg-white/5">
                <span className="text-xs text-zinc-500 font-mono">Python</span>
              </div>
              <pre className="p-4 font-mono text-sm text-zinc-300 leading-loose overflow-x-auto">
                {`from auth_pe import PrismClient

prism = PrismClient(
    base_url=os.environ["PRISM_URL"],
    api_key=os.environ["PRISM_API_KEY"],
)

decision = prism.authorize(
    actor="invoice_bot",
    action="approve_refund",
    confidence=0.92,
)

if decision.requires_human_review:
    decision.wait()
elif decision.allowed:
    approve_refund()`}
              </pre>
            </div>
          </div>

          <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800/50 rounded-xl p-6 flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shrink-0">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-green-900 dark:text-green-300 mb-1">
                You&apos;re production-ready!
              </h3>
              <p className="text-sm text-green-800 dark:text-green-400">
                Prism is now intercepting every AI agent action. Every decision
                is logged in the Audit Trail, uncertain actions are queued for
                human review, and your policies are evaluated in under 2ms.
              </p>
            </div>
          </div>
        </section>

      </div>

      {/* Prev / Next */}
      <div className="flex justify-between items-center pt-12 mt-12 border-t border-zinc-200 dark:border-white/10">
        <a
          href="/docs/quickstart"
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
          Previous: Quickstart
        </a>
        <a
          href="/docs/sso"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          Next: SSO &amp; Authentication
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
