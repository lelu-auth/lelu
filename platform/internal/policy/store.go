// Package policy implements the cloud policy store backed by PostgreSQL.
package policy

import (
	"crypto/hmac"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
)

// Policy is a stored YAML policy document.
type Policy struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Content   string    `json:"content"`
	Version   string    `json:"version"`
	HMACSha256 string   `json:"hmac_sha256"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Store manages policy CRUD in Postgres.
type Store struct {
	db         *sql.DB
	hmacSecret []byte
}

// New returns a Store.
func New(db *sql.DB, hmacSecret string) *Store {
	return &Store{db: db, hmacSecret: []byte(hmacSecret)}
}

// Upsert creates or replaces a policy by name. Returns the final record.
func (s *Store) Upsert(name, content, version string) (*Policy, error) {
	mac := hmac.New(sha256.New, s.hmacSecret)
	mac.Write([]byte(content))
	sig := hex.EncodeToString(mac.Sum(nil))

	var p Policy
	err := s.db.QueryRow(`
		INSERT INTO policies (name, content, version, hmac_sha256)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (name) DO UPDATE
		  SET content     = EXCLUDED.content,
		      version     = EXCLUDED.version,
		      hmac_sha256 = EXCLUDED.hmac_sha256,
		      updated_at  = NOW()
		RETURNING id, name, content, version, hmac_sha256, created_at, updated_at
	`, name, content, version, sig).Scan(
		&p.ID, &p.Name, &p.Content, &p.Version, &p.HMACSha256, &p.CreatedAt, &p.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("policy: upsert: %w", err)
	}
	return &p, nil
}

// Get returns a policy by name.
func (s *Store) Get(name string) (*Policy, error) {
	var p Policy
	err := s.db.QueryRow(`
		SELECT id, name, content, version, hmac_sha256, created_at, updated_at
		FROM policies WHERE name = $1
	`, name).Scan(
		&p.ID, &p.Name, &p.Content, &p.Version, &p.HMACSha256, &p.CreatedAt, &p.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, fmt.Errorf("policy: %q not found", name)
	}
	if err != nil {
		return nil, fmt.Errorf("policy: get: %w", err)
	}
	return &p, nil
}

// GetByID returns a policy by UUID.
func (s *Store) GetByID(id string) (*Policy, error) {
	if _, err := uuid.Parse(id); err != nil {
		return nil, fmt.Errorf("policy: invalid id %q", id)
	}
	var p Policy
	err := s.db.QueryRow(`
		SELECT id, name, content, version, hmac_sha256, created_at, updated_at
		FROM policies WHERE id = $1
	`, id).Scan(
		&p.ID, &p.Name, &p.Content, &p.Version, &p.HMACSha256, &p.CreatedAt, &p.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, fmt.Errorf("policy: id %q not found", id)
	}
	if err != nil {
		return nil, fmt.Errorf("policy: get by id: %w", err)
	}
	return &p, nil
}

// List returns all policies ordered by name.
func (s *Store) List() ([]Policy, error) {
	rows, err := s.db.Query(`
		SELECT id, name, content, version, hmac_sha256, created_at, updated_at
		FROM policies ORDER BY name
	`)
	if err != nil {
		return nil, fmt.Errorf("policy: list: %w", err)
	}
	defer rows.Close()

	var policies []Policy
	for rows.Next() {
		var p Policy
		if err := rows.Scan(&p.ID, &p.Name, &p.Content, &p.Version, &p.HMACSha256, &p.CreatedAt, &p.UpdatedAt); err != nil {
			return nil, fmt.Errorf("policy: scan: %w", err)
		}
		policies = append(policies, p)
	}
	return policies, rows.Err()
}

// Delete removes a policy by name.
func (s *Store) Delete(name string) error {
	res, err := s.db.Exec(`DELETE FROM policies WHERE name = $1`, name)
	if err != nil {
		return fmt.Errorf("policy: delete: %w", err)
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return fmt.Errorf("policy: %q not found", name)
	}
	return nil
}
