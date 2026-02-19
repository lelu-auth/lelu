// Package evaluator implements OPA-style policy evaluation for YAML-defined
// RBAC + agent-scoped policies.
package evaluator

import (
	"context"
	"fmt"
	"os"
	"sync"

	"gopkg.in/yaml.v3"
)

// ─── Domain types ────────────────────────────────────────────────────────────

// AuthRequest represents a human authorization check.
type AuthRequest struct {
	UserID   string            `json:"user_id"`
	Action   string            `json:"action"`
	Resource map[string]string `json:"resource"`
}

// AgentAuthRequest represents an agent authorization check.
type AgentAuthRequest struct {
	Actor      string            `json:"actor"`
	Action     string            `json:"action"`
	Resource   map[string]string `json:"resource"`
	Confidence float64           `json:"confidence"`
	ActingFor  string            `json:"acting_for"`
	Scope      string            `json:"scope"`
}

// Decision is the output of the policy evaluation.
type Decision struct {
	Allowed             bool    `json:"allowed"`
	Reason              string  `json:"reason"`
	DowngradedScope     string  `json:"downgraded_scope,omitempty"`
	RequiresHumanReview bool    `json:"requires_human_review"`
	ConfidenceUsed      float64 `json:"confidence_used,omitempty"`
}

// ─── Policy Schema ────────────────────────────────────────────────────────────

// Policy is the top-level schema for auth.yaml.
type Policy struct {
	Version     string                `yaml:"version"`
	Roles       map[string]Role       `yaml:"roles"`
	AgentScopes map[string]AgentScope `yaml:"agent_scopes"`
}

// Role maps a role name to its allowed/denied actions.
type Role struct {
	Allow []string `yaml:"allow"`
	Deny  []string `yaml:"deny"`
}

// AgentScope defines agent-specific rules, inheriting from a Role.
type AgentScope struct {
	Inherits    string       `yaml:"inherits"`
	Constraints []Constraint `yaml:"constraints"`
	Deny        []string     `yaml:"deny"`
}

// Constraint is a single named constraint value pair.
type Constraint struct {
	MaxRefundAmount            *float64 `yaml:"max_refund_amount,omitempty"`
	RequireHumanApprovalIfConf *float64 `yaml:"require_human_approval_if_confidence_below,omitempty"`
	DowngradeToReadOnlyIfConf  *float64 `yaml:"downgrade_to_read_only_if_confidence_below,omitempty"`
	HardDenyIfConf             *float64 `yaml:"hard_deny_if_confidence_below,omitempty"`
}

// ─── Evaluator ───────────────────────────────────────────────────────────────

// Evaluator holds the active policy and evaluates auth requests.
type Evaluator struct {
	mu     sync.RWMutex
	policy *Policy
}

// New returns a default Evaluator with an empty policy.
func New() *Evaluator {
	return &Evaluator{policy: &Policy{
		Roles:       make(map[string]Role),
		AgentScopes: make(map[string]AgentScope),
	}}
}

// LoadPolicy reads and parses a YAML policy file, then hot-swaps it in.
func (e *Evaluator) LoadPolicy(path string) error {
	data, err := os.ReadFile(path)
	if err != nil {
		return fmt.Errorf("evaluator: read policy: %w", err)
	}
	return e.LoadPolicyBytes(data)
}

// LoadPolicyBytes parses and hot-swaps policy from raw YAML bytes.
func (e *Evaluator) LoadPolicyBytes(data []byte) error {
	var p Policy
	if err := yaml.Unmarshal(data, &p); err != nil {
		return fmt.Errorf("evaluator: parse policy: %w", err)
	}
	e.mu.Lock()
	e.policy = &p
	e.mu.Unlock()
	return nil
}

// Evaluate checks a human auth request against the loaded policy.
func (e *Evaluator) Evaluate(_ context.Context, req AuthRequest) (*Decision, error) {
	e.mu.RLock()
	p := e.policy
	e.mu.RUnlock()

	// Walk all roles to find one assigned to the user (future: user→role mapping).
	// For now we do a direct action-level check across all roles.
	for _, role := range p.Roles {
		for _, denied := range role.Deny {
			if denied == req.Action {
				return &Decision{Allowed: false, Reason: fmt.Sprintf("action %q is explicitly denied", req.Action)}, nil
			}
		}
		for _, allowed := range role.Allow {
			if allowed == req.Action {
				return &Decision{Allowed: true, Reason: "action allowed by role"}, nil
			}
		}
	}
	return &Decision{Allowed: false, Reason: fmt.Sprintf("no policy permits action %q", req.Action)}, nil
}

// EvaluateAgent checks an agent auth request with confidence-aware logic.
func (e *Evaluator) EvaluateAgent(_ context.Context, req AgentAuthRequest) (*Decision, error) {
	e.mu.RLock()
	p := e.policy
	e.mu.RUnlock()

	scope, ok := p.AgentScopes[req.Actor]
	if !ok {
		return &Decision{Allowed: false, Reason: fmt.Sprintf("unknown agent scope %q", req.Actor)}, nil
	}

	// Hard deny overrides.
	for _, denied := range scope.Deny {
		if denied == req.Action {
			return &Decision{Allowed: false, Reason: fmt.Sprintf("action %q is hard-denied for agent %q", req.Action, req.Actor)}, nil
		}
	}

	// Confidence gates from constraints.
	dec := &Decision{Allowed: true, ConfidenceUsed: req.Confidence}
	for _, c := range scope.Constraints {
		if c.HardDenyIfConf != nil && req.Confidence < *c.HardDenyIfConf {
			dec.Allowed = false
			dec.Reason = fmt.Sprintf("confidence %.0f%% is below hard-deny threshold %.0f%%", req.Confidence*100, *c.HardDenyIfConf*100)
			return dec, nil
		}
		if c.DowngradeToReadOnlyIfConf != nil && req.Confidence < *c.DowngradeToReadOnlyIfConf {
			dec.Allowed = false
			dec.DowngradedScope = "read_only"
			dec.Reason = fmt.Sprintf("confidence %.0f%% requires read-only downgrade (threshold %.0f%%)", req.Confidence*100, *c.DowngradeToReadOnlyIfConf*100)
			return dec, nil
		}
		if c.RequireHumanApprovalIfConf != nil && req.Confidence < *c.RequireHumanApprovalIfConf {
			dec.RequiresHumanReview = true
			dec.Reason = fmt.Sprintf("confidence %.0f%% requires human approval (threshold %.0f%%)", req.Confidence*100, *c.RequireHumanApprovalIfConf*100)
		}
	}

	// Check inherited role permissions.
	if scope.Inherits != "" {
		role, found := p.Roles[scope.Inherits]
		if !found {
			return &Decision{Allowed: false, Reason: fmt.Sprintf("inherited role %q not found", scope.Inherits)}, nil
		}
		permitted := false
		for _, a := range role.Allow {
			if a == req.Action {
				permitted = true
				break
			}
		}
		if !permitted {
			return &Decision{Allowed: false, Reason: fmt.Sprintf("action %q not in inherited role %q", req.Action, scope.Inherits)}, nil
		}
	}

	if dec.Reason == "" {
		dec.Reason = "action authorized"
	}
	return dec, nil
}
