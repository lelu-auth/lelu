// Package confidence implements the Confidence-Aware Auth gate — the core
// differentiator of the Auth Permission Engine.
//
// Confidence thresholds (defaults, overridable per-policy):
//
//	≥ 0.90  → full permission, autonomous action
//	0.70–0.89 → requires human approval, action queued
//	0.50–0.69 → downgraded to read_only scope
//	< 0.50  → hard deny + security alert
package confidence

import (
	"context"
	"fmt"
)

// ─── Thresholds ───────────────────────────────────────────────────────────────

const (
	ThresholdFull     = 0.90
	ThresholdHuman    = 0.70
	ThresholdHardDeny = 0.50
)

// Level describes the outcome of a confidence evaluation.
type Level int

const (
	LevelFullPermission Level = iota // ≥ 90 %
	LevelRequiresHuman               // 70–89 %
	LevelReadOnly                    // 50–69 %
	LevelHardDeny                    // < 50 %
)

func (l Level) String() string {
	switch l {
	case LevelFullPermission:
		return "full_permission"
	case LevelRequiresHuman:
		return "requires_human_review"
	case LevelReadOnly:
		return "read_only"
	case LevelHardDeny:
		return "hard_deny"
	}
	return "unknown"
}

// ─── Policy ───────────────────────────────────────────────────────────────────

// Policy defines custom thresholds for a specific agent scope. Zero values fall
// back to the package-level defaults above.
type Policy struct {
	FullPermissionAbove float64 // default 0.90
	HumanReviewAbove    float64 // default 0.70
	HardDenyBelow       float64 // default 0.50
}

func (p *Policy) full() float64 {
	if p != nil && p.FullPermissionAbove > 0 {
		return p.FullPermissionAbove
	}
	return ThresholdFull
}

func (p *Policy) human() float64 {
	if p != nil && p.HumanReviewAbove > 0 {
		return p.HumanReviewAbove
	}
	return ThresholdHuman
}

func (p *Policy) hardDeny() float64 {
	if p != nil && p.HardDenyBelow > 0 {
		return p.HardDenyBelow
	}
	return ThresholdHardDeny
}

// ─── Decision ─────────────────────────────────────────────────────────────────

// Decision is the output of a confidence evaluation.
type Decision struct {
	Level               Level
	Allowed             bool
	RequiresHumanReview bool
	DowngradedScope     string // non-empty when scope was reduced
	Reason              string
}

// ─── Gate ─────────────────────────────────────────────────────────────────────

// Gate is the confidence evaluation component.
type Gate struct{}

// New returns a new Gate. It is stateless; all configuration is passed per call.
func New() *Gate { return &Gate{} }

// Evaluate runs a confidence score through the gate and returns a Decision.
func (g *Gate) Evaluate(_ context.Context, score float64, policy *Policy) (*Decision, error) {
	if score < 0 || score > 1 {
		return nil, fmt.Errorf("confidence: score %.4f is out of range [0, 1]", score)
	}

	switch {
	case score >= policy.full():
		return &Decision{
			Level:   LevelFullPermission,
			Allowed: true,
			Reason:  fmt.Sprintf("confidence %.0f%% meets full-permission threshold (%.0f%%)", score*100, policy.full()*100),
		}, nil

	case score >= policy.human():
		return &Decision{
			Level:               LevelRequiresHuman,
			Allowed:             false,
			RequiresHumanReview: true,
			Reason:              fmt.Sprintf("confidence %.0f%% requires human approval (threshold %.0f%%)", score*100, policy.full()*100),
		}, nil

	case score >= policy.hardDeny():
		return &Decision{
			Level:           LevelReadOnly,
			Allowed:         false,
			DowngradedScope: "read_only",
			Reason:          fmt.Sprintf("confidence %.0f%% downgraded to read_only (threshold %.0f%%)", score*100, policy.human()*100),
		}, nil

	default:
		return &Decision{
			Level:   LevelHardDeny,
			Allowed: false,
			Reason:  fmt.Sprintf("confidence %.0f%% is below hard-deny threshold (%.0f%%) — request blocked", score*100, policy.hardDeny()*100),
		}, nil
	}
}
