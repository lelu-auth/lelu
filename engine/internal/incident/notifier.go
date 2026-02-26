package incident

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"
)

type Config struct {
	WebhookURL string
	Timeout    time.Duration
	// SlackMode formats the outbound payload as a Slack Block Kit message with
	// Approve / Deny buttons. Set INCIDENT_WEBHOOK_SLACK_MODE=true to enable.
	SlackMode bool
	// EnginePublicURL is required for Slack mode — it is used to build the
	// Approve / Deny button URLs. e.g. "https://prism.yourcompany.com"
	EnginePublicURL string
}

type Event struct {
	Timestamp           string            `json:"timestamp"`
	Type                string            `json:"type"`
	Severity            string            `json:"severity"`
	TenantID            string            `json:"tenant_id,omitempty"`
	Actor               string            `json:"actor,omitempty"`
	ActingFor           string            `json:"acting_for,omitempty"`
	Action              string            `json:"action"`
	TraceID             string            `json:"trace_id"`
	Reason              string            `json:"reason,omitempty"`
	Decision            string            `json:"decision"`
	RequiresHumanReview bool              `json:"requires_human_review"`
	ConfidenceUsed      float64           `json:"confidence_used,omitempty"`
	Resource            map[string]string `json:"resource,omitempty"`
}

type Notifier struct {
	webhookURL      string
	client          *http.Client
	slackMode       bool
	enginePublicURL string
}

func New(cfg Config) *Notifier {
	if cfg.Timeout <= 0 {
		cfg.Timeout = 2 * time.Second
	}
	return &Notifier{
		webhookURL:      strings.TrimSpace(cfg.WebhookURL),
		client:          &http.Client{Timeout: cfg.Timeout},
		slackMode:       cfg.SlackMode,
		enginePublicURL: strings.TrimSpace(cfg.EnginePublicURL),
	}
}

// NewFromEnv constructs a Notifier reading all config from environment variables:
//   - INCIDENT_WEBHOOK_URL
//   - INCIDENT_WEBHOOK_TIMEOUT_MS   (default 2000)
//   - INCIDENT_WEBHOOK_SLACK_MODE   ("true" / "1" to enable)
//   - PRISM_ENGINE_PUBLIC_URL       (required for Slack button URLs)
func NewFromEnv() *Notifier {
	timeout := 2 * time.Second
	slackMode := strings.ToLower(os.Getenv("INCIDENT_WEBHOOK_SLACK_MODE")) == "true" ||
		os.Getenv("INCIDENT_WEBHOOK_SLACK_MODE") == "1"
	return New(Config{
		WebhookURL:      os.Getenv("INCIDENT_WEBHOOK_URL"),
		Timeout:         timeout,
		SlackMode:       slackMode,
		EnginePublicURL: os.Getenv("PRISM_ENGINE_PUBLIC_URL"),
	})
}

func (n *Notifier) Enabled() bool {
	return n != nil && n.webhookURL != ""
}

func (n *Notifier) Notify(ctx context.Context, event Event) error {
	if !n.Enabled() {
		return nil
	}
	if event.Timestamp == "" {
		event.Timestamp = time.Now().UTC().Format(time.RFC3339)
	}

	var payload any = event
	if n.slackMode {
		payload = FormatSlack(event, n.enginePublicURL)
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("incident notifier: marshal event: %w", err)
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, n.webhookURL, bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("incident notifier: build request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := n.client.Do(req)
	if err != nil {
		return fmt.Errorf("incident notifier: post webhook: %w", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("incident notifier: webhook returned status %d", resp.StatusCode)
	}
	return nil
}
