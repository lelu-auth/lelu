package confidence

// Scorer compares the external confidence score against the actor's self-reported score
// and determines if human review is warranted.
type Scorer struct {
	driftThreshold float64
}

// NewScorer returns a new scorer with a configurable drift threshold.
func NewScorer(driftThreshold float64) *Scorer {
	if driftThreshold <= 0 {
		driftThreshold = 0.3 // default: flag any drift > 30%
	}
	return &Scorer{driftThreshold: driftThreshold}
}

// ScoreDrift evaluates whether the drift between external and actor scores is acceptable.
func (s *Scorer) ScoreDrift(result *AuditResult) bool {
	if result == nil {
		return false
	}
	return result.Drift <= s.driftThreshold
}

// SeverityLevel categorizes the severity of the confidence drift.
type SeverityLevel string

const (
	SeverityNone   SeverityLevel = "none"
	SeverityLow    SeverityLevel = "low"
	SeverityMedium SeverityLevel = "medium"
	SeverityHigh   SeverityLevel = "high"
)

// AssessSeverity returns a severity level based on drift magnitude.
func (s *Scorer) AssessSeverity(result *AuditResult) SeverityLevel {
	if result == nil {
		return SeverityNone
	}
	switch {
	case result.Drift < 0.1:
		return SeverityNone
	case result.Drift < 0.3:
		return SeverityLow
	case result.Drift < 0.5:
		return SeverityMedium
	default:
		return SeverityHigh
	}
}
