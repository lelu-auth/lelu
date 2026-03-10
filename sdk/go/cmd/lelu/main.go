package main

import (
	"context"
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/lelu-auth/lelu/sdk/go"
)

func printHelp() {
	fmt.Print(`
Lelu CLI

Usage:
  lelu audit-log       View recent audit events from the platform
  lelu help            Show this help

Environment Variables:
  LELU_PLATFORM_URL   Platform API URL (default: http://localhost:3001)
  LELU_AUDIT_LIMIT    Number of events to fetch (default: 20)

Examples:
  lelu audit-log                                    # View recent audit events
  LELU_AUDIT_LIMIT=50 lelu audit-log               # View 50 recent events
  LELU_PLATFORM_URL=https://api.example.com lelu audit-log  # Use custom platform URL
`)
}

func showAuditLog() error {
	baseURL := os.Getenv("LELU_PLATFORM_URL")
	if baseURL == "" {
		baseURL = "http://localhost:3001"
	}

	limitStr := os.Getenv("LELU_AUDIT_LIMIT")
	if limitStr == "" {
		limitStr = "20"
	}
	limit, err := strconv.ParseInt(limitStr, 10, 64)
	if err != nil {
		return fmt.Errorf("invalid LELU_AUDIT_LIMIT: %w", err)
	}

	fmt.Printf("Fetching audit log from %s...\n", baseURL)

	client := lelu.NewClient(lelu.ClientConfig{
		BaseURL: baseURL,
		Timeout: 10 * time.Second,
	})

	ctx := context.Background()
	result, err := client.ListAuditEvents(ctx, &lelu.ListAuditEventsRequest{
		Limit: limit,
	})
	if err != nil {
		fmt.Printf("Error fetching audit log: %v\n", err)
		fmt.Println("\nTroubleshooting:")
		fmt.Println("- Ensure the Lelu platform service is running")
		fmt.Println("- Check the platform URL (default: http://localhost:3001)")
		fmt.Println("- Verify your network connection")
		return err
	}

	if len(result.Events) == 0 {
		fmt.Println("No audit events found.")
		return nil
	}

	fmt.Printf("\nAudit Log (%d events, limit: %d)\n", result.Count, limit)
	fmt.Println(strings.Repeat("─", 80))

	for _, event := range result.Events {
		// Parse timestamp
		timestamp, err := time.Parse(time.RFC3339, event.Timestamp)
		if err != nil {
			timestamp = time.Now() // fallback
		}
		formattedTime := timestamp.Format("2006-01-02 15:04:05 UTC")

		confidence := ""
		if event.ConfidenceScore != nil {
			confidence = fmt.Sprintf(" (confidence: %.2f)", *event.ConfidenceScore)
		}

		resource := ""
		if len(event.Resource) > 0 {
			resourceParts := make([]string, 0, len(event.Resource))
			for k, v := range event.Resource {
				resourceParts = append(resourceParts, fmt.Sprintf("%s:%s", k, v))
			}
			resource = fmt.Sprintf(" on {%s}", strings.Join(resourceParts, ", "))
		}

		fmt.Printf("[%s] %s → %s%s\n", formattedTime, event.Actor, event.Action, resource)
		fmt.Printf("  Decision: %s%s\n", event.Decision, confidence)
		if event.Reason != nil {
			fmt.Printf("  Reason: %s\n", *event.Reason)
		}
		if event.DowngradedScope != nil {
			fmt.Printf("  Downgraded scope: %s\n", *event.DowngradedScope)
		}
		fmt.Printf("  Trace ID: %s\n", event.TraceID)
		fmt.Println()
	}

	if result.NextCursor > 0 {
		fmt.Printf("Use cursor %d to fetch more events.\n", result.NextCursor)
	}

	return nil
}

func main() {
	command := "audit-log"
	if len(os.Args) > 1 {
		command = os.Args[1]
	}

	switch command {
	case "help", "-h", "--help":
		printHelp()
	case "audit-log":
		if err := showAuditLog(); err != nil {
			os.Exit(1)
		}
	default:
		fmt.Printf("Unknown command: %s\n", command)
		printHelp()
		os.Exit(1)
	}
}