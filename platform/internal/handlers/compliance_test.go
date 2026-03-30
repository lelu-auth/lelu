package handlers

import (
	"testing"
	"time"

	auditstore "github.com/lelu/platform/internal/audit"
)

func TestParseComplianceFramework(t *testing.T) {
	if got := parseComplianceFramework(""); got != complianceFramework("all") {
		t.Fatalf("expected all for empty, got %q", got)
	}
	if got := parseComplianceFramework("all"); got != complianceFramework("all") {
		t.Fatalf("expected all, got %q", got)
	}
	if got := parseComplianceFramework("owasp_genai"); got != frameworkOWASPGenAI {
		t.Fatalf("expected owasp_genai, got %q", got)
	}
	if got := parseComplianceFramework("nist_ai_rmf"); got != frameworkNISTAIRMF {
		t.Fatalf("expected nist_ai_rmf, got %q", got)
	}
	if got := parseComplianceFramework("invalid"); got != complianceFramework("") {
		t.Fatalf("expected invalid framework to be empty, got %q", got)
	}
}

func TestSummarizeControls_AllFrameworks(t *testing.T) {
	events := []auditstore.Event{
		{
			TenantID:  "default",
			TraceID:   "trace-1",
			Timestamp: time.Now().UTC(),
			Actor:     "invoice_bot",
			Action:    "approve_refunds",
			Decision:  "denied",
		},
		{
			TenantID:  "default",
			TraceID:   "trace-2",
			Timestamp: time.Now().UTC(),
			Actor:     "invoice_bot",
			Action:    "approve_refunds",
			Decision:  "human_review",
		},
	}

	controls := summarizeControls(complianceFramework("all"), events)
	if len(controls) == 0 {
		t.Fatal("expected compliance controls to be summarized")
	}

	ids := make(map[string]bool)
	for _, c := range controls {
		ids[c.ID] = true
	}
	if !ids["OWASP-LLM01"] {
		t.Fatal("expected OWASP-LLM01 control")
	}
	if !ids["OWASP-LLM06"] {
		t.Fatal("expected OWASP-LLM06 control")
	}
	if !ids["NIST-AI-RMF-GOV-1.6"] {
		t.Fatal("expected NIST-AI-RMF-GOV-1.6 control")
	}
	if !ids["NIST-AI-RMF-MEASURE-2.11"] {
		t.Fatal("expected NIST-AI-RMF-MEASURE-2.11 control")
	}
}

func TestBuildComplianceEvidence_Unsigned(t *testing.T) {
	resp := complianceExportResponse{
		Framework:   "all",
		TenantID:    "default",
		GeneratedAt: time.Now().UTC().Format(time.RFC3339),
		TotalEvents: 1,
		Controls: []complianceControlSummary{
			{ID: "OWASP-LLM01", Title: "Prompt Injection Controls", EventCount: 1},
		},
	}

	evidence := buildComplianceEvidence(resp, "")
	if evidence.ChecksumSHA256 == "" {
		t.Fatal("expected checksum for unsigned evidence")
	}
	if evidence.Signed {
		t.Fatal("expected unsigned evidence when no key provided")
	}
	if evidence.Signature != "" {
		t.Fatal("expected empty signature when no key provided")
	}
	if evidence.Algorithm != "sha256" {
		t.Fatalf("expected sha256 algorithm, got %q", evidence.Algorithm)
	}
}

func TestBuildComplianceEvidence_Signed(t *testing.T) {
	resp := complianceExportResponse{
		Framework:   "all",
		TenantID:    "default",
		GeneratedAt: time.Now().UTC().Format(time.RFC3339),
		TotalEvents: 2,
		Controls: []complianceControlSummary{
			{ID: "NIST-AI-RMF-MEASURE-2.11", Title: "Decision Logging and Traceability", EventCount: 2},
		},
	}

	evidence := buildComplianceEvidence(resp, "super-secret")
	if !evidence.Signed {
		t.Fatal("expected signed evidence when key provided")
	}
	if evidence.Signature == "" {
		t.Fatal("expected signature when key provided")
	}
	if evidence.Signer != "platform-hmac" {
		t.Fatalf("expected signer platform-hmac, got %q", evidence.Signer)
	}
	if evidence.Algorithm != "hmac-sha256" {
		t.Fatalf("expected hmac-sha256 algorithm, got %q", evidence.Algorithm)
	}
}
