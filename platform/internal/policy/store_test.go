package policy

import (
	"strings"
	"testing"
)

// GetByID validates the UUID before touching the database, so the invalid-id
// guard can be exercised without a DB connection (nil *sql.DB).
func TestGetByID_InvalidUUID(t *testing.T) {
	s := New(nil, "secret")

	_, err := s.GetByID("default", "not-a-uuid")
	if err == nil {
		t.Fatal("expected an error for a malformed UUID")
	}
	if !strings.Contains(err.Error(), "invalid id") {
		t.Fatalf("expected an %q error, got %v", "invalid id", err)
	}
}
