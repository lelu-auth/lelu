package policy

import (
	"crypto/hmac"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"strings"
	"testing"
	"time"

	sqlmock "github.com/DATA-DOG/go-sqlmock"
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

func sign(content, secret string) string {
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(content))
	return hex.EncodeToString(mac.Sum(nil))
}

func policyCols() []string {
	return []string{"id", "tenant_id", "name", "content", "version", "hmac_sha256", "created_at", "updated_at"}
}

// Upsert must HMAC-sign the content with the store secret and pass that exact
// signature to the INSERT. The WithArgs match on the expected signature means a
// wrong computation would fail the expectation.
func TestUpsert_SignsContentAndScansResult(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("sqlmock: %v", err)
	}
	defer db.Close()

	s := New(db, "test-secret")
	wantSig := sign("policy-content", "test-secret")
	now := time.Now()

	mock.ExpectQuery("INSERT INTO policies").
		WithArgs("default", "prod", "policy-content", "1.0", wantSig).
		WillReturnRows(sqlmock.NewRows(policyCols()).
			AddRow("id-1", "default", "prod", "policy-content", "1.0", wantSig, now, now))

	p, err := s.Upsert("default", "prod", "policy-content", "1.0")
	if err != nil {
		t.Fatalf("upsert: %v", err)
	}
	if p.ID != "id-1" {
		t.Errorf("id = %q, want id-1", p.ID)
	}
	if p.HMACSha256 != wantSig {
		t.Errorf("hmac = %q, want %q", p.HMACSha256, wantSig)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
	}
}

func TestGet_NotFound(t *testing.T) {
	db, mock, _ := sqlmock.New()
	defer db.Close()
	s := New(db, "secret")

	mock.ExpectQuery("SELECT id, tenant_id, name").
		WithArgs("default", "missing").
		WillReturnError(sql.ErrNoRows)

	_, err := s.Get("default", "missing")
	if err == nil || !strings.Contains(err.Error(), "not found") {
		t.Fatalf("expected a not-found error, got %v", err)
	}
}

func TestList_ReturnsAllInOrder(t *testing.T) {
	db, mock, _ := sqlmock.New()
	defer db.Close()
	s := New(db, "secret")
	now := time.Now()

	mock.ExpectQuery("SELECT id, tenant_id, name").
		WithArgs("default").
		WillReturnRows(sqlmock.NewRows(policyCols()).
			AddRow("id-1", "default", "alpha", "c1", "1.0", "sig1", now, now).
			AddRow("id-2", "default", "beta", "c2", "1.0", "sig2", now, now))

	ps, err := s.List("default")
	if err != nil {
		t.Fatalf("list: %v", err)
	}
	if len(ps) != 2 {
		t.Fatalf("len = %d, want 2", len(ps))
	}
	if ps[0].Name != "alpha" || ps[1].Name != "beta" {
		t.Errorf("unexpected order: %q, %q", ps[0].Name, ps[1].Name)
	}
}

func TestDelete_Success(t *testing.T) {
	db, mock, _ := sqlmock.New()
	defer db.Close()
	s := New(db, "secret")

	mock.ExpectExec("DELETE FROM policies").
		WithArgs("default", "prod").
		WillReturnResult(sqlmock.NewResult(0, 1))

	if err := s.Delete("default", "prod"); err != nil {
		t.Fatalf("delete: %v", err)
	}
}

func TestDelete_NotFound(t *testing.T) {
	db, mock, _ := sqlmock.New()
	defer db.Close()
	s := New(db, "secret")

	mock.ExpectExec("DELETE FROM policies").
		WithArgs("default", "missing").
		WillReturnResult(sqlmock.NewResult(0, 0)) // 0 rows affected

	err := s.Delete("default", "missing")
	if err == nil || !strings.Contains(err.Error(), "not found") {
		t.Fatalf("expected a not-found error, got %v", err)
	}
}
