export default function DocsSso() {
  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-sm font-medium mb-6">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Authentication
        </div>
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4 tracking-tight">
          SSO &amp; Authentication
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Lelu supports three authentication modes for accessing the Platform API and UI: static API
          keys for machine-to-machine calls, enterprise OIDC SSO for your team, and trusted-header
          SSO for deployments behind a reverse proxy.
        </p>
      </div>

      {/* Mode overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-14">
        {[
          {
            label: "API Key",
            tag: "Default",
            desc: "Simple bearer token for CI/CD, agents, and local dev.",
            color: "zinc",
          },
          {
            label: "OIDC SSO",
            tag: "Enterprise",
            desc: "Any OIDC-compliant IdP: Okta, Auth0, Azure AD, Keycloak.",
            color: "indigo",
          },
          {
            label: "Trusted Header",
            tag: "Proxy",
            desc: "Email passed by your reverse proxy (Nginx, Cloudflare Access).",
            color: "blue",
          },
        ].map((m) => (
          <div
            key={m.label}
            className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5"
          >
            <div
              className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-3 ${
                m.color === "indigo"
                  ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400"
                  : m.color === "blue"
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                    : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
              }`}
            >
              {m.tag}
            </div>
            <h3 className="font-semibold text-zinc-900 dark:text-white text-sm mb-2">{m.label}</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-500 leading-relaxed">{m.desc}</p>
          </div>
        ))}
      </div>

      <div className="space-y-16">
        {/* Mode 1: API Key */}
        <section id="api-key">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">
            Mode 1 — API Key (Default)
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            Every Lelu deployment has a{" "}
            <code className="text-sm px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono">
              PLATFORM_API_KEY
            </code>
            . Set it as the{" "}
            <code className="text-sm px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono">
              Authorization
            </code>{" "}
            header for all requests to the Platform API. This is also how the engine syncs policies
            with the platform.
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
              <strong>Production requirement:</strong> Always set{" "}
              <code className="bg-amber-100 dark:bg-amber-900/50 px-1 rounded font-mono">
                PLATFORM_API_KEY
              </code>{" "}
              to a strong random secret (min 32 chars). The default value{" "}
              <code className="bg-amber-100 dark:bg-amber-900/50 px-1 rounded font-mono">
                platform-dev-key
              </code>{" "}
              must never be used in production.
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden">
              <div className="px-4 py-2 border-b border-zinc-800 dark:border-white/10 bg-zinc-950 dark:bg-white/5">
                <span className="text-xs text-zinc-500 font-mono">.env</span>
              </div>
              <pre className="p-4 font-mono text-sm text-zinc-300 leading-relaxed overflow-x-auto">
                {`# Generate with: openssl rand -base64 32\nPLATFORM_API_KEY=your_strong_random_secret_here`}
              </pre>
            </div>
            <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden">
              <div className="px-4 py-2 border-b border-zinc-800 dark:border-white/10 bg-zinc-950 dark:bg-white/5">
                <span className="text-xs text-zinc-500 font-mono">Example request</span>
              </div>
              <pre className="p-4 font-mono text-sm text-zinc-300 leading-relaxed overflow-x-auto">
                {`curl http://localhost:9090/api/v1/policies \\\n  -H "Authorization: Bearer $PLATFORM_API_KEY"`}
              </pre>
            </div>
          </div>
        </section>

        {/* Mode 2: OIDC SSO */}
        <section id="oidc-sso">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-2">
            Mode 2 — OIDC SSO (Enterprise)
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-500 font-mono mb-6">
            Supported: Okta, Azure AD, Auth0, Google Workspace, Keycloak, and any OIDC-compliant
            IdP.
          </p>
          <p className="text-zinc-600 dark:text-zinc-400 mb-8">
            Enable OIDC SSO to let your team log in using your existing identity provider. Lelu acts
            as an OIDC relying party — it validates access tokens on every request using the
            provider&apos;s JWKS endpoint.
          </p>

          {/* Flow */}
          <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-4">How it works</h3>
          <div className="relative border-l-2 border-zinc-200 dark:border-zinc-800 ml-4 space-y-6 pb-4 mb-8">
            {[
              {
                title: "User signs in via your IdP",
                desc: "Your frontend redirects to the IdP's authorization endpoint. The IdP returns an access token (JWT).",
              },
              {
                title: "Token passed to Lelu API",
                desc: "The client forwards the JWT in the Authorization: Bearer header on every Platform API request.",
              },
              {
                title: "Lelu verifies the token",
                desc: "The platform fetches the IdP's JWKS, verifies the token's signature, expiry, and audience claim.",
              },
              {
                title: "Request is authorized",
                desc: "If the token is valid, the request proceeds. Invalid or expired tokens receive a 401 response.",
              },
            ].map((step, i) => (
              <div key={i} className="relative pl-8">
                <div className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 border-2 border-indigo-400 dark:border-indigo-600 flex items-center justify-center">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {i + 1}
                  </span>
                </div>
                <h4 className="font-medium text-zinc-900 dark:text-white text-sm mb-1">
                  {step.title}
                </h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{step.desc}</p>
              </div>
            ))}
          </div>

          <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-4">
            1. Configure your IdP
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-zinc-600 dark:text-zinc-400 mb-8 ml-2">
            <li>
              Create a new web application in your identity provider (or &ldquo;API&rdquo; in Auth0,
              &ldquo;App registration&rdquo; in Azure AD).
            </li>
            <li>
              Note the <strong>Issuer URL</strong> (e.g.{" "}
              <code className="px-1 rounded bg-zinc-100 dark:bg-zinc-800 font-mono">
                https://your-tenant.okta.com
              </code>
              ).
            </li>
            <li>
              Note the <strong>Client ID</strong> — this becomes{" "}
              <code className="px-1 rounded bg-zinc-100 dark:bg-zinc-800 font-mono">
                OIDC_AUDIENCE
              </code>
              .
            </li>
            <li>
              No redirect URI is needed — Lelu validates tokens, it does not initiate the OAuth
              flow.
            </li>
          </ol>

          <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-4">
            2. Set environment variables
          </h3>
          <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden mb-8">
            <div className="px-4 py-2 border-b border-zinc-800 dark:border-white/10 bg-zinc-950 dark:bg-white/5">
              <span className="text-xs text-zinc-500 font-mono">.env</span>
            </div>
            <pre className="p-4 font-mono text-sm text-zinc-300 leading-loose overflow-x-auto">
              {`# Okta\nOIDC_ISSUER_URL=https://your-tenant.okta.com\nOIDC_AUDIENCE=0oa1b2c3d4e5f6g7h8i9\n\n# Auth0\nOIDC_ISSUER_URL=https://your-tenant.auth0.com/\nOIDC_AUDIENCE=your-auth0-api-audience\n\n# Azure AD\nOIDC_ISSUER_URL=https://login.microsoftonline.com/TENANT_ID/v2.0\nOIDC_AUDIENCE=api://your-application-id`}
            </pre>
          </div>

          <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-4">
            3. Restart and test
          </h3>
          <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden mb-6">
            <div className="px-4 py-2 border-b border-zinc-800 dark:border-white/10 bg-zinc-950 dark:bg-white/5">
              <span className="text-xs text-zinc-500 font-mono">terminal</span>
            </div>
            <pre className="p-4 font-mono text-sm text-zinc-300 leading-relaxed overflow-x-auto">
              {`docker compose restart platform\n\ncurl http://localhost:9090/api/v1/policies \\\n  -H "Authorization: Bearer <YOUR_IDP_ACCESS_TOKEN>"\n# Expected: 200 OK`}
            </pre>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl p-4 flex gap-3">
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
              When{" "}
              <code className="bg-blue-100 dark:bg-blue-800/50 px-1 rounded font-mono">
                OIDC_ISSUER_URL
              </code>{" "}
              is set, Lelu still accepts the{" "}
              <code className="bg-blue-100 dark:bg-blue-800/50 px-1 rounded font-mono">
                PLATFORM_API_KEY
              </code>{" "}
              for machine-to-machine calls (e.g. from the engine). Both methods work simultaneously.
            </p>
          </div>
        </section>

        {/* Mode 3: Trusted Header */}
        <section id="trusted-header">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">
            Mode 3 — Trusted-Header SSO
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            If your infrastructure runs an authenticating reverse proxy (Nginx + LDAP, Cloudflare
            Access, Tailscale&hellip;) you can configure Lelu to trust the email header that proxy
            injects — no OIDC configuration needed.
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
            <p className="text-sm text-amber-800 dark:text-amber-300">
              <strong>Security notice:</strong> Only use this mode when the Lelu Platform API is{" "}
              <strong>not</strong> directly reachable from the internet. The trusted header must
              only be injectable by your proxy, never by end users.
            </p>
          </div>
          <div className="space-y-4">
            <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden">
              <div className="px-4 py-2 border-b border-zinc-800 dark:border-white/10 bg-zinc-950 dark:bg-white/5">
                <span className="text-xs text-zinc-500 font-mono">.env</span>
              </div>
              <pre className="p-4 font-mono text-sm text-zinc-300 leading-loose overflow-x-auto">
                {`# The HTTP header your proxy injects\nSSO_TRUSTED_HEADER=X-Forwarded-Email\n\n# Optional: restrict to a specific email domain\nSSO_TRUSTED_EMAIL_DOMAIN=yourcompany.com`}
              </pre>
            </div>
            <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden">
              <div className="px-4 py-2 border-b border-zinc-800 dark:border-white/10 bg-zinc-950 dark:bg-white/5">
                <span className="text-xs text-zinc-500 font-mono">Example: Cloudflare Access</span>
              </div>
              <pre className="p-4 font-mono text-sm text-zinc-300 leading-loose overflow-x-auto">
                {`SSO_TRUSTED_HEADER=Cf-Access-Authenticated-User-Email\nSSO_TRUSTED_EMAIL_DOMAIN=yourcompany.com`}
              </pre>
            </div>
          </div>
        </section>

        {/* Comparison */}
        <section id="comparison">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-6">Comparison</h2>
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-4 py-3 font-medium text-zinc-900 dark:text-white">Mode</th>
                  <th className="px-4 py-3 font-medium text-zinc-900 dark:text-white">Best for</th>
                  <th className="px-4 py-3 font-medium text-zinc-900 dark:text-white">Setup</th>
                  <th className="px-4 py-3 font-medium text-zinc-900 dark:text-white">
                    IdP required
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
                <tr>
                  <td className="px-4 py-3 font-semibold text-zinc-800 dark:text-zinc-200">
                    API Key
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    CI/CD, agents, local dev
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">1 env var</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                      No
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-zinc-800 dark:text-zinc-200">
                    OIDC SSO
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    Enterprise team logins
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    2 env vars + IdP config
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400">
                      Yes
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-zinc-800 dark:text-zinc-200">
                    Trusted Header
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    Proxy-authenticated intranets
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">2 env vars</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                      No
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Prev / Next */}
      <div className="flex justify-between items-center pt-12 mt-12 border-t border-zinc-200 dark:border-white/10">
        <a
          href="/docs/installation"
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
          Previous: Installation
        </a>
        <a
          href="/docs/confidence"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          Next: Confidence Scores
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
