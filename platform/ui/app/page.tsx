"use client";

import Link from "next/link";
import { useState } from "react";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<"ts" | "py">("ts");

  return (
    <div className="landing-page">
      <section className="hero">
        <div className="hero-badge">
          <span className="badge-pulse"></span>
          v0.1.0 is now available
        </div>
        <h1 className="hero-title">
          The most comprehensive <br />
          <span className="text-gradient">Authorization Engine</span> for AI Agents
        </h1>
        <p className="hero-subtitle">
          Prizm Engine provides confidence-aware access control, human-in-the-loop approvals, and SOC 2-ready audit trails for your autonomous agents.
        </p>
        <div className="hero-actions">
          <Link href="/audit" className="btn btn-primary btn-lg">
            View Audit Log
          </Link>
          <a href="https://github.com/Abenezer0923/Prism#readme" target="_blank" rel="noreferrer" className="btn btn-secondary btn-lg">
            Documentation
          </a>
          <a href="https://github.com/Abenezer0923/Prism" target="_blank" rel="noreferrer" className="btn btn-secondary btn-lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}>
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
            </svg>
            GitHub
          </a>
        </div>
      </section>

      <section className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <h3>Confidence-Aware</h3>
          <p>Dynamically adjust permissions based on the AI agent's confidence level. Require human approval for low-confidence actions.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <h3>Human-in-the-loop</h3>
          <p>Seamlessly route sensitive or low-confidence requests to a human approval queue before execution.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="9" y1="21" x2="9" y2="9"></line>
            </svg>
          </div>
          <h3>SOC 2 Audit Trail</h3>
          <p>Immutable, cryptographically verifiable logs of every decision made by the engine, ready for compliance.</p>
        </div>
      </section>

      <section className="installation-section">
        <div className="section-header">
          <h2>Quick Start</h2>
          <p>Install the SDK for your preferred language.</p>
        </div>
        
        <div className="code-showcase">
          <div className="code-tabs">
            <div 
              className={`code-tab ${activeTab === "ts" ? "active" : ""}`}
              onClick={() => setActiveTab("ts")}
            >
              TypeScript
            </div>
            <div 
              className={`code-tab ${activeTab === "py" ? "active" : ""}`}
              onClick={() => setActiveTab("py")}
            >
              Python
            </div>
          </div>
          <div className="code-block-wrapper">
            <div className="code-header">
              <span className="terminal-prompt">$</span> {activeTab === "ts" ? "npm install prizm-engine" : "pip install prizm-engine"}
            </div>
            <pre className="code-block">
              <code>
{activeTab === "ts" ? `import { PrismClient } from "prizm-engine";

const client = new PrismClient({
  endpoint: "http://localhost:8080",
});

const decision = await client.authorizeAgent({
  actor: "agent-123",
  action: "s3:DeleteObject",
  resource: { bucket: "prod-data" },
  confidence: 0.85,
});

if (decision.allowed) {
  console.log("Action approved!");
} else if (decision.requires_human_review) {
  console.log("Sent to human approval queue.");
}` : `from prizm_engine import PrismClient

client = PrismClient(endpoint="http://localhost:8080")

decision = client.authorize_agent(
    actor="agent-123",
    action="s3:DeleteObject",
    resource={"bucket": "prod-data"},
    confidence=0.85
)

if decision.allowed:
    print("Action approved!")
elif decision.requires_human_review:
    print("Sent to human approval queue.")`}
              </code>
            </pre>
          </div>
        </div>
      </section>

      <section className="ecosystem-section">
        <div className="section-header">
          <h2>Ecosystem</h2>
          <p>Integrates seamlessly with your favorite tools.</p>
        </div>
        <div className="ecosystem-grid">
          <div className="ecosystem-card">
            <h3>LangChain</h3>
            <p>Use our pre-built LangChain tools to secure your agents.</p>
          </div>
          <div className="ecosystem-card">
            <h3>AutoGPT</h3>
            <p>Drop-in plugin for AutoGPT to add confidence-aware auth.</p>
          </div>
          <div className="ecosystem-card">
            <h3>VS Code</h3>
            <p>Manage policies and approve requests directly from your editor.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
