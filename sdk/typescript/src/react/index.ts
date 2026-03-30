"use client";

import { useEffect, useState } from "react";
import { LeluClient } from "../client";

export * from './LeluApprovalUI';
export * from './AgentReputationDashboard';

export interface UseAgentPermissionOptions {
  /** Base URL of the Lelu engine.  Defaults to http://localhost:8080 */
  baseUrl?: string;
  /** API key forwarded to the engine */
  apiKey?: string;
  /** Scope override passed in the request */
  scope?: string;
}

export interface AgentPermissionState {
  canExecute: boolean;
  loading: boolean;
  reason: string;
  decision: "allowed" | "denied" | "human_review" | "";
}

/**
 * React hook that checks whether an agent actor may perform an action.
 *
 * ```tsx
 * const { canExecute, loading, reason } = useAgentPermission(
 *   "agent-007", "files.read", 0.95,
 *   { baseUrl: "http://localhost:8080", apiKey: process.env.NEXT_PUBLIC_LELU_KEY }
 * );
 * ```
 */
export function useAgentPermission(
  actor: string,
  action: string,
  confidence = 1.0,
  opts: UseAgentPermissionOptions = {}
): AgentPermissionState {
  const [state, setState] = useState<AgentPermissionState>({
    canExecute: false,
    loading: true,
    reason: "",
    decision: "",
  });

  useEffect(() => {
    let cancelled = false;
    setState({ canExecute: false, loading: true, reason: "", decision: "" });

    const clientConfig: any = {
      baseUrl: opts.baseUrl ?? "http://localhost:8080",
    };
    if (opts.apiKey !== undefined) {
      clientConfig.apiKey = opts.apiKey;
    }
    const client = new LeluClient(clientConfig);

    client
      .agentAuthorize({ actor, action, context: { confidence, scope: opts.scope } })
      .then((res) => {
        if (cancelled) return;
        setState({
          canExecute: res.allowed,
          loading: false,
          reason: res.reason ?? (res.allowed ? "allowed" : "denied"),
          decision: res.allowed ? "allowed" : (res.requiresHumanReview ? "human_review" : "denied"),
        });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : String(err);
        setState({ canExecute: false, loading: false, reason: msg, decision: "denied" });
      });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actor, action, confidence, opts.baseUrl, opts.apiKey, opts.scope]);

  return state;
}
