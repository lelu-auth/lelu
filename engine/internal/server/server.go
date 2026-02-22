// Package server exposes the Auth Permission Engine over HTTP/JSON and,
// once proto stubs are generated via `make generate`, over gRPC as well.
// The HTTP layer is production-ready from day one; gRPC is wired in Phase 2.
package server

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/prism/engine/internal/audit"
	"github.com/prism/engine/internal/confidence"
	"github.com/prism/engine/internal/evaluator"
	"github.com/prism/engine/internal/queue"
	"github.com/prism/engine/internal/tokens"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

// ─── Metrics ──────────────────────────────────────────────────────────────────

var (
	httpRequestsTotal = promauto.NewCounterVec(prometheus.CounterOpts{
		Name: "prism_http_requests_total",
		Help: "Total number of HTTP requests",
	}, []string{"method", "path", "status"})

	httpRequestDuration = promauto.NewHistogramVec(prometheus.HistogramOpts{
		Name:    "prism_http_request_duration_seconds",
		Help:    "Duration of HTTP requests in seconds",
		Buckets: prometheus.DefBuckets,
	}, []string{"method", "path"})

	authDecisionsTotal = promauto.NewCounterVec(prometheus.CounterOpts{
		Name: "prism_auth_decisions_total",
		Help: "Total number of authorization decisions",
	}, []string{"type", "allowed"})
)

// ─── Handler ──────────────────────────────────────────────────────────────────

// Handler wires all engine sub-services into HTTP endpoints.
type Handler struct {
	eval     *evaluator.Evaluator
	tokenSvc *tokens.Service
	confGate *confidence.Gate
	audit    *audit.Writer
	queue    *queue.Queue
	apiKey   string
}

// New constructs a Handler from its dependencies.
func New(
	eval *evaluator.Evaluator,
	tokenSvc *tokens.Service,
	confGate *confidence.Gate,
	auditWriter *audit.Writer,
	q *queue.Queue,
	apiKey string,
) *Handler {
	return &Handler{
		eval:     eval,
		tokenSvc: tokenSvc,
		confGate: confGate,
		audit:    auditWriter,
		queue:    q,
		apiKey:   apiKey,
	}
}

// RegisterRoutes attaches all engine endpoints to mux.
func (h *Handler) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("POST /v1/authorize", h.handleAuthorize)
	mux.HandleFunc("POST /v1/agent/authorize", h.handleAgentAuthorize)
	mux.HandleFunc("POST /v1/tokens/mint", h.handleMintToken)
	mux.HandleFunc("DELETE /v1/tokens/{tokenID}", h.handleRevokeToken)
	// Phase 2 — Human approval queue
	mux.HandleFunc("GET /v1/queue/pending", h.handleQueueList)
	mux.HandleFunc("GET /v1/queue/{id}", h.handleQueueGet)
	mux.HandleFunc("POST /v1/queue/{id}/approve", h.handleQueueApprove)
	mux.HandleFunc("POST /v1/queue/{id}/deny", h.handleQueueDeny)
	mux.HandleFunc("GET /healthz", h.handleHealth)
	mux.Handle("GET /metrics", promhttp.Handler())
}

// ─── Authorize ────────────────────────────────────────────────────────────────

type authorizeRequest struct {
	TenantID string            `json:"tenant_id"`
	UserID   string            `json:"user_id"`
	Action   string            `json:"action"`
	Resource map[string]string `json:"resource"`
}

type authorizeResponse struct {
	Allowed bool   `json:"allowed"`
	Reason  string `json:"reason"`
	TraceID string `json:"trace_id"`
}

func (h *Handler) handleAuthorize(w http.ResponseWriter, r *http.Request) {
	start := time.Now()
	var req authorizeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	dec, err := h.eval.Evaluate(r.Context(), evaluator.AuthRequest{
		TenantID: req.TenantID,
		UserID:   req.UserID,
		Action:   req.Action,
		Resource: req.Resource,
	})
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	traceID := audit.NewTraceID()
	h.audit.LogDecision(r.Context(), req.TenantID, req.UserID, req.Action, req.Resource, dec.Allowed, dec.Reason, 0, ms(start))

	authDecisionsTotal.WithLabelValues("human", fmt.Sprintf("%t", dec.Allowed)).Inc()

	writeJSON(w, http.StatusOK, authorizeResponse{
		Allowed: dec.Allowed,
		Reason:  dec.Reason,
		TraceID: traceID,
	})
}

