"use client";

import { useState } from "react";

type Step = "draft" | "simulate" | "review" | "apply";

interface SimulatorItem {
  id: string;
  kind: string;
  changed: boolean;
  before: { outcome: string; reason: string };
  after: { outcome: string; reason: string };
}

interface SimulatorResult {
  summary: {
    total: number;
    changed: number;
    unchanged: number;
    allow_to_deny: number;
    allow_to_review: number;
    deny_to_allow: number;
    review_to_allow: number;
    review_to_deny: number;
    deny_to_review: number;
  };
  items: SimulatorItem[];
}

const SAMPLE_TRACES = `[
  { "id": "h-1", "kind": "human", "user_id": "user_123", "action": "approve_refunds" },
  { "id": "h-2", "kind": "human", "user_id": "user_123", "action": "delete_invoices" },
  {
    "id": "a-1", "kind": "agent", "actor": "invoice_bot", "action": "approve_refunds",
    "confidence_signal": { "provider": "openai", "token_logprobs": [-0.04, -0.05, -0.03] }
  }
]`;

const steps: { key: Step; label: string; num: number }[] = [
  { key: "draft", label: "Draft Policy", num: 1 },
  { key: "simulate", label: "Simulate", num: 2 },
  { key: "review", label: "Blast Radius", num: 3 },
  { key: "apply", label: "Apply", num: 4 },
];

