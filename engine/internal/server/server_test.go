package server_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/prism/engine/internal/audit"
	"github.com/prism/engine/internal/confidence"
	"github.com/prism/engine/internal/evaluator"
	"github.com/prism/engine/internal/server"
	"github.com/prism/engine/internal/tokens"
)

var samplePolicy = []byte(`
version: "1.0"
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
`)

func newTestServer(t *testing.T) *httptest.Server {
	t.Helper()
	eval := evaluator.New()
	require.NoError(t, eval.LoadPolicyBytes(samplePolicy))

	h := server.New(
		eval,
		tokens.New(tokens.Config{SigningKey: "test-key"}),
		confidence.New(),
		audit.New(audit.Config{Sink: &bytes.Buffer{}}),
	)

	mux := http.NewServeMux()
	h.RegisterRoutes(mux)
	return httptest.NewServer(mux)
}

func postJSON(t *testing.T, srv *httptest.Server, path string, body any) *http.Response {
	t.Helper()
	b, _ := json.Marshal(body)
	resp, err := http.Post(srv.URL+path, "application/json", bytes.NewReader(b))
	require.NoError(t, err)
	return resp
}

// ── /healthz ──────────────────────────────────────────────────────────────────

func TestHealth(t *testing.T) {
	srv := newTestServer(t)
	defer srv.Close()

	resp, err := http.Get(srv.URL + "/healthz")
	require.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)
}

// ── /v1/authorize ─────────────────────────────────────────────────────────────

func TestAuthorize_Allowed(t *testing.T) {
	srv := newTestServer(t)
	defer srv.Close()

	resp := postJSON(t, srv, "/v1/authorize", map[string]any{
		"user_id": "user_123",
		"action":  "approve_refunds",
	})
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	var body map[string]any
	require.NoError(t, json.NewDecoder(resp.Body).Decode(&body))
	assert.True(t, body["allowed"].(bool))
}

func TestAuthorize_Denied(t *testing.T) {
	srv := newTestServer(t)
	defer srv.Close()

	resp := postJSON(t, srv, "/v1/authorize", map[string]any{
		"user_id": "user_123",
		"action":  "delete_invoices",
	})
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	var body map[string]any
	require.NoError(t, json.NewDecoder(resp.Body).Decode(&body))
	assert.False(t, body["allowed"].(bool))
}

// ── /v1/agent/authorize ───────────────────────────────────────────────────────

func TestAgentAuthorize_FullConfidence(t *testing.T) {
	srv := newTestServer(t)
	defer srv.Close()

	resp := postJSON(t, srv, "/v1/agent/authorize", map[string]any{
		"actor":      "invoice_bot",
		"action":     "approve_refunds",
		"confidence": 0.95,
		"acting_for": "user_123",
	})
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	var body map[string]any
	require.NoError(t, json.NewDecoder(resp.Body).Decode(&body))
	assert.True(t, body["allowed"].(bool))
	assert.False(t, body["requires_human_review"].(bool))
}

func TestAgentAuthorize_HardDeny(t *testing.T) {
	srv := newTestServer(t)
	defer srv.Close()

	resp := postJSON(t, srv, "/v1/agent/authorize", map[string]any{
		"actor":      "invoice_bot",
		"action":     "approve_refunds",
		"confidence": 0.30,
	})
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	var body map[string]any
	require.NoError(t, json.NewDecoder(resp.Body).Decode(&body))
	assert.False(t, body["allowed"].(bool))
}

// ── /v1/tokens/mint ───────────────────────────────────────────────────────────

func TestMintToken(t *testing.T) {
	srv := newTestServer(t)
	defer srv.Close()

	resp := postJSON(t, srv, "/v1/tokens/mint", map[string]any{
		"scope":       "invoice_bot",
		"acting_for":  "user_123",
		"ttl_seconds": 30,
	})
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	var body map[string]any
	require.NoError(t, json.NewDecoder(resp.Body).Decode(&body))
	assert.NotEmpty(t, body["token"])
	assert.NotEmpty(t, body["token_id"])
}
