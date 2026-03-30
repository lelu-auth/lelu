// Package sync provides a background policy sync worker that polls the cloud
// control plane and hot-reloads the local policy evaluator.
package sync

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"
)

// ─── PolicyLoader is the interface the worker calls on successful fetch ───────

type PolicyLoader interface {
	LoadPolicyBytes(data []byte) error
}

// ─── Config ───────────────────────────────────────────────────────────────────

// Config holds worker configuration.
type Config struct {
	ControlPlaneURL string        // e.g. https://api.lelu.dev/policies/current
	HMACSecret      string        // shared secret for signature verification
	PollInterval    time.Duration // default 30 s
	TenantID        string        // tenant ID to fetch policy for
	APIKey          string        // API key for authentication
}

// ─── Worker ───────────────────────────────────────────────────────────────────

// Worker polls the control plane and hot-reloads policy on change.
type Worker struct {
	cfg    Config
	loader PolicyLoader
	client *http.Client
	etag   string // last known ETag, avoids redundant reloads
}

// New creates a Worker. Call Start(ctx) to begin polling.
func New(cfg Config, loader PolicyLoader) *Worker {
	if cfg.PollInterval <= 0 {
		cfg.PollInterval = 30 * time.Second
	}
	if cfg.TenantID == "" {
		cfg.TenantID = "default"
	}
	return &Worker{
		cfg:    cfg,
		loader: loader,
		client: &http.Client{Timeout: 10 * time.Second},
	}
}

// Start begins the polling loop. It blocks until ctx is cancelled.
func (w *Worker) Start(ctx context.Context) {
	log.Printf("sync: starting policy sync worker (interval=%s)", w.cfg.PollInterval)
	ticker := time.NewTicker(w.cfg.PollInterval)
	defer ticker.Stop()

	// Immediate first fetch.
	if err := w.poll(ctx); err != nil {
		log.Printf("sync: initial fetch error: %v", err)
	}

	for {
		select {
		case <-ctx.Done():
			log.Println("sync: worker stopped")
			return
		case <-ticker.C:
			if err := w.poll(ctx); err != nil {
				log.Printf("sync: poll error: %v", err)
			}
		}
	}
}

// poll fetches the policy and reloads if it has changed.
func (w *Worker) poll(ctx context.Context) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, w.cfg.ControlPlaneURL, nil)
	if err != nil {
		return fmt.Errorf("sync: build request: %w", err)
	}
	if w.etag != "" {
		req.Header.Set("If-None-Match", w.etag)
	}
	if w.cfg.TenantID != "" {
		req.Header.Set("X-Tenant-ID", w.cfg.TenantID)
	}
	if w.cfg.APIKey != "" {
		req.Header.Set("Authorization", "Bearer "+w.cfg.APIKey)
	}

	resp, err := w.client.Do(req)
	if err != nil {
		return fmt.Errorf("sync: fetch: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNotModified {
		return nil // no change
	}
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("sync: unexpected status %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("sync: read body: %w", err)
	}

	// Verify HMAC-SHA256 signature if secret configured.
	if w.cfg.HMACSecret != "" {
		sig := resp.Header.Get("X-Lelu-Signature")
		if !verifyHMAC(body, w.cfg.HMACSecret, sig) {
			return fmt.Errorf("sync: signature mismatch — policy rejected")
		}
	}

	if err := w.loader.LoadPolicyBytes(body); err != nil {
		return fmt.Errorf("sync: reload: %w", err)
	}

	if etag := resp.Header.Get("ETag"); etag != "" {
		w.etag = etag
	}

	log.Println("sync: policy hot-reloaded successfully")
	return nil
}

func verifyHMAC(data []byte, secret, expectedHex string) bool {
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write(data)
	computed := hex.EncodeToString(mac.Sum(nil))
	return hmac.Equal([]byte(computed), []byte(expectedHex))
}
