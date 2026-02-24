package prism

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

// ClientConfig configures the Prism client.
type ClientConfig struct {
	BaseURL    string
	APIKey     string
	Timeout    time.Duration
	HTTPClient *http.Client
}

// Client is the Go SDK entry-point for Prism Engine.
type Client struct {
	baseURL    string
	apiKey     string
	httpClient *http.Client
}

// NewClient constructs a new Prism SDK client.
func NewClient(cfg ClientConfig) *Client {
	baseURL := strings.TrimSuffix(cfg.BaseURL, "/")
	if baseURL == "" {
		baseURL = "http://localhost:8080"
	}

	hc := cfg.HTTPClient
	if hc == nil {
		timeout := cfg.Timeout
		if timeout <= 0 {
			timeout = 5 * time.Second
		}
		hc = &http.Client{Timeout: timeout}
	}

	return &Client{
		baseURL:    baseURL,
		apiKey:     cfg.APIKey,
		httpClient: hc,
	}
}

// AuthRequest is the human authorization request payload.
type AuthRequest struct {
	TenantID string            `json:"tenant_id,omitempty"`
	UserID   string            `json:"user_id"`
	Action   string            `json:"action"`
	Resource map[string]string `json:"resource,omitempty"`
}

// AuthDecision is the response from /v1/authorize.
type AuthDecision struct {
	Allowed bool   `json:"allowed"`
	Reason  string `json:"reason"`
	TraceID string `json:"trace_id"`
}

// AgentAuthRequest is the confidence-aware agent authorization request payload.
type AgentAuthRequest struct {
	TenantID   string            `json:"tenant_id,omitempty"`
	Actor      string            `json:"actor"`
	Action     string            `json:"action"`
	Resource   map[string]string `json:"resource,omitempty"`
	Confidence float64           `json:"confidence"`
	ActingFor  string            `json:"acting_for,omitempty"`
	Scope      string            `json:"scope,omitempty"`
}

// AgentAuthDecision is the response from /v1/agent/authorize.
type AgentAuthDecision struct {
	Allowed             bool    `json:"allowed"`
	Reason              string  `json:"reason"`
	TraceID             string  `json:"trace_id"`
	DowngradedScope     string  `json:"downgraded_scope,omitempty"`
	RequiresHumanReview bool    `json:"requires_human_review"`
	ConfidenceUsed      float64 `json:"confidence_used"`
}

// MintTokenRequest is the request payload for token minting.
type MintTokenRequest struct {
	Scope      string `json:"scope"`
	ActingFor  string `json:"acting_for,omitempty"`
	TTLSeconds int64  `json:"ttl_seconds,omitempty"`
}

// MintTokenResult is the response from /v1/tokens/mint.
type MintTokenResult struct {
	Token     string    `json:"token"`
	TokenID   string    `json:"token_id"`
	ExpiresAt time.Time `json:"-"`
}

// RevokeTokenResult is the response from token revocation.
type RevokeTokenResult struct {
	Success bool `json:"success"`
}

type mintTokenWire struct {
	Token     string `json:"token"`
	TokenID   string `json:"token_id"`
	ExpiresAt int64  `json:"expires_at"`
}

type healthResponse struct {
	Status string `json:"status"`
}

// EngineError represents non-2xx responses from Prism Engine.
type EngineError struct {
	Message string
	Status  int
	Body    string
}

func (e *EngineError) Error() string {
	if e == nil {
		return ""
	}
	if e.Status > 0 {
		return fmt.Sprintf("engine error (%d): %s", e.Status, e.Message)
	}
	return "engine error: " + e.Message
}

type errorBody struct {
	Error string `json:"error"`
}

// Authorize checks whether a human user is authorized for an action.
func (c *Client) Authorize(ctx context.Context, req AuthRequest) (*AuthDecision, error) {
	if strings.TrimSpace(req.UserID) == "" {
		return nil, errors.New("user_id is required")
	}
	if strings.TrimSpace(req.Action) == "" {
		return nil, errors.New("action is required")
	}

	var out AuthDecision
	if err := c.postJSON(ctx, "/v1/authorize", req, &out); err != nil {
		return nil, err
	}
	return &out, nil
}

