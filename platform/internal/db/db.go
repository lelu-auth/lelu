// Package db manages the PostgreSQL connection pool and schema migrations.
package db

import (
	"database/sql"
	"fmt"

	_ "github.com/lib/pq"
)

// Open returns a connected *sql.DB using the provided DSN.
// DSN format: "postgres://user:pass@host:5432/dbname?sslmode=disable"
func Open(dsn string) (*sql.DB, error) {
	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, fmt.Errorf("db: open: %w", err)
	}
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("db: ping: %w", err)
	}
	return db, nil
}

// Migrate runs all embedded SQL migrations idempotently.
func Migrate(db *sql.DB) error {
	for _, m := range migrations {
		if _, err := db.Exec(m); err != nil {
			return fmt.Errorf("db: migrate: %w", err)
		}
	}
	return nil
}

// migrations holds all DDL in order. Each statement is idempotent.
var migrations = []string{
	// ── 001 policies ─────────────────────────────────────────────────────────
	`CREATE TABLE IF NOT EXISTS policies (
		id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
		name        TEXT        NOT NULL UNIQUE,
		content     TEXT        NOT NULL,
		version     TEXT        NOT NULL DEFAULT '1.0',
		hmac_sha256 TEXT        NOT NULL,
		created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
	)`,

	// ── 002 audit_events ─────────────────────────────────────────────────────
	`CREATE TABLE IF NOT EXISTS audit_events (
		id               BIGSERIAL   PRIMARY KEY,
		trace_id         UUID        NOT NULL,
		timestamp        TIMESTAMPTZ NOT NULL,
		actor            TEXT        NOT NULL,
		action           TEXT        NOT NULL,
		resource         JSONB,
		confidence_score NUMERIC(5,4),
		decision         TEXT        NOT NULL,
		reason           TEXT,
		downgraded_scope TEXT,
		latency_ms       NUMERIC(10,3),
		engine_version   TEXT,
		policy_version   TEXT,
		created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
	)`,

	`CREATE INDEX IF NOT EXISTS idx_audit_trace ON audit_events(trace_id)`,
	`CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_events(actor, timestamp DESC)`,
	`CREATE INDEX IF NOT EXISTS idx_audit_ts    ON audit_events(timestamp DESC)`,

	// ── 003 token_revocations ─────────────────────────────────────────────────
	`CREATE TABLE IF NOT EXISTS token_revocations (
		token_id   TEXT        PRIMARY KEY,
		revoked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		revoked_by TEXT
	)`,

	// ── 004 api_keys ──────────────────────────────────────────────────────────
	`CREATE TABLE IF NOT EXISTS api_keys (
		id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
		key_hash   TEXT        NOT NULL UNIQUE,
		name       TEXT        NOT NULL,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		expires_at TIMESTAMPTZ,
		revoked    BOOLEAN     NOT NULL DEFAULT FALSE
	)`,
}
