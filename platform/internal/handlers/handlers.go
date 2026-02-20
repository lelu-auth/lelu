// Package handlers wires all cloud control plane HTTP endpoints.
package handlers

import (
	"crypto/sha256"
	"crypto/subtle"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	auditstore "github.com/prism/platform/internal/audit"
	"github.com/prism/platform/internal/policy"
)

// ─── Handler ──────────────────────────────────────────────────────────────────

// Handler holds all control-plane HTTP handlers.
type Handler struct {
	policies *policy.Store
	audit    *auditstore.Store
	apiKey   string // SHA-256 of the real key stored in memory
	oidcAuth *OIDCAuth
}

// New returns a Handler.
func New(policies *policy.Store, audit *auditstore.Store, apiKey string, oidcAuth *OIDCAuth) *Handler {
	hash := sha256.Sum256([]byte(apiKey))
	return &Handler{
		policies: policies,
		audit:    audit,
		apiKey:   hex.EncodeToString(hash[:]),
		oidcAuth: oidcAuth,
	}
}

// RegisterRoutes attaches all routes to mux.
func (h *Handler) RegisterRoutes(mux *http.ServeMux) {
	// Health
	mux.HandleFunc("GET /healthz", h.handleHealth)

	// Policies (requires API key)
	mux.HandleFunc("GET /api/v1/policies", h.auth(h.handleListPolicies))
	mux.HandleFunc("GET /api/v1/policies/{name}", h.auth(h.handleGetPolicy))
	mux.HandleFunc("PUT /api/v1/policies/{name}", h.auth(h.handleUpsertPolicy))
	mux.HandleFunc("DELETE /api/v1/policies/{name}", h.auth(h.handleDeletePolicy))

	// Audit / Trace Explorer (requires API key)
	mux.HandleFunc("GET /api/v1/audit", h.auth(h.handleListAudit))
	mux.HandleFunc("GET /api/v1/audit/trace/{traceID}", h.auth(h.handleGetTrace))

	// Ingest — called by engine sidecar (requires API key)
	mux.HandleFunc("POST /api/v1/audit/ingest", h.auth(h.handleIngestAudit))
}

// ─── Health ──────────────────────────────────────────────────────────────────

func (h *Handler) handleHealth(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok", "service": "prism-platform"})
}

// ─── Policies ─────────────────────────────────────────────────────────────────

func (h *Handler) handleListPolicies(w http.ResponseWriter, _ *http.Request) {
	list, err := h.policies.List()
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"policies": list, "count": len(list)})
}

func (h *Handler) handleGetPolicy(w http.ResponseWriter, r *http.Request) {
	p, err := h.policies.Get(r.PathValue("name"))
	if err != nil {
		writeError(w, http.StatusNotFound, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, p)
}

type upsertPolicyRequest struct {
	Content string `json:"content"`
	Version string `json:"version"`
}

func (h *Handler) handleUpsertPolicy(w http.ResponseWriter, r *http.Request) {
	var req upsertPolicyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	if req.Content == "" {
		writeError(w, http.StatusBadRequest, "content is required")
		return
	}
	if req.Version == "" {
		req.Version = "1.0"
	}
	p, err := h.policies.Upsert(r.PathValue("name"), req.Content, req.Version)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, p)
}

func (h *Handler) handleDeletePolicy(w http.ResponseWriter, r *http.Request) {
	if err := h.policies.Delete(r.PathValue("name")); err != nil {
		writeError(w, http.StatusNotFound, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]bool{"deleted": true})
}

// ─── Audit / Trace Explorer ───────────────────────────────────────────────────

func (h *Handler) handleListAudit(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	filter := auditstore.QueryFilter{
		Actor:    q.Get("actor"),
		Action:   q.Get("action"),
		Decision: q.Get("decision"),
		TraceID:  q.Get("trace_id"),
		Limit:    50,
	}
	if from := q.Get("from"); from != "" {
		t, err := time.Parse(time.RFC3339, from)
		if err == nil {
			filter.From = &t
		}
	}
	if to := q.Get("to"); to != "" {
		t, err := time.Parse(time.RFC3339, to)
		if err == nil {
			filter.To = &t
		}
	}

	events, err := h.audit.Query(filter)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"events": events, "count": len(events)})
}

func (h *Handler) handleGetTrace(w http.ResponseWriter, r *http.Request) {
	events, err := h.audit.GetByTraceID(r.PathValue("traceID"))
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"trace_id": r.PathValue("traceID"), "events": events})
}

func (h *Handler) handleIngestAudit(w http.ResponseWriter, r *http.Request) {
	var e auditstore.Event
	if err := json.NewDecoder(r.Body).Decode(&e); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	if e.Timestamp.IsZero() {
		e.Timestamp = time.Now().UTC()
	}
	id, err := h.audit.Append(e)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, map[string]any{"id": id})
}

// ─── Auth middleware ──────────────────────────────────────────────────────────

func (h *Handler) auth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		raw := r.Header.Get("Authorization")
		raw = strings.TrimPrefix(raw, "Bearer ")
		if raw == "" {
			writeError(w, http.StatusUnauthorized, "missing Authorization header")
			return
		}
		got := sha256.Sum256([]byte(raw))
		gotHex := hex.EncodeToString(got[:])
		if subtle.ConstantTimeCompare([]byte(gotHex), []byte(h.apiKey)) != 1 {
			if h.oidcAuth != nil {
				if err := h.oidcAuth.Verify(r.Context(), raw); err == nil {
					next(w, r)
					return
				}
			}
			writeError(w, http.StatusUnauthorized, "invalid API key or OIDC token")
			return
		}
		next(w, r)
	}
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}
