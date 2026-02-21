import { describe, it, expect, vi, beforeEach } from "vitest";
import { PrismClient, AuthEngineError } from "../src/index.js";

// ── Mock fetch globally ────────────────────────────────────────────────────────

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function mockOK(body: unknown) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => body,
  });
}

function mockError(status: number, errorMsg: string) {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status,
    json: async () => ({ error: errorMsg }),
  });
}

// ─────────────────────────────────────────────────────────────────────────────

describe("PrismClient", () => {
  let client: PrismClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new PrismClient({ baseUrl: "http://localhost:8080" });
  });

  // ── authorize ──────────────────────────────────────────────────────────────

  describe("authorize()", () => {
    it("returns allowed decision", async () => {
      mockOK({ allowed: true, reason: "action allowed by role", trace_id: "t1" });
      const dec = await client.authorize({ userId: "u1", action: "approve_refunds" });
      expect(dec.allowed).toBe(true);
      expect(dec.traceId).toBe("t1");
    });

    it("returns denied decision", async () => {
      mockOK({ allowed: false, reason: "denied", trace_id: "t2" });
      const dec = await client.authorize({ userId: "u1", action: "delete_invoices" });
      expect(dec.allowed).toBe(false);
    });

    it("throws AuthEngineError on HTTP error", async () => {
      mockError(500, "internal error");
      await expect(
        client.authorize({ userId: "u1", action: "approve_refunds" })
      ).rejects.toBeInstanceOf(AuthEngineError);
    });

    it("throws Zod validation error on missing userId", async () => {
      await expect(
        // @ts-expect-error – intentional bad input
        client.authorize({ action: "approve_refunds" })
      ).rejects.toThrow();
    });
  });

  // ── agentAuthorize ────────────────────────────────────────────────────────

  describe("agentAuthorize()", () => {
    it("returns allowed with full confidence", async () => {
      mockOK({
        allowed: true,
        reason: "action authorized",
        trace_id: "t3",
        requires_human_review: false,
        confidence_used: 0.95,
      });
      const dec = await client.agentAuthorize({
        actor: "invoice_bot",
        action: "approve_refunds",
        context: { confidence: 0.95, actingFor: "user_123" },
      });
      expect(dec.allowed).toBe(true);
      expect(dec.requiresHumanReview).toBe(false);
      expect(dec.confidenceUsed).toBe(0.95);
    });

    it("returns requires_human_review at 0.80 confidence", async () => {
      mockOK({
        allowed: false,
        reason: "requires human approval",
        trace_id: "t4",
        requires_human_review: true,
        confidence_used: 0.80,
      });
      const dec = await client.agentAuthorize({
        actor: "invoice_bot",
        action: "approve_refunds",
        context: { confidence: 0.80 },
      });
      expect(dec.requiresHumanReview).toBe(true);
    });

    it("returns downgraded scope at low confidence", async () => {
      mockOK({
        allowed: false,
        reason: "downgraded",
        trace_id: "t5",
        downgraded_scope: "read_only",
        requires_human_review: false,
        confidence_used: 0.65,
      });
      const dec = await client.agentAuthorize({
        actor: "invoice_bot",
        action: "approve_refunds",
        context: { confidence: 0.65 },
      });
      expect(dec.downgradedScope).toBe("read_only");
    });

    it("validates confidence is between 0 and 1", async () => {
      await expect(
        client.agentAuthorize({
          actor: "bot",
          action: "act",
          context: { confidence: 1.5 },
        })
      ).rejects.toThrow();
    });
  });

  // ── mintToken ─────────────────────────────────────────────────────────────

  describe("mintToken()", () => {
    it("returns minted token", async () => {
      const expiresAt = Math.floor(Date.now() / 1000) + 60;
      mockOK({ token: "jwt.token.here", token_id: "tid1", expires_at: expiresAt });

      const result = await client.mintToken({ scope: "invoice_bot", actingFor: "user_123" });
      expect(result.token).toBe("jwt.token.here");
      expect(result.tokenId).toBe("tid1");
      expect(result.expiresAt).toBeInstanceOf(Date);
    });
  });

  // ── revokeToken ───────────────────────────────────────────────────────────

  describe("revokeToken()", () => {
    it("returns success on revoke", async () => {
      mockOK({ success: true });
      const result = await client.revokeToken("tid1");
      expect(result.success).toBe(true);
    });
  });

  // ── isHealthy ─────────────────────────────────────────────────────────────

  describe("isHealthy()", () => {
    it("returns true on ok status", async () => {
      mockOK({ status: "ok", service: "prism-engine" });
      expect(await client.isHealthy()).toBe(true);
    });

    it("returns false when fetch throws", async () => {
      mockFetch.mockRejectedValueOnce(new Error("connection refused"));
      expect(await client.isHealthy()).toBe(false);
    });
  });
});
