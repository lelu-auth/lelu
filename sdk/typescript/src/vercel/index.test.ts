import { describe, it, expect, vi, beforeEach } from "vitest";
import { secureTool } from "./index.js";
import { LeluClient } from "../client.js";

// ─── Mock fetch globally ───────────────────────────────────────────────────────

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Mirrors the engine's POST /v1/agent/authorize response (agentAuthorizeResponse
// in engine/internal/server/server.go): boolean flags, no top-level `decision`.
function mockAuthorize(decision: "allow" | "deny" | "human_review", confidence = 0.95) {
    mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
            allowed: decision === "allow",
            requires_human_review: decision === "human_review",
            compute: false,
            reason: decision === "allow" ? "action authorized" : decision === "human_review" ? "requires human approval" : "hard deny",
            trace_id: "req-test",
            confidence_used: confidence,
        }),
    });
}

// ─── Fake Vercel tool ─────────────────────────────────────────────────────────

const fakeTool = {
    description: "Process a refund",
    parameters: {},
    execute: vi.fn(async (_args: unknown) => ({ success: true, refunded: "inv-001" })),
};

// ─────────────────────────────────────────────────────────────────────────────

describe("secureTool()", () => {
    let client: LeluClient;

    beforeEach(() => {
        vi.clearAllMocks();
        client = new LeluClient({ baseUrl: "http://localhost:8080" });
    });

    it("calls the original execute when allowed", async () => {
        mockAuthorize("allow", 0.95);

        const secured = secureTool({
            client,
            actor: "invoice_bot",
            action: "invoice:refund",
            confidence: 0.95,
            tool: fakeTool,
        });

        const result = await secured.execute!({ invoiceId: "inv-001" });
        expect(result).toEqual({ success: true, refunded: "inv-001" });
        expect(fakeTool.execute).toHaveBeenCalledWith({ invoiceId: "inv-001" }, undefined);
    });

    it("returns LeluDeniedResult when denied", async () => {
        mockAuthorize("deny", 0.40);

        const secured = secureTool({
            client,
            actor: "invoice_bot",
            action: "invoice:refund",
            confidence: 0.40,
            tool: fakeTool,
        });

        const result = (await secured.execute!({ invoiceId: "inv-002" })) as {
            allowed: false;
            reason: string;
        };
        expect(result.allowed).toBe(false);
        expect(result.reason).toContain("denied");
        expect(fakeTool.execute).not.toHaveBeenCalled();
    });

    it("returns LeluDeniedResult with requiresHumanReview when review needed", async () => {
        mockAuthorize("human_review", 0.80);

        const secured = secureTool({
            client,
            actor: "invoice_bot",
            action: "invoice:refund",
            confidence: 0.80,
            tool: fakeTool,
        });

        const result = (await secured.execute!({ invoiceId: "inv-003" })) as {
            allowed: false;
            requiresHumanReview: boolean;
        };
        expect(result.allowed).toBe(false);
        expect(result.requiresHumanReview).toBe(true);
        expect(fakeTool.execute).not.toHaveBeenCalled();
    });

    it("supports dynamic confidence function", async () => {
        mockAuthorize("allow", 0.95);

        const secured = secureTool({
            client,
            actor: "invoice_bot",
            action: "invoice:refund",
            confidence: (args: { amount: number }) => (args.amount > 100 ? 0.5 : 0.95),
            tool: fakeTool,
        });

        await secured.execute!({ amount: 50 });
        expect(fakeTool.execute).toHaveBeenCalled();
    });

    it("returns a structured error when fetch fails", async () => {
        mockFetch.mockRejectedValueOnce(new Error("connection refused"));

        const secured = secureTool({
            client,
            actor: "invoice_bot",
            action: "invoice:refund",
            confidence: 0.9,
            tool: fakeTool,
        });

        const result = (await secured.execute!({ invoiceId: "inv-005" })) as {
            allowed: false;
            reason: string;
        };
        expect(result.allowed).toBe(false);
        expect(result.reason).toContain("failed");
        expect(fakeTool.execute).not.toHaveBeenCalled();
    });

    it("preserves tool description and parameters", () => {
        const secured = secureTool({
            client,
            actor: "invoice_bot",
            action: "invoice:refund",
            tool: fakeTool,
        });
        expect(secured.description).toBe(fakeTool.description);
        expect(secured.parameters).toBe(fakeTool.parameters);
    });
});
