package incident

import "fmt"

// FormatSlack converts an incident Event into a Slack Block Kit payload.
// The resulting map can be JSON-serialised and posted to a Slack Incoming
// Webhook URL to produce a rich card with Approve / Deny buttons.
//
// engineURL should be the public base URL of the Lelu engine sidecar,
// e.g. "https://lelu.yourcompany.com". It is used to build the button
// action URLs that link directly to the HITL queue endpoints.
func FormatSlack(event Event, engineURL string) map[string]any {
	severityEmoji := "⚠️"
	switch event.Severity {
	case "critical":
		severityEmoji = "🚨"
	case "high":
		severityEmoji = "🔴"
	case "medium":
		severityEmoji = "🟡"
	}

	headerText := fmt.Sprintf("%s Lelu: %s", severityEmoji, humanEventType(event.Type))

	confidenceText := "N/A"
	if event.ConfidenceUsed > 0 {
		confidenceText = fmt.Sprintf("%.0f%%", event.ConfidenceUsed*100)
	}

	actingForText := "*Acting For:*\n—"
	if event.ActingFor != "" {
		actingForText = fmt.Sprintf("*Acting For:*\n%s", event.ActingFor)
	}

	fields := []map[string]any{
		{"type": "mrkdwn", "text": fmt.Sprintf("*Agent:*\n`%s`", event.Actor)},
		{"type": "mrkdwn", "text": fmt.Sprintf("*Action:*\n`%s`", event.Action)},
		{"type": "mrkdwn", "text": fmt.Sprintf("*Confidence:*\n%s", confidenceText)},
		{"type": "mrkdwn", "text": actingForText},
	}
	if event.Reason != "" {
		fields = append(fields, map[string]any{
			"type": "mrkdwn",
			"text": fmt.Sprintf("*Reason:*\n%s", event.Reason),
		})
	}
	if event.TraceID != "" {
		fields = append(fields, map[string]any{
			"type": "mrkdwn",
			"text": fmt.Sprintf("*Trace ID:*\n`%s`", event.TraceID),
		})
	}

	blocks := []map[string]any{
		{
			"type": "header",
			"text": map[string]any{
				"type":  "plain_text",
				"text":  headerText,
				"emoji": true,
			},
		},
		{
			"type":   "section",
			"fields": fields,
		},
		{"type": "divider"},
	}

	// Only add Approve / Deny buttons for human-review events, where a
	// queue item exists that a reviewer can act on.
	if event.RequiresHumanReview && engineURL != "" && event.TraceID != "" {
		approveURL := fmt.Sprintf("%s/v1/queue/%s/approve", engineURL, event.TraceID)
		denyURL := fmt.Sprintf("%s/v1/queue/%s/deny", engineURL, event.TraceID)

		blocks = append(blocks, map[string]any{
			"type": "actions",
			"elements": []map[string]any{
				{
					"type":  "button",
					"style": "primary",
					"text":  map[string]any{"type": "plain_text", "text": "✅ Approve", "emoji": true},
					"url":   approveURL,
				},
				{
					"type":  "button",
					"style": "danger",
					"text":  map[string]any{"type": "plain_text", "text": "❌ Deny", "emoji": true},
					"url":   denyURL,
				},
			},
		})
	}

	// Context footer.
	blocks = append(blocks, map[string]any{
		"type": "context",
		"elements": []map[string]any{
			{
				"type": "mrkdwn",
				"text": fmt.Sprintf("Lelu · %s · %s", event.Decision, event.Timestamp),
			},
		},
	})

	return map[string]any{"blocks": blocks}
}

func humanEventType(t string) string {
	switch t {
	case "authorization.denied":
		return "Agent Action Denied"
	case "authorization.review_required":
		return "Agent Action Requires Human Approval"
	case "security.injection_attempt":
		return "🛡️ Prompt Injection Attempt Detected"
	case "security.anomaly_spike":
		return "🔴 Anomaly: Unusual Denial Spike"
	default:
		return t
	}
}
