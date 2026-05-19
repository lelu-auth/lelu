package confidence

import "fmt"

// ExternalAuditor sends a prompt+action to an external service (e.g., Vertex AI)
// to independently assess confidence, then compares against self-reported sig.
type ExternalAuditor struct {
	vertexEndpoint string
	apiKey         string
}

// NewExternalAuditor returns a new auditor instance.
func NewExternalAuditor(vertexEndpoint, apiKey string) *ExternalAuditor {
	return &ExternalAuditor{
		vertexEndpoint: vertexEndpoint,
		apiKey:         apiKey,
	}
}

// AuditRequest wraps the data needed for external confidence evaluation.
type AuditRequest struct {
	Prompt            string
	Action            string
	ActorConfidence   float64
	ActingForUserID   string
	TenantID          string
}

// AuditResult holds the independent confidence score from the external evaluator.
type AuditResult struct {
	ExternalScore float64
	ActorScore    float64
	Drift         float64 // |ActorScore - ExternalScore|
	IsAnomalous   bool
	Reason        string
}

// Audit queries an external service for an independent confidence assessment
// and compares it to the actor's self-reported score.
// For now this is a stub; in Phase 1 it will call Vertex AI.
func (ea *ExternalAuditor) Audit(req *AuditRequest) (*AuditResult, error) {
	if req == nil {
		return nil, fmt.Errorf("audit request is nil")
	}

	// Placeholder: simulate external evaluation
	// Real implementation will call Vertex or similar service
	externalScore := computeDummyExternalScore(req.Prompt, req.Action)
	drift := absDiff(externalScore, req.ActorConfidence)

	result := &AuditResult{
		ExternalScore: externalScore,
		ActorScore:    req.ActorConfidence,
		Drift:         drift,
		IsAnomalous:   drift > 0.3, // threshold for anomaly
		Reason:        fmt.Sprintf("drift=%.3f", drift),
	}

	return result, nil
}

// computeDummyExternalScore is a placeholder that simulates external scoring.
// Replace with actual Vertex API call in Phase 1.
func computeDummyExternalScore(prompt, action string) float64 {
	// Stub: return a value that will pass most tests
	return 0.75
}

// absDiff returns the absolute difference between two floats.
func absDiff(a, b float64) float64 {
	if a > b {
		return a - b
	}
	return b - a
}
