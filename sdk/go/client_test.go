package lelu

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func TestAuthorize(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost || r.URL.Path != "/v1/authorize" {
			t.Fatalf("unexpected route: %s %s", r.Method, r.URL.Path)
		}
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]any{
			"allowed":  true,
			"reason":   "ok",
			"trace_id": "trace-123",
		})
	}))
	defer ts.Close()

	c := NewClient(ClientConfig{BaseURL: ts.URL})
	res, err := c.Authorize(context.Background(), AuthRequest{UserID: "u1", Action: "view"})
	if err != nil {
		t.Fatalf("authorize failed: %v", err)
	}
	if !res.Allowed || res.TraceID != "trace-123" {
		t.Fatalf("unexpected response: %#v", res)
	}
}

func TestAgentAuthorize(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost || r.URL.Path != "/v1/agent/authorize" {
			t.Fatalf("unexpected route: %s %s", r.Method, r.URL.Path)
		}
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]any{
			"allowed":               true,
			"reason":                "allowed",
			"trace_id":              "trace-456",
			"requires_human_review": false,
			"confidence_used":       0.95,
		})
	}))
	defer ts.Close()

	c := NewClient(ClientConfig{BaseURL: ts.URL})
	res, err := c.AgentAuthorize(context.Background(), AgentAuthRequest{
		Actor:      "invoice_bot",
		Action:     "approve_refunds",
		Confidence: 0.95,
	})
	if err != nil {
		t.Fatalf("agent authorize failed: %v", err)
	}
	if !res.Allowed || res.ConfidenceUsed != 0.95 {
		t.Fatalf("unexpected response: %#v", res)
	}
}

func TestMintAndRevokeToken(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.Method == http.MethodPost && r.URL.Path == "/v1/tokens/mint":
			w.Header().Set("Content-Type", "application/json")
			_ = json.NewEncoder(w).Encode(map[string]any{
				"token":      "jwt-token",
				"token_id":   "tid-1",
				"expires_at": 1700000000,
			})
		case r.Method == http.MethodDelete && r.URL.Path == "/v1/tokens/tid-1":
			w.Header().Set("Content-Type", "application/json")
			_ = json.NewEncoder(w).Encode(map[string]any{"success": true})
		default:
			t.Fatalf("unexpected route: %s %s", r.Method, r.URL.Path)
		}
	}))
	defer ts.Close()

	c := NewClient(ClientConfig{BaseURL: ts.URL})
	minted, err := c.MintToken(context.Background(), MintTokenRequest{Scope: "invoice_bot"})
	if err != nil {
		t.Fatalf("mint failed: %v", err)
	}
	if minted.TokenID != "tid-1" {
		t.Fatalf("unexpected token id: %s", minted.TokenID)
	}
	if minted.ExpiresAt.Unix() != 1700000000 {
		t.Fatalf("unexpected expires at: %v", minted.ExpiresAt)
	}

	revoked, err := c.RevokeToken(context.Background(), minted.TokenID)
	if err != nil {
		t.Fatalf("revoke failed: %v", err)
	}
	if !revoked.Success {
		t.Fatalf("expected success=true")
	}
}

func TestIsHealthy(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet || r.URL.Path != "/healthz" {
			t.Fatalf("unexpected route: %s %s", r.Method, r.URL.Path)
		}
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]any{"status": "ok"})
	}))
	defer ts.Close()

	c := NewClient(ClientConfig{BaseURL: ts.URL, Timeout: 2 * time.Second})
	if !c.IsHealthy(context.Background()) {
		t.Fatalf("expected healthy=true")
	}
}

func TestDelegateScope(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost || r.URL.Path != "/v1/agent/delegate" {
			t.Fatalf("unexpected route: %s %s", r.Method, r.URL.Path)
		}
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]any{
			"token":          "child.jwt.token",
			"token_id":       "dtid-1",
			"expires_at":     1700000120,
			"delegator":      "orchestrator",
			"delegatee":      "research_bot",
			"granted_scopes": []string{"research"},
			"trace_id":       "td-1",
		})
	}))
	defer ts.Close()

	c := NewClient(ClientConfig{BaseURL: ts.URL})
	res, err := c.DelegateScope(context.Background(), DelegateScopeRequest{
		Delegator:  "orchestrator",
		Delegatee:  "research_bot",
		ScopedTo:   []string{"research"},
		Confidence: 0.92,
	})
	if err != nil {
		t.Fatalf("delegate failed: %v", err)
	}
	if res.Token != "child.jwt.token" {
		t.Fatalf("unexpected token: %s", res.Token)
	}
	if res.TokenID != "dtid-1" {
		t.Fatalf("unexpected token_id: %s", res.TokenID)
	}
	if res.TraceID != "td-1" {
		t.Fatalf("unexpected trace_id: %s", res.TraceID)
	}
	if len(res.GrantedScopes) != 1 || res.GrantedScopes[0] != "research" {
		t.Fatalf("unexpected granted_scopes: %v", res.GrantedScopes)
	}
	if res.ExpiresAt.Unix() != 1700000120 {
		t.Fatalf("unexpected expires_at: %v", res.ExpiresAt)
	}
}

func TestDelegateScope_Validation(t *testing.T) {
	c := NewClient(ClientConfig{BaseURL: "http://localhost"})
	_, err := c.DelegateScope(context.Background(), DelegateScopeRequest{
		Delegatee: "bot",
	})
	if err == nil || err.Error() != "delegator is required" {
		t.Fatalf("expected delegator required error, got: %v", err)
	}

	_, err = c.DelegateScope(context.Background(), DelegateScopeRequest{
		Delegator:  "orch",
		Delegatee:  "bot",
		Confidence: 1.5,
	})
	if err == nil || err.Error() != "confidence must be between 0 and 1" {
		t.Fatalf("expected confidence validation error, got: %v", err)
	}
}

func TestEngineError(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusUnauthorized)
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]any{"error": "unauthorized"})
	}))
	defer ts.Close()

	c := NewClient(ClientConfig{BaseURL: ts.URL})
	_, err := c.Authorize(context.Background(), AuthRequest{UserID: "u1", Action: "view"})
	if err == nil {
		t.Fatalf("expected an error")
	}
	engErr, ok := err.(*EngineError)
	if !ok {
		t.Fatalf("expected *EngineError, got %T", err)
	}
	if engErr.Status != http.StatusUnauthorized {
		t.Fatalf("unexpected status: %d", engErr.Status)
	}
}
