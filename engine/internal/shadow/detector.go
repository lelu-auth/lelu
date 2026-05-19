package shadow

import "fmt"

// Detector orchestrates shadow detection: fingerprinting, registry diff, and reporting.
type Detector struct {
    registry map[string]bool
    reporter *Reporter
}

// New returns a new Detector instance.
// registry: map of known fingerprints (for now, in-memory; later from DB).
// reporter: publishes findings to audit/pubsub.
func New(registry map[string]bool, reporter *Reporter) *Detector {
    if reporter == nil {
        reporter = NewReporter()
    }
    return &Detector{
        registry: registry,
        reporter: reporter,
    }
}

// DetectionResult holds the outcome of shadow detection for a request.
type DetectionResult struct {
    Fingerprint string
    IsShadow    bool
    Reason      string
}

// Detect processes a request, computes fingerprint, checks registry, and reports if shadow.
// Returns true if the request came from a shadow (unregistered) agent.
func (d *Detector) Detect(req map[string]interface{}) (*DetectionResult, error) {
    fp := Fingerprint(req)
    registered := IsRegistered(fp, d.registry)

    result := &DetectionResult{
        Fingerprint: fp,
        IsShadow:    !registered,
    }

    if !registered {
        result.Reason = fmt.Sprintf("unregistered fingerprint: %s", fp)
        // Report the shadow finding for audit/alerting
        if err := d.reporter.Report(fp, req); err != nil {
            return result, fmt.Errorf("report shadow: %w", err)
        }
    } else {
        result.Reason = "fingerprint registered"
    }

    return result, nil
}
