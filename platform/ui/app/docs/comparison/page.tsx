import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Comparison",
  description:
    "How Lelu compares to OPA, Casbin, AWS Verified Permissions, and rolling your own authorization layer.",
};

type Row = {
  feature: string;
  lelu: string | true | false;
  opa: string | true | false;
  casbin: string | true | false;
  avp: string | true | false;
};

const rows: Row[] = [
  {
    feature: "Agent-native API",
    lelu: true,
    opa: false,
    casbin: false,
    avp: false,
  },
  {
    feature: "Confidence-aware gating",
    lelu: true,
    opa: false,
    casbin: false,
    avp: false,
  },
  {
    feature: "Human-in-the-loop review",
    lelu: true,
    opa: false,
    casbin: false,
    avp: false,
  },
  {
    feature: "Built-in audit trail",
    lelu: true,
    opa: false,
    casbin: false,
    avp: true,
  },
  {
    feature: "Policy language",
    lelu: "Rego",
    opa: "Rego",
    casbin: "PERM model",
    avp: "Cedar",
  },
  {
    feature: "Cloud-hosted option",
    lelu: true,
    opa: false,
    casbin: false,
    avp: true,
  },
  {
    feature: "TypeScript SDK",
    lelu: true,
    opa: "Community",
    casbin: true,
    avp: true,
  },
  {
    feature: "Real-time decision latency",
    lelu: "< 10 ms",
    opa: "< 5 ms",
    casbin: "< 1 ms",
    avp: "< 50 ms",
  },
  {
    feature: "Multi-agent delegation",
    lelu: true,
    opa: false,
    casbin: false,
    avp: false,
  },
  {
    feature: "Open source",
    lelu: true,
    opa: true,
    casbin: true,
    avp: false,
  },
];

function Cell({ val }: { val: string | true | false }) {
  if (val === true)
    return (
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
    );
  if (val === false)
    return (
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#F5F5F4] dark:bg-[#141416] text-[#A3A3A3]">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </span>
    );
  return <span className="text-[13px] text-[#0A0A0A] dark:text-[#E4E4E7]">{val}</span>;
}

const COLS = ["Feature", "Lelu", "OPA", "Casbin", "AWS AVP"];

