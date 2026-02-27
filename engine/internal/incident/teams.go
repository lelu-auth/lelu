package incident

import "fmt"

// FormatTeams converts an incident Event into a Microsoft Teams Adaptive Card
// payload suitable for posting to a Teams Incoming Webhook connector.
//
// When the event requires human review and engineURL is set, Approve / Deny
// action buttons are rendered that link directly to the HITL queue endpoints.
func FormatTeams(event Event, engineURL string) map[string]any {
	severityColor := "attention" // yellow default
	switch event.Severity {
	case "critical":
		severityColor = "attention"
	case "high":
		severityColor = "attention"
	case "medium":
		severityColor = "warning"
	case "low":
		severityColor = "good"
	}

	confidenceText := "N/A"
	if event.ConfidenceUsed > 0 {
		confidenceText = fmt.Sprintf("%.0f%%", event.ConfidenceUsed*100)
	}

	factSet := map[string]any{
		"type": "FactSet",
		"facts": []map[string]any{
			{"title": "Agent", "value": event.Actor},
			{"title": "Action", "value": event.Action},
			{"title": "Confidence", "value": confidenceText},
			{"title": "Decision", "value": event.Decision},
			{"title": "Trace ID", "value": event.TraceID},
		},
	}
	if event.ActingFor != "" {
		factSet["facts"] = append(factSet["facts"].([]map[string]any), map[string]any{
			"title": "Acting For", "value": event.ActingFor,
		})
	}
	if event.Reason != "" {
		factSet["facts"] = append(factSet["facts"].([]map[string]any), map[string]any{
			"title": "Reason", "value": event.Reason,
		})
	}

	body := []any{
		map[string]any{
			"type":   "TextBlock",
			"size":   "Large",
			"weight": "Bolder",
			"color":  severityColor,
			"text":   fmt.Sprintf("Lelu: %s", humanEventType(event.Type)),
		},
		factSet,
	}

	card := map[string]any{
		"type":    "AdaptiveCard",
		"$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
		"version": "1.4",
		"body":    body,
	}

	// Add Approve / Deny action buttons for human-review events.
	if event.RequiresHumanReview && engineURL != "" && event.TraceID != "" {
		approveURL := fmt.Sprintf("%s/v1/queue/%s/approve", engineURL, event.TraceID)
		denyURL := fmt.Sprintf("%s/v1/queue/%s/deny", engineURL, event.TraceID)
		card["actions"] = []map[string]any{
			{
				"type":  "Action.OpenUrl",
				"title": "Approve",
				"url":   approveURL,
				"style": "positive",
			},
			{
				"type":  "Action.OpenUrl",
				"title": "Deny",
				"url":   denyURL,
				"style": "destructive",
			},
		}
	}

	// Teams webhook envelope wrapping the Adaptive Card.
	return map[string]any{
		"type": "message",
		"attachments": []map[string]any{
			{
				"contentType": "application/vnd.microsoft.card.adaptive",
				"content":     card,
			},
		},
	}
}
