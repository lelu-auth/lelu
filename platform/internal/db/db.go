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
		tenant_id   TEXT        NOT NULL DEFAULT 'default',
		name        TEXT        NOT NULL,
		content     TEXT        NOT NULL,
		version     TEXT        NOT NULL DEFAULT '1.0',
		hmac_sha256 TEXT        NOT NULL,
		created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		UNIQUE(tenant_id, name)
	)`,

	// ── 002 audit_events ─────────────────────────────────────────────────────
	`CREATE TABLE IF NOT EXISTS audit_events (
		id               BIGSERIAL   PRIMARY KEY,
		tenant_id        TEXT        NOT NULL DEFAULT 'default',
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

	`CREATE INDEX IF NOT EXISTS idx_audit_tenant_trace ON audit_events(tenant_id, trace_id)`,
	`CREATE INDEX IF NOT EXISTS idx_audit_tenant_actor ON audit_events(tenant_id, actor, timestamp DESC)`,
	`CREATE INDEX IF NOT EXISTS idx_audit_tenant_ts    ON audit_events(tenant_id, timestamp DESC)`,

	// ── 003 token_revocations ─────────────────────────────────────────────────
	`CREATE TABLE IF NOT EXISTS token_revocations (
		token_id   TEXT        PRIMARY KEY,
		tenant_id  TEXT        NOT NULL DEFAULT 'default',
		revoked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		revoked_by TEXT
	)`,

	// ── 004 api_keys ──────────────────────────────────────────────────────────
	`CREATE TABLE IF NOT EXISTS api_keys (
		id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
		tenant_id  TEXT        NOT NULL DEFAULT 'default',
		key_hash   TEXT        NOT NULL UNIQUE,
		name       TEXT        NOT NULL,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		expires_at TIMESTAMPTZ,
		revoked    BOOLEAN     NOT NULL DEFAULT FALSE
	)`,

	// ── 005 backfill tenant_id columns for existing databases ────────────────
	`ALTER TABLE policies          ADD COLUMN IF NOT EXISTS tenant_id TEXT NOT NULL DEFAULT 'default'`,
	`ALTER TABLE audit_events      ADD COLUMN IF NOT EXISTS tenant_id TEXT NOT NULL DEFAULT 'default'`,
	`ALTER TABLE token_revocations ADD COLUMN IF NOT EXISTS tenant_id TEXT NOT NULL DEFAULT 'default'`,
	`ALTER TABLE api_keys          ADD COLUMN IF NOT EXISTS tenant_id TEXT NOT NULL DEFAULT 'default'`,

	// ── 006 add unique constraint on policies(tenant_id, name) if missing ────
	`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'policies_tenant_id_name_key') THEN ALTER TABLE policies ADD CONSTRAINT policies_tenant_id_name_key UNIQUE (tenant_id, name); END IF; END $$`,
}