// ─── Agent Authorize ─────────────────────────────────────────────────────────

type agentAuthorizeRequest struct {
	TenantID   string            `json:"tenant_id"`
	Actor      string            `json:"actor"`
	Action     string            `json:"action"`
	Resource   map[string]string `json:"resource"`
	Confidence float64           `json:"confidence"`
	ActingFor  string            `json:"acting_for"`
	Scope      string            `json:"scope"`
}

type agentAuthorizeResponse struct {
	Allowed             bool    `json:"allowed"`
	Reason              string  `json:"reason"`
	TraceID             string  `json:"trace_id"`
	DowngradedScope     string  `json:"downgraded_scope,omitempty"`
	RequiresHumanReview bool    `json:"requires_human_review"`
	ConfidenceUsed      float64 `json:"confidence_used"`
}

func (h *Handler) handleAgentAuthorize(w http.ResponseWriter, r *http.Request) {
	start := time.Now()
	var req agentAuthorizeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	// 1. Confidence gate first (fastest path).
	confDec, err := h.confGate.Evaluate(r.Context(), req.Confidence, nil)
	if err != nil {
		writeError(w, http.StatusBadRequest, fmt.Sprintf("confidence: %v", err))
		return
	}

	if confDec.Level == confidence.LevelHardDeny {
		traceID := audit.NewTraceID()
		h.audit.LogDecision(r.Context(), req.TenantID, req.Actor, req.Action, req.Resource, false, confDec.Reason, req.Confidence, ms(start))
		
		authDecisionsTotal.WithLabelValues("agent", "false").Inc()

		writeJSON(w, http.StatusOK, agentAuthorizeResponse{
			Allowed:        false,
			Reason:         confDec.Reason,
			TraceID:        traceID,
			ConfidenceUsed: req.Confidence,
		})
		return
	}

	// 2. Policy evaluator.
	evalDec, err := h.eval.EvaluateAgent(r.Context(), evaluator.AgentAuthRequest{
		TenantID:   req.TenantID,
		Actor:      req.Actor,
		Action:     req.Action,
		Resource:   req.Resource,
		Confidence: req.Confidence,
		ActingFor:  req.ActingFor,
		Scope:      req.Scope,
	})
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	traceID := audit.NewTraceID()
	h.audit.LogDecision(r.Context(), req.TenantID, req.Actor, req.Action, req.Resource, evalDec.Allowed, evalDec.Reason, req.Confidence, ms(start))

	authDecisionsTotal.WithLabelValues("agent", fmt.Sprintf("%t", evalDec.Allowed)).Inc()

	// Phase 2 — enqueue for human review when flagged.
	requiresReview := evalDec.RequiresHumanReview || confDec.RequiresHumanReview
	if requiresReview && h.queue != nil {
		_, _ = h.queue.Enqueue(r.Context(), req.TenantID, req.Actor, req.Action, req.Resource, req.Confidence, evalDec.Reason, req.ActingFor)
	}

	writeJSON(w, http.StatusOK, agentAuthorizeResponse{
		Allowed:             evalDec.Allowed,
		Reason:              evalDec.Reason,
		TraceID:             traceID,
		DowngradedScope:     evalDec.DowngradedScope,
		RequiresHumanReview: requiresReview,
		ConfidenceUsed:      req.Confidence,
	})
}

// ─── Mint Token ───────────────────────────────────────────────────────────────

type mintTokenRequest struct {
	Scope      string `json:"scope"`
	ActingFor  string `json:"acting_for"`
	TTLSeconds int64  `json:"ttl_seconds"`
}

type mintTokenResponse struct {
	Token     string `json:"token"`
	TokenID   string `json:"token_id"`
	ExpiresAt int64  `json:"expires_at"`
}

func (h *Handler) handleMintToken(w http.ResponseWriter, r *http.Request) {
	var req mintTokenRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	ttl := time.Duration(req.TTLSeconds) * time.Second
	result, err := h.tokenSvc.MintAgentToken(r.Context(), req.Scope, req.ActingFor, ttl)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, mintTokenResponse{
		Token:     result.Token,
		TokenID:   result.TokenID,
		ExpiresAt: result.ExpiresAt.Unix(),
	})
}

// ─── Revoke Token ─────────────────────────────────────────────────────────────

