package shadow

// Reporter is a small abstraction used to publish findings.
// In Phase 1 it is a no-op; later it will push to pubsub/audit.
type Reporter struct{}

// NewReporter constructs a Reporter.
func NewReporter() *Reporter { return &Reporter{} }

// Report publishes a detected fingerprint and metadata.
func (r *Reporter) Report(fingerprint string, info map[string]interface{}) error {
    // no-op for scaffold
    return nil
}
