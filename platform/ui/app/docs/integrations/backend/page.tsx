export default function DocsIntegrationsBackend() {
  return (
    <div className="max-w-3xl">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 text-sm font-medium mb-6">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          Integrations
        </div>
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4 tracking-tight">Backend Integration</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Integrate Prism into any backend service. The Engine exposes a standard REST API, so it works with any language or framework. This guide covers Express, FastAPI, and raw Go.
        </p>
      </div>

      <div className="space-y-12">

        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-2">Express (Node.js)</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">Use the TypeScript SDK as Express middleware to gate every route that performs a sensitive AI action.</p>

          <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden mb-4">
            <div className="px-4 py-2 border-b border-zinc-800 dark:border-white/10 bg-zinc-950 dark:bg-white/5 flex items-center gap-2">
              <span className="text-xs text-zinc-500 font-mono">npm</span>
            </div>
            <pre className="p-4 font-mono text-sm text-zinc-300">{`npm install lelu`}</pre>
          </div>

          <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden">
            <div className="px-4 py-2 border-b border-zinc-800 dark:border-white/10 bg-zinc-950 dark:bg-white/5">
              <span className="text-xs text-zinc-500 font-mono">middleware/prism.ts</span>
            </div>
            <pre className="p-4 font-mono text-sm text-zinc-300 overflow-x-auto">{`import { PrismClient } from "lelu";
import type { Request, Response, NextFunction } from "express";

const prism = new PrismClient({
  baseUrl: process.env.PRISM_URL!,
  apiKey: process.env.PRISM_API_KEY!,
});

export function prismGate(action: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const decision = await prism.authorize({
      action,
      confidence: req.body.confidence ?? 1.0,
    });

    if (decision.requiresHumanReview) {
      await decision.wait(); // long-poll for approval
    }

    if (!decision.allowed) {
      return res.status(403).json({ error: "Action not authorized by Prism" });
    }

    next();
  };
}

// Usage:
// app.post("/refund", prismGate("issue_refund"), refundHandler);`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-2">FastAPI (Python)</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">Use the Python SDK as a FastAPI dependency to authorize AI-driven actions.</p>

          <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden mb-4">
            <div className="px-4 py-2 border-b border-zinc-800 dark:border-white/10 bg-zinc-950 dark:bg-white/5">
              <span className="text-xs text-zinc-500 font-mono">pip</span>
            </div>
            <pre className="p-4 font-mono text-sm text-zinc-300">{`pip install auth-pe`}</pre>
          </div>

          <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden">
            <div className="px-4 py-2 border-b border-zinc-800 dark:border-white/10 bg-zinc-950 dark:bg-white/5">
              <span className="text-xs text-zinc-500 font-mono">dependencies/prism.py</span>
            </div>
            <pre className="p-4 font-mono text-sm text-zinc-300 overflow-x-auto">{`from fastapi import HTTPException, Depends
from auth_pe import PrismClient
import os

prism = PrismClient(
    base_url=os.environ["PRISM_URL"],
    api_key=os.environ["PRISM_API_KEY"],
)

def require_prism(action: str):
    async def dependency(confidence: float = 1.0):
        decision = prism.authorize(action=action, confidence=confidence)
        if decision.requires_human_review:
            decision.wait()
        if not decision.allowed:
            raise HTTPException(status_code=403, detail="Action denied by Prism")
    return Depends(dependency)

# Usage:
# @app.post("/delete-user")
# async def delete_user(_=require_prism("delete_user")):
#     ...`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-2">Go (Raw HTTP)</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">Call the Engine REST API directly from any Go service with a simple helper function.</p>

          <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden">
            <div className="px-4 py-2 border-b border-zinc-800 dark:border-white/10 bg-zinc-950 dark:bg-white/5">
              <span className="text-xs text-zinc-500 font-mono">prism/client.go</span>
            </div>
            <pre className="p-4 font-mono text-sm text-zinc-300 overflow-x-auto">{`package prism

import (
    "bytes"
    "encoding/json"
    "fmt"
    "net/http"
)

type AuthRequest struct {
    Action     string  \`json:"action"\`
    Confidence float64 \`json:"confidence"\`
}

type AuthResponse struct {
    Status    string \`json:"status"\`
    RequestID string \`json:"request_id"\`
}

func Authorize(action string, confidence float64) (*AuthResponse, error) {
    body, _ := json.Marshal(AuthRequest{Action: action, Confidence: confidence})
    req, _ := http.NewRequest("POST", engineURL+"/api/v1/authorize", bytes.NewBuffer(body))
    req.Header.Set("Authorization", "Bearer "+apiKey)
    req.Header.Set("Content-Type", "application/json")

    resp, err := http.DefaultClient.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    var result AuthResponse
    json.NewDecoder(resp.Body).Decode(&result)
    return &result, nil
}`}</pre>
          </div>
        </section>

      </div>

      <div className="flex justify-between items-center pt-12 mt-12 border-t border-zinc-200 dark:border-white/10">
        <a href="/docs/concepts/cli" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Previous: CLI &amp; MCP
        </a>
        <a href="/docs/integrations/nextjs" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          Next: Next.js
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
      </div>
    </div>
  );
}