func (h *Handler) handleRevokeToken(w http.ResponseWriter, r *http.Request) {
	tokenID := r.PathValue("tokenID")
	if tokenID == "" {
		writeError(w, http.StatusBadRequest, "missing token_id")
		return
	}
	if err := h.tokenSvc.RevokeToken(r.Context(), tokenID); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]bool{"success": true})
}

// ─── Human Approval Queue ─────────────────────────────────────────────────────

func (h *Handler) handleQueueList(w http.ResponseWriter, r *http.Request) {
	if h.queue == nil {
		writeError(w, http.StatusServiceUnavailable, "queue not configured")
		return
	}
	items, err := h.queue.ListPending(r.Context(), 50)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": items, "count": len(items)})
}

func (h *Handler) handleQueueGet(w http.ResponseWriter, r *http.Request) {
	if h.queue == nil {
		writeError(w, http.StatusServiceUnavailable, "queue not configured")
		return
	}
	id := r.PathValue("id")
	item, err := h.queue.Get(r.Context(), id)
	if err != nil {
		writeError(w, http.StatusNotFound, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, item)
}

type resolveRequest struct {
	ResolvedBy string `json:"resolved_by"`
	Note       string `json:"note"`
}

func (h *Handler) handleQueueApprove(w http.ResponseWriter, r *http.Request) {
	h.handleQueueResolve(w, r, true)
}

func (h *Handler) handleQueueDeny(w http.ResponseWriter, r *http.Request) {
	h.handleQueueResolve(w, r, false)
}

func (h *Handler) handleQueueResolve(w http.ResponseWriter, r *http.Request, approve bool) {
	if h.queue == nil {
		writeError(w, http.StatusServiceUnavailable, "queue not configured")
		return
	}
	id := r.PathValue("id")
	var req resolveRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	var err error
	if approve {
		err = h.queue.Approve(r.Context(), id, req.ResolvedBy, req.Note)
	} else {
		err = h.queue.Deny(r.Context(), id, req.ResolvedBy, req.Note)
	}
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]bool{"success": true})
}

// ─── Health ───────────────────────────────────────────────────────────────────

func (h *Handler) handleHealth(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{
		"status":  "ok",
		"service": "prizm-engine",
	})
}

// ─── HTTP Server constructor ─────────────────────────────────────────────────

// NewHTTPServer builds a configured *http.Server ready to call ListenAndServe.
func NewHTTPServer(addr string, handler *Handler) *http.Server {
	mux := http.NewServeMux()
	handler.RegisterRoutes(mux)

	return &http.Server{
		Addr:         addr,
		Handler:      logging(handler.authMiddleware(mux)),
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  60 * time.Second,
	}
}

// ─── Middleware ───────────────────────────────────────────────────────────────

// responseRecorder intercepts the status code for metrics
type responseRecorder struct {
	http.ResponseWriter
	statusCode int
}

func (rec *responseRecorder) WriteHeader(statusCode int) {
	rec.statusCode = statusCode
	rec.ResponseWriter.WriteHeader(statusCode)
}

func (h *Handler) authMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Skip auth for health check and metrics
		if r.URL.Path == "/healthz" || r.URL.Path == "/metrics" {
			next.ServeHTTP(w, r)
			return
		}

		// If no API key is configured, allow all (for local dev/testing)
		if h.apiKey == "" {
			next.ServeHTTP(w, r)
			return
		}

		authHeader := r.Header.Get("Authorization")
		expected := "Bearer " + h.apiKey
		if authHeader != expected {
			writeError(w, http.StatusUnauthorized, "unauthorized: invalid or missing API key")
			return
		}

		next.ServeHTTP(w, r)
	})
}

func logging(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		
		rec := &responseRecorder{
			ResponseWriter: w,
			statusCode:     http.StatusOK,
		}
		
		next.ServeHTTP(rec, r)
		
		duration := time.Since(start).Seconds()
		
		// Record metrics
		httpRequestsTotal.WithLabelValues(r.Method, r.URL.Path, fmt.Sprintf("%d", rec.statusCode)).Inc()
		httpRequestDuration.WithLabelValues(r.Method, r.URL.Path).Observe(duration)
		
		log.Printf("%s %s %d %.2fms", r.Method, r.URL.Path, rec.statusCode, ms(start))
	})
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

type errorResponse struct {
	Error string `json:"error"`
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, errorResponse{Error: msg})
}

func ms(start time.Time) float64 {
	return float64(time.Since(start).Microseconds()) / 1000
}