export default function PolicySafetyPage() {
  const [currentStep, setCurrentStep] = useState<Step>("draft");
  const [policyYaml, setPolicyYaml] = useState<string>(`version: "1.0"
roles:
  finance_manager:
    allow: [view_invoices, approve_refunds]
    deny:  [delete_invoices]
agent_scopes:
  invoice_bot:
    inherits: finance_manager
    constraints:
      - require_human_approval_if_confidence_below: 0.90
      - downgrade_to_read_only_if_confidence_below: 0.70
      - hard_deny_if_confidence_below: 0.50
    deny: [delete_invoices]
`);
  const [tracesJson, setTracesJson] = useState<string>(SAMPLE_TRACES);
  const [result, setResult] = useState<SimulatorResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);

  async function runSimulation() {
    setLoading(true);
    setError(null);
    try {
      let traces;
      try {
        traces = JSON.parse(tracesJson);
      } catch {
        throw new Error("Invalid JSON in traces field");
      }
      const res = await fetch("/api/simulator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposed_policy_yaml: policyYaml,
          traces,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Simulation failed (${res.status})`);
      }
      const data: SimulatorResult = await res.json();
      setResult(data);
      setCurrentStep("review");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleApply() {
    setApplied(true);
    setCurrentStep("apply");
  }

  const stepIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2 tracking-tight">
          Policy Safety Flow
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Draft a policy change, simulate it against historical traces, review
          the blast radius, then apply with confidence.
        </p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2 mb-10">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            <button
              onClick={() => {
                if (i <= stepIndex) setCurrentStep(s.key);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                s.key === currentStep
                  ? "bg-zinc-900 dark:bg-white text-white dark:text-black"
                  : i < stepIndex
                  ? "bg-green-100 dark:bg-green-400/10 text-green-700 dark:text-green-400"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-500"
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  i < stepIndex
                    ? "bg-green-500 text-white"
                    : s.key === currentStep
                    ? "bg-white dark:bg-black text-zinc-900 dark:text-white"
                    : "bg-zinc-300 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400"
                }`}
              >
                {i < stepIndex ? "✓" : s.num}
              </span>
              {s.label}
            </button>
            {i < steps.length - 1 && (
              <div className="w-8 h-px bg-zinc-300 dark:bg-zinc-700" />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Draft */}
      {currentStep === "draft" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Proposed Policy YAML
              </span>
            </div>
            <textarea
              value={policyYaml}
              onChange={(e) => setPolicyYaml(e.target.value)}
              className="w-full h-64 p-4 font-mono text-sm bg-white dark:bg-black text-zinc-800 dark:text-zinc-200 resize-y focus:outline-none"
              spellCheck={false}
            />
          </div>

          <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Historical Traces (JSON)
              </span>
            </div>
            <textarea
              value={tracesJson}
              onChange={(e) => setTracesJson(e.target.value)}
              className="w-full h-48 p-4 font-mono text-sm bg-white dark:bg-black text-zinc-800 dark:text-zinc-200 resize-y focus:outline-none"
              spellCheck={false}
            />
          </div>

          <button
            onClick={() => setCurrentStep("simulate")}
            className="px-6 py-3 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-black font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all"
          >
            Next: Run Simulation →
          </button>
        </div>
      )}

      {/* Step 2: Simulate */}
      {currentStep === "simulate" && (
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">
              Ready to Simulate
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-400 mb-1">
              The proposed policy will be replayed against{" "}
              <strong>
                {(() => {
                  try {
                    return JSON.parse(tracesJson).length;
                  } catch {
                    return "?";
                  }
                })()}
              </strong>{" "}
              historical traces to compute decision deltas.
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-500">
              No changes will be applied — this is a dry run.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 rounded-xl p-4 text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setCurrentStep("draft")}
              className="px-4 py-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
            >
              ← Back
            </button>
            <button
              onClick={runSimulation}
              disabled={loading}
              className="px-6 py-2.5 rounded-lg bg-blue-600 dark:bg-blue-500 text-white font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" opacity="0.25" />
                    <path d="M4 12a8 8 0 018-8" opacity="0.75" />
                  </svg>
                  Running…
                </>
              ) : (
                "Run Simulation"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Blast Radius Review */}
      {currentStep === "review" && result && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SummaryCard label="Total Traces" value={result.summary.total} />
            <SummaryCard
              label="Changed"
              value={result.summary.changed}
              color={result.summary.changed > 0 ? "amber" : "green"}
            />
            <SummaryCard
              label="Allow → Deny"
              value={result.summary.allow_to_deny}
              color={result.summary.allow_to_deny > 0 ? "red" : "green"}
            />
            <SummaryCard
              label="Allow → Review"
              value={result.summary.allow_to_review}
              color={result.summary.allow_to_review > 0 ? "amber" : "green"}
            />
          </div>

          {/* Blast Radius Indicator */}
          <div
            className={`rounded-2xl p-6 border ${
              result.summary.changed === 0
                ? "bg-green-50 dark:bg-green-500/5 border-green-200 dark:border-green-500/20"
                : result.summary.allow_to_deny > 0
                ? "bg-red-50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20"
                : "bg-amber-50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20"
            }`}
          >
            <h3
              className={`text-lg font-semibold mb-1 ${
                result.summary.changed === 0
                  ? "text-green-800 dark:text-green-300"
                  : result.summary.allow_to_deny > 0
                  ? "text-red-800 dark:text-red-300"
                  : "text-amber-800 dark:text-amber-300"
              }`}
            >
              {result.summary.changed === 0
                ? "No Impact — Safe to Apply"
                : result.summary.allow_to_deny > 0
                ? `Breaking Change — ${result.summary.allow_to_deny} action(s) would be newly denied`
                : `Moderate Impact — ${result.summary.changed} decision(s) changed`}
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {result.summary.unchanged} of {result.summary.total} traces
              unchanged.
            </p>
          </div>

          {/* Per-trace Delta Table */}
          {result.items.filter((i) => i.changed).length > 0 && (
            <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Changed Decisions
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-zinc-500 dark:text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                      <th className="px-4 py-2 font-medium">Trace</th>
                      <th className="px-4 py-2 font-medium">Kind</th>
                      <th className="px-4 py-2 font-medium">Before</th>
                      <th className="px-4 py-2 font-medium">After</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.items
                      .filter((i) => i.changed)
                      .map((item) => (
                        <tr
                          key={item.id}
                          className="border-b border-zinc-100 dark:border-zinc-800/50"
                        >
                          <td className="px-4 py-2 font-mono text-xs">
                            {item.id}
                          </td>
                          <td className="px-4 py-2">{item.kind}</td>
                          <td className="px-4 py-2">
                            <OutcomeBadge outcome={item.before.outcome} />
                          </td>
                          <td className="px-4 py-2">
                            <OutcomeBadge outcome={item.after.outcome} />
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setCurrentStep("draft")}
              className="px-4 py-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
            >
              ← Edit Policy
            </button>
            <button
              onClick={handleApply}
              className="px-6 py-2.5 rounded-lg bg-green-600 dark:bg-green-500 text-white font-medium hover:bg-green-700 dark:hover:bg-green-600 transition-all"
            >
              Apply Policy →
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Apply */}
      {currentStep === "apply" && (
        <div className="space-y-6">
          <div className="bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-500/10 flex items-center justify-center text-3xl">
              ✓
            </div>
            <h3 className="text-xl font-semibold text-green-800 dark:text-green-300 mb-2">
              {applied ? "Policy Applied Successfully" : "Ready to Apply"}
            </h3>
            <p className="text-sm text-green-700 dark:text-green-400 max-w-md mx-auto">
              {applied
                ? "The policy has been deployed. Connected engine instances will pick it up on their next sync cycle."
                : "Push the proposed policy to the control plane. Engine sidecars will sync automatically."}
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <a
              href="/policies"
              className="px-6 py-2.5 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-black font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all"
            >
              View Policies
            </a>
            <button
              onClick={() => {
                setCurrentStep("draft");
                setResult(null);
                setApplied(false);
                setError(null);
              }}
              className="px-6 py-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
            >
              Start New Change
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  color = "zinc",
}: {
  label: string;
  value: number;
  color?: "green" | "red" | "amber" | "zinc";
}) {
  const colors = {
    green: "text-green-700 dark:text-green-400",
    red: "text-red-700 dark:text-red-400",
    amber: "text-amber-700 dark:text-amber-400",
    zinc: "text-zinc-900 dark:text-white",
  };
  return (
    <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
      <div className="text-xs text-zinc-500 dark:text-zinc-500 mb-1">
        {label}
      </div>
      <div className={`text-2xl font-bold ${colors[color]}`}>{value}</div>
    </div>
  );
}

function OutcomeBadge({ outcome }: { outcome: string }) {
  const styles: Record<string, string> = {
    allow:
      "bg-green-100 dark:bg-green-400/10 text-green-700 dark:text-green-400",
    deny: "bg-red-100 dark:bg-red-400/10 text-red-700 dark:text-red-400",
    review:
      "bg-amber-100 dark:bg-amber-400/10 text-amber-700 dark:text-amber-400",
  };
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
        styles[outcome] ?? "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
      }`}
    >
      {outcome}
    </span>
  );
}
