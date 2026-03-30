package incident

import (
	"fmt"
	"time"
)

// PagerDuty Events API v2 severity mapping.
func pagerDutySeverity(s string) string {
	switch s {
	case "critical":
		return "critical"
	case "high":
		return "error"
	case "medium":
		return "warning"
	default:
		return "info"
	}
}

// FormatPagerDuty converts an incident Event into a PagerDuty Events API v2
// trigger payload. The caller is responsible for posting this to
// https://events.pagerduty.com/v2/enqueue.
//
// routingKey is the PagerDuty integration/routing key for the service.
// engineURL is the public URL of the engine, used to generate deep-links to
// the HITL queue item when the event requires human review.
func FormatPagerDuty(event Event, routingKey, engineURL string) map[string]any {
	summary := fmt.Sprintf("Lelu %s — %s: %s (actor: %s)",
		event.Severity, humanEventType(event.Type), event.Action, event.Actor)

	ts := event.Timestamp
	if ts == "" {
		ts = time.Now().UTC().Format(time.RFC3339)
	}

	customDetails := map[string]any{
		"actor":      event.Actor,
		"action":     event.Action,
		"decision":   event.Decision,
		"trace_id":   event.TraceID,
		"confidence": event.ConfidenceUsed,
		"reason":     event.Reason,
		"tenant_id":  event.TenantID,
	}
	if event.ActingFor != "" {
		customDetails["acting_for"] = event.ActingFor
	}

	payload := map[string]any{
		"summary":        summary,
		"timestamp":      ts,
		"severity":       pagerDutySeverity(event.Severity),
		"source":         "lelu-engine",
		"component":      "authorization",
		"group":          event.TenantID,
		"class":          event.Type,
		"custom_details": customDetails,
	}

	// Deep link to the review queue item when relevant.
	var links []map[string]any
	if event.RequiresHumanReview && engineURL != "" && event.TraceID != "" {
		links = append(links, map[string]any{
			"href": fmt.Sprintf("%s/v1/queue/%s", engineURL, event.TraceID),
			"text": "Review in Lelu Queue",
		})
	}

	out := map[string]any{
		"routing_key":  routingKey,
		"event_action": "trigger",
		"dedup_key":    fmt.Sprintf("lelu-%s-%s", event.Type, event.TraceID),
		"payload":      payload,
	}
	if len(links) > 0 {
		out["links"] = links
	}
	return out
}
