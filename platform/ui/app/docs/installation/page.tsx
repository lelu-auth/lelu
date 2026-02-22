"use client";

import { useState } from "react";

export default function DocsInstallation() {
  const [sdkTab, setSdkTab] = useState<"ts" | "py">("ts");

  return (
    <>
      <h1>Installation</h1>
      <p className="lead">
        Get Prizm Engine running locally or connect to an existing deployment.
      </p>

      <h2>Prerequisites</h2>
      <ul>
        <li>Docker and Docker Compose (for local deployment)</li>
        <li>Node.js 18+ or Python 3.9+ (for SDKs)</li>
      </ul>

      <h2>1. Deploy the Engine</h2>
      <p>
        The fastest way to start is via Docker Compose. This spins up the core engine,
        platform API, UI, and Postgres database in one command.
      </p>
      <pre><code>{`git clone https://github.com/Abenezer0923/Prism.git
cd Prism

docker compose up -d --build`}</code></pre>
      <p>
        Once running, the services will be available at:
      </p>
      <ul>
        <li><strong>Engine API:</strong> <code>http://localhost:8082</code></li>
        <li><strong>Platform UI:</strong> <code>http://localhost:3000</code></li>
      </ul>

      <h2>2. Install the SDK</h2>
      <p>
        Install the SDK for your preferred language to interact with the engine from your application.
      </p>
      
      <div className="code-showcase" style={{ margin: "1.5rem 0" }}>
        <div className="code-tabs">
          <div 
            className={`code-tab ${sdkTab === "ts" ? "active" : ""}`}
            onClick={() => setSdkTab("ts")}
          >
            TypeScript
          </div>
          <div 
            className={`code-tab ${sdkTab === "py" ? "active" : ""}`}
            onClick={() => setSdkTab("py")}
          >
            Python
          </div>
        </div>
        <div className="code-block-wrapper">
          <div className="code-header">
            <span className="terminal-prompt">$</span> {sdkTab === "ts" ? "npm install prizm-engine" : "pip install prizm-engine"}
          </div>
        </div>
      </div>

      <h2>3. Environment Variables</h2>
      <p>
        Configure your application to point to the Prizm Engine endpoint.
      </p>
      <div className="table-wrap">
        <table className="docs-table">
          <thead>
            <tr>
              <th>Variable</th>
              <th>Description</th>
              <th>Default</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>PRIZM_ENGINE_ENDPOINT</code></td>
              <td>The URL of the Prizm Engine API.</td>
              <td><code>http://localhost:8082</code></td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Kubernetes (Helm)</h2>
      <p>
        For production deployments, we provide a Helm chart.
      </p>
      <pre><code>{`helm install prizm ./helm/prism -n prizm-system --create-namespace`}</code></pre>

      <h2>Next steps</h2>
      <p>
        Continue to the <a href="/docs/quickstart">Quick Start</a> to send your first
        authorization request.
      </p>
    </>
  );
}
