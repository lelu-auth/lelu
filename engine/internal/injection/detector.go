// Package injection provides a lightweight heuristic pre-filter for prompt
// injection attempts. It scans the action string and resource values for
// well-known jailbreak / override patterns before policy evaluation.
//
// This is intentionally a fast, non-LLM check — it adds < 0.1 ms to the
// hot path and catches the most common prompt injection vectors at no cost.
package injection

import (
	"strings"
)

// ─── Patterns ─────────────────────────────────────────────────────────────────

// patterns is the list of known prompt injection / jailbreak phrases.
// All patterns are lower-cased for case-insensitive matching.
var patterns = []string{
	"ignore previous instructions",
	"ignore all previous",
	"disregard all prior",
	"disregard previous",
	"forget your instructions",
	"forget all previous",
	"override your instructions",
	"override policy",
	"override all policies",
	"system prompt",
	"you are now",
	"act as if you",
	"act as a",
	"jailbreak",
	"do anything now",
	"dan mode",
	"developer mode enabled",
	"pretend you are",
	"pretend to be",
	"simulate being",
	"your new instructions",
	"new system prompt",
	"from now on you",
	"bypass your",
	"ignore your",
	"disregard your",
	"forget you are",
}

// ─── Result ───────────────────────────────────────────────────────────────────

// Result is the output of a detection run.
type Result struct {
	// Detected is true if a known injection pattern was found.
	Detected bool
	// Pattern is the matched pattern string, empty when Detected is false.
	Pattern string
	// Source indicates where the pattern was found: "action" or "resource".
	Source string
}

// ─── Detector ─────────────────────────────────────────────────────────────────

// Detect scans the action string and all resource values for prompt injection
// patterns. It returns on the first match found.
func Detect(action string, resource map[string]string) Result {
	// Check action field.
	if r := scan(strings.ToLower(action), "action"); r.Detected {
		return r
	}

	// Check every resource value.
	for _, v := range resource {
		if r := scan(strings.ToLower(v), "resource"); r.Detected {
			return r
		}
	}

	return Result{}
}

func scan(text, source string) Result {
	for _, p := range patterns {
		if strings.Contains(text, p) {
			return Result{Detected: true, Pattern: p, Source: source}
		}
	}
	return Result{}
}
