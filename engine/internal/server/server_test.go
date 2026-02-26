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
	return newTestServerWithMode(t, server.EnforcementModeEnforce)
}

func newTestServerWithMode(t *testing.T, mode server.EnforcementMode) *httptest.Server {
	t.Helper()
	eval := evaluator.New()
	require.NoError(t, eval.LoadPolicyBytes(samplePolicy))

	h := server.New(
		eval,
		tokens.New(tokens.Config{SigningKey: "test-key"}),
		confidence.New(),
		audit.New(audit.Config{Sink: &bytes.Buffer{}}),
		nil, // queue — not needed in unit tests
		"",
		server.ConfidenceConfig{},
		mode,
		nil,
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
		"actor":  "invoice_bot",
		"action": "approve_refunds",
		"confidence_signal": map[string]any{
			"provider":       "openai",
			"token_logprobs": []float64{-0.04, -0.05, -0.03},
		},
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
		"actor":  "invoice_bot",
		"action": "approve_refunds",
		"confidence_signal": map[string]any{
			"provider":       "openai",
			"token_logprobs": []float64{-2.0, -1.8, -1.9},
		},
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

func TestAuthorize_ShadowMode_AllowsButShowsWouldHaveDenied(t *testing.T) {
	srv := newTestServerWithMode(t, server.EnforcementModeShadow)
	defer srv.Close()

	resp := postJSON(t, srv, "/v1/authorize", map[string]any{
		"user_id": "user_123",
		"action":  "delete_invoices",
	})
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	var body map[string]any
	require.NoError(t, json.NewDecoder(resp.Body).Decode(&body))
	assert.True(t, body["allowed"].(bool))
	assert.True(t, body["shadow_mode"].(bool))
	assert.False(t, body["would_have_allowed"].(bool))
	assert.NotEmpty(t, body["would_have_reason"])
}

func TestAgentAuthorize_ShadowMode_AllowsButShowsWouldHaveDenied(t *testing.T) {
	srv := newTestServerWithMode(t, server.EnforcementModeShadow)
	defer srv.Close()

	resp := postJSON(t, srv, "/v1/agent/authorize", map[string]any{
		"actor":  "invoice_bot",
		"action": "approve_refunds",
		"confidence_signal": map[string]any{
			"provider":       "openai",
			"token_logprobs": []float64{-2.0, -1.8, -1.9},
		},
	})
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	var body map[string]any
	require.NoError(t, json.NewDecoder(resp.Body).Decode(&body))
	assert.True(t, body["allowed"].(bool))
	assert.True(t, body["shadow_mode"].(bool))
	assert.False(t, body["would_have_allowed"].(bool))
	assert.False(t, body["requires_human_review"].(bool))
	assert.NotEmpty(t, body["would_have_reason"])
}

func TestSimulatorReplay_ReturnsDeltaSummary(t *testing.T) {
	srv := newTestServer(t)
	defer srv.Close()

	proposedPolicy := `
version: "1.0"
roles:
  finance_manager:
    allow: [view_invoices]
    deny:  [delete_invoices, approve_refunds]
agent_scopes:
  invoice_bot:
    inherits: finance_manager
    constraints:
      - require_human_approval_if_confidence_below: 0.90
      - downgrade_to_read_only_if_confidence_below: 0.70
      - hard_deny_if_confidence_below: 0.50
    deny: [delete_invoices]
`

	resp := postJSON(t, srv, "/v1/simulator/replay", map[string]any{
		"proposed_policy_yaml": proposedPolicy,
		"traces": []map[string]any{
			{
				"id":      "t1",
				"kind":    "human",
				"user_id": "user_123",
				"action":  "approve_refunds",
			},
			{
				"id":      "t2",
				"kind":    "human",
				"user_id": "user_123",
				"action":  "delete_invoices",
			},
		},
	})
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	var body map[string]any
	require.NoError(t, json.NewDecoder(resp.Body).Decode(&body))

	summary := body["summary"].(map[string]any)
	assert.Equal(t, float64(2), summary["total"])
	assert.Equal(t, float64(1), summary["changed"])
	assert.Equal(t, float64(1), summary["allow_to_deny"])

	items := body["items"].([]any)
	require.Len(t, items, 2)

	first := items[0].(map[string]any)
	assert.Equal(t, true, first["changed"])
	assert.Equal(t, "t1", first["id"])
	assert.Equal(t, "human", first["kind"])

	before := first["before"].(map[string]any)
	after := first["after"].(map[string]any)
	assert.Equal(t, "allow", before["outcome"])
	assert.Equal(t, "deny", after["outcome"])
}

func TestShadowSummary_TracksWouldHaveOutcomes(t *testing.T) {
	srv := newTestServerWithMode(t, server.EnforcementModeShadow)
	defer srv.Close()

	_ = postJSON(t, srv, "/v1/authorize", map[string]any{
		"user_id": "user_123",
		"action":  "delete_invoices",
	})

	_ = postJSON(t, srv, "/v1/agent/authorize", map[string]any{
		"actor":  "invoice_bot",
		"action": "approve_refunds",
		"confidence_signal": map[string]any{
			"provider":       "openai",
			"token_logprobs": []float64{-0.23, -0.22, -0.24},
		},
	})

	_ = postJSON(t, srv, "/v1/agent/authorize", map[string]any{
		"actor":  "invoice_bot",
		"action": "approve_refunds",
		"confidence_signal": map[string]any{
			"provider":       "openai",
			"token_logprobs": []float64{-0.01, -0.02, -0.01},
		},
	})

	resp, err := http.Get(srv.URL + "/v1/shadow/summary?window_minutes=120")
	require.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	var body map[string]any
	require.NoError(t, json.NewDecoder(resp.Body).Decode(&body))

	assert.Equal(t, "shadow", body["mode"])
	totals := body["totals"].(map[string]any)
	assert.Equal(t, float64(1), totals["deny"])
	assert.Equal(t, float64(1), totals["review"])
	assert.Equal(t, float64(1), totals["allow"])

	buckets := body["buckets"].([]any)
	assert.NotEmpty(t, buckets)
}
