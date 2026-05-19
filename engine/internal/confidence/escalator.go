package confidence

import "fmt"

// Escalator routes audit findings to human review queues based on severity.
type Escalator struct {
	humanReviewQueue interface{} // placeholder for queue interface
}

// NewEscalator returns a new escalator instance.
func NewEscalator(reviewQueue interface{}) *Escalator {
	return &Escalator{
		humanReviewQueue: reviewQueue,
	}
}

// EscalationAction describes what action should be taken.
type EscalationAction string

const (
	ActionAllow       EscalationAction = "allow"
	ActionDeny        EscalationAction = "deny"
	ActionReview      EscalationAction = "human_review"
	ActionDowngrade   EscalationAction = "downgrade_scope"
)

// Escalate decides whether to escalate to human review based on the audit result and severity.
func (e *Escalator) Escalate(result *AuditResult, severity SeverityLevel) EscalationAction {
	if result == nil {
		return ActionAllow
	}

	switch severity {
	case SeverityHigh:
		// High drift → escalate to human review
		return ActionReview
	case SeverityMedium:
		// Medium drift → downgrade scope or review
		if result.ExternalScore < 0.5 {
			return ActionDeny
		}
		return ActionReview
	case SeverityLow:
		// Low drift → just log, allow for now
		return ActionAllow
	default:
		return ActionAllow
	}
}

// CreateReviewTask formats an escalation task for the review queue.
func (e *Escalator) CreateReviewTask(result *AuditResult, severity SeverityLevel, auditReq *AuditRequest) map[string]interface{} {
	return map[string]interface{}{
		"type":              "confidence_audit",
		"severity":          severity,
		"actor_score":       result.ActorScore,
		"external_score":    result.ExternalScore,
		"drift":             result.Drift,
		"reason":            result.Reason,
		"prompt":            auditReq.Prompt,
		"action":            auditReq.Action,
		"actor_id":          "", // would be set by caller
		"tenant_id":         auditReq.TenantID,
		"status":            "pending",
		"created_at":        fmt.Sprintf("%v", epochMillis()),
	}
}

// epochMillis returns current time in milliseconds (stub).
func epochMillis() int64 {
	// In real implementation, use time.Now().UnixMilli()
	return 0
}