export default function ComparisonPage() {
  return (
    <div className="w-full">
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-[34px] font-bold tracking-[-0.02em] text-[#0A0A0A] dark:text-white leading-tight mb-3">
          Comparison
        </h1>
        <p className="text-[15px] text-[#737373] leading-relaxed">
          How Lelu fits alongside existing authorization tools — and where it diverges.
        </p>
      </div>

      <hr className="border-[#E7E5E4] dark:border-[#27272A] mb-10" />

      <div className="space-y-12">

        {/* Positioning paragraph */}
        <section>
          <p className="text-[15px] text-[#0A0A0A] dark:text-[#E4E4E7] leading-[1.7]">
            Most authorization libraries were designed for web APIs and microservices — where the
            caller is a human, confidence is always 1.0, and a 401 is an acceptable response. AI
            agents are different: they act autonomously, their certainty varies per action, and a
            blanket deny often breaks a multi-step workflow. Lelu is built specifically for that
            runtime.
          </p>
        </section>

        {/* Comparison table */}
        <section>
          <h2 className="text-[22px] font-bold tracking-[-0.02em] text-[#0A0A0A] dark:text-white mb-6">
            Feature matrix
          </h2>
          <div className="overflow-x-auto rounded-lg border border-[#E7E5E4] dark:border-[#27272A]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E7E5E4] dark:border-[#27272A] bg-[#F5F5F4] dark:bg-[#141416]">
                  {COLS.map((col, i) => (
                    <th
                      key={col}
                      className={[
                        "px-4 py-3 text-[12px] font-semibold tracking-[0.04em] uppercase",
                        i === 0
                          ? "text-[#737373] w-[220px]"
                          : i === 1
                          ? "text-[#0A0A0A] dark:text-white"
                          : "text-[#737373]",
                      ].join(" ")}
                    >
                      {col}
                      {i === 1 && (
                        <span className="ml-2 text-[10px] font-bold text-emerald-500 border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 rounded-full tracking-normal normal-case">
                          This
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={[
                      "border-b border-[#E7E5E4] dark:border-[#27272A] last:border-0",
                      i % 2 === 0
                        ? "bg-white dark:bg-[#0B0B0C]"
                        : "bg-[#FAFAFA] dark:bg-[#0D0D0F]",
                    ].join(" ")}
                  >
                    <td className="px-4 py-3 text-[13px] font-medium text-[#0A0A0A] dark:text-[#E4E4E7]">
                      {row.feature}
                    </td>
                    <td className="px-4 py-3"><Cell val={row.lelu} /></td>
                    <td className="px-4 py-3"><Cell val={row.opa} /></td>
                    <td className="px-4 py-3"><Cell val={row.casbin} /></td>
                    <td className="px-4 py-3"><Cell val={row.avp} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* OPA */}
        <section>
          <h2 className="text-[22px] font-bold tracking-[-0.02em] text-[#0A0A0A] dark:text-white mb-3">
            Lelu vs. OPA
          </h2>
          <p className="text-[15px] text-[#737373] leading-[1.7] mb-4">
            Open Policy Agent is the gold standard for policy-as-code. Lelu uses the same Rego
            language for its policy engine — so you don't throw away existing knowledge. The
            difference is what Lelu adds on top: a structured agent decision API, confidence
            thresholds, a human review queue, and a hosted control plane. If you need raw policy
            evaluation embedded in your infra, OPA is the right tool. If you need a complete
            authorization <em>layer</em> for autonomous agents, Lelu is.
          </p>
          <div className="flex gap-3 p-4 rounded-md bg-[#F5F5F4] dark:bg-[#141416] border-l-[3px] border-[#0A0A0A] dark:border-white text-[13px] text-[#737373]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5 text-[#0A0A0A] dark:text-white"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Lelu can run alongside OPA. Point the Lelu engine at your existing OPA bundle server
            and reuse your policies without rewriting them.
          </div>
        </section>

        {/* Casbin */}
        <section>
          <h2 className="text-[22px] font-bold tracking-[-0.02em] text-[#0A0A0A] dark:text-white mb-3">
            Lelu vs. Casbin
          </h2>
          <p className="text-[15px] text-[#737373] leading-[1.7]">
            Casbin excels at RBAC and ABAC for traditional applications — it's fast, embeddable,
            and has SDKs in every language. It has no concept of an AI agent, confidence scores,
            or async human review. Lelu is the right choice when your subject is an autonomous
            process rather than a user session.
          </p>
        </section>

        {/* AWS AVP */}
        <section>
          <h2 className="text-[22px] font-bold tracking-[-0.02em] text-[#0A0A0A] dark:text-white mb-3">
            Lelu vs. AWS Verified Permissions
          </h2>
          <p className="text-[15px] text-[#737373] leading-[1.7]">
            AVP is a managed Cedar-based authorization service, useful when your stack is already
            deep in AWS. It covers the "is this allowed?" question but has no agent-specific
            primitives, no confidence gating, and no built-in human review queue. It also
            introduces AWS vendor lock-in and higher per-call latency over WANs. Lelu is
            cloud-agnostic and deploys to any environment.
          </p>
        </section>

        {/* Roll your own */}
        <section>
          <h2 className="text-[22px] font-bold tracking-[-0.02em] text-[#0A0A0A] dark:text-white mb-3">
            Lelu vs. rolling your own
          </h2>
          <p className="text-[15px] text-[#737373] leading-[1.7] mb-4">
            A custom middleware check works fine for simple boolean gates. It breaks down when
            you need:
          </p>
          <ul className="space-y-2 mb-4">
            {[
              "Confidence thresholds that vary per action type",
              "A review queue that pauses the agent and resumes it after approval",
              "A tamper-evident audit trail with structured event schema",
              "Policy versioning and rollback without a deploy",
              "Multi-agent delegation chains",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-[14px] text-[#737373]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5 text-emerald-500"><polyline points="20 6 9 17 4 12"/></svg>
                {item}
              </li>
            ))}
          </ul>
          <p className="text-[15px] text-[#737373] leading-[1.7]">
            Building these yourself takes weeks and becomes a liability to maintain. Lelu gives
            you all of it out of the box.
          </p>
        </section>

        {/* CTA */}
        <section className="flex gap-3 flex-wrap pt-2">
          <Link
            href="/docs/quickstart"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] rounded-md hover:opacity-80 transition-opacity"
          >
            Get started →
          </Link>
          <Link
            href="/docs/installation"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium border border-[#E7E5E4] dark:border-[#27272A] text-[#0A0A0A] dark:text-white rounded-md hover:bg-[#F5F5F4] dark:hover:bg-[#141416] transition-colors"
          >
            Installation
          </Link>
        </section>

      </div>
    </div>
  );
}