// AgentAuthorize checks whether an agent is authorized for an action.
func (c *Client) AgentAuthorize(ctx context.Context, req AgentAuthRequest) (*AgentAuthDecision, error) {
	if strings.TrimSpace(req.Actor) == "" {
		return nil, errors.New("actor is required")
	}
	if strings.TrimSpace(req.Action) == "" {
		return nil, errors.New("action is required")
	}
	if req.Confidence < 0 || req.Confidence > 1 {
		return nil, errors.New("confidence must be between 0 and 1")
	}

	var out AgentAuthDecision
	if err := c.postJSON(ctx, "/v1/agent/authorize", req, &out); err != nil {
		return nil, err
	}
	return &out, nil
}

// MintToken mints a scoped JIT token for agents.
func (c *Client) MintToken(ctx context.Context, req MintTokenRequest) (*MintTokenResult, error) {
	if strings.TrimSpace(req.Scope) == "" {
		return nil, errors.New("scope is required")
	}
	if req.TTLSeconds < 0 {
		return nil, errors.New("ttl_seconds cannot be negative")
	}
	if req.TTLSeconds == 0 {
		req.TTLSeconds = 60
	}

	var wire mintTokenWire
	if err := c.postJSON(ctx, "/v1/tokens/mint", req, &wire); err != nil {
		return nil, err
	}

	return &MintTokenResult{
		Token:     wire.Token,
		TokenID:   wire.TokenID,
		ExpiresAt: time.Unix(wire.ExpiresAt, 0).UTC(),
	}, nil
}

// RevokeToken revokes a previously minted token by ID.
func (c *Client) RevokeToken(ctx context.Context, tokenID string) (*RevokeTokenResult, error) {
	if strings.TrimSpace(tokenID) == "" {
		return nil, errors.New("tokenID is required")
	}

	escaped := url.PathEscape(tokenID)
	var out RevokeTokenResult
	if err := c.doJSON(ctx, http.MethodDelete, "/v1/tokens/"+escaped, nil, &out); err != nil {
		return nil, err
	}
	return &out, nil
}

// IsHealthy returns true when the engine health endpoint reports status=ok.
func (c *Client) IsHealthy(ctx context.Context) bool {
	var out healthResponse
	if err := c.doJSON(ctx, http.MethodGet, "/healthz", nil, &out); err != nil {
		return false
	}
	return out.Status == "ok"
}

func (c *Client) postJSON(ctx context.Context, path string, in any, out any) error {
	return c.doJSON(ctx, http.MethodPost, path, in, out)
}

func (c *Client) doJSON(ctx context.Context, method, path string, in any, out any) error {
	var body io.Reader
	if in != nil {
		payload, err := json.Marshal(in)
		if err != nil {
			return fmt.Errorf("marshal request: %w", err)
		}
		body = bytes.NewReader(payload)
	}

	hreq, err := http.NewRequestWithContext(ctx, method, c.baseURL+path, body)
	if err != nil {
		return fmt.Errorf("build request: %w", err)
	}
	hreq.Header.Set("Content-Type", "application/json")
	if c.apiKey != "" {
		hreq.Header.Set("Authorization", "Bearer "+c.apiKey)
	}

	resp, err := c.httpClient.Do(hreq)
	if err != nil {
		return fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	respBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("read response: %w", err)
	}

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		msg := strings.TrimSpace(string(respBytes))
		var eb errorBody
		if len(respBytes) > 0 && json.Unmarshal(respBytes, &eb) == nil && eb.Error != "" {
			msg = eb.Error
		}
		if msg == "" {
			msg = "request failed"
		}
		return &EngineError{Message: msg, Status: resp.StatusCode, Body: string(respBytes)}
	}

	if out == nil || len(respBytes) == 0 {
		return nil
	}
	if err := json.Unmarshal(respBytes, out); err != nil {
		return fmt.Errorf("decode response: %w", err)
	}
	return nil
}
