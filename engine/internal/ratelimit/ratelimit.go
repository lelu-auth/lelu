// Package ratelimit provides per-tenant sliding-window rate limiting for
// authorization checks and token minting. Limits are enforced in-memory
// using a token-bucket algorithm per (tenant, endpoint) pair.
package ratelimit

import (
	"fmt"
	"sync"
	"time"
)

// TenantLimits describes the per-tenant quotas.
type TenantLimits struct {
	// AuthChecksPerMinute is the max authorize calls per minute per tenant.
	AuthChecksPerMinute int
	// TokenMintsPerMinute is the max token mint calls per minute per tenant.
	TokenMintsPerMinute int
}

// Limiter enforces per-tenant rate limits. Zero-value limiter is disabled.
type Limiter struct {
	mu       sync.Mutex
	defaults TenantLimits
	override map[string]TenantLimits
	buckets  map[string]*bucket
}

// Config configures the Limiter.
type Config struct {
	// Defaults applied to any tenant without explicit overrides.
	Defaults TenantLimits
	// Overrides maps tenant ID → custom limits. Nil means use defaults.
	Overrides map[string]TenantLimits
}

// New creates a Limiter. Returns nil if defaults have zero limits (disabled).
func New(cfg Config) *Limiter {
	if cfg.Defaults.AuthChecksPerMinute <= 0 && cfg.Defaults.TokenMintsPerMinute <= 0 {
		return nil
	}
	l := &Limiter{
		defaults: cfg.Defaults,
		override: cfg.Overrides,
		buckets:  make(map[string]*bucket),
	}
	if l.override == nil {
		l.override = make(map[string]TenantLimits)
	}
	return l
}

// Enabled returns true when the limiter is active.
func (l *Limiter) Enabled() bool {
	return l != nil
}

// AllowAuth checks whether the tenant may make another authorize call.
// Returns true if allowed, false if rate-limited.
func (l *Limiter) AllowAuth(tenantID string) bool {
	if l == nil {
		return true
	}
	limits := l.limitsFor(tenantID)
	if limits.AuthChecksPerMinute <= 0 {
		return true
	}
	return l.getBucket(tenantID, "auth", limits.AuthChecksPerMinute).allow()
}

// AllowMint checks whether the tenant may make another token mint call.
func (l *Limiter) AllowMint(tenantID string) bool {
	if l == nil {
		return true
	}
	limits := l.limitsFor(tenantID)
	if limits.TokenMintsPerMinute <= 0 {
		return true
	}
	return l.getBucket(tenantID, "mint", limits.TokenMintsPerMinute).allow()
}

func (l *Limiter) limitsFor(tenantID string) TenantLimits {
	l.mu.Lock()
	defer l.mu.Unlock()
	if ov, ok := l.override[tenantID]; ok {
		return ov
	}
	return l.defaults
}

func (l *Limiter) getBucket(tenantID, kind string, maxPerMinute int) *bucket {
	key := fmt.Sprintf("%s:%s", tenantID, kind)
	l.mu.Lock()
	defer l.mu.Unlock()
	b, ok := l.buckets[key]
	if !ok {
		b = newBucket(maxPerMinute, time.Minute)
		l.buckets[key] = b
	}
	return b
}

// ─── Token Bucket ───────────────────────────────────────────────────────────

type bucket struct {
	mu       sync.Mutex
	tokens   float64
	max      float64
	refill   float64 // tokens per nanosecond
	lastFill time.Time
}

func newBucket(maxPerWindow int, window time.Duration) *bucket {
	m := float64(maxPerWindow)
	return &bucket{
		tokens:   m,
		max:      m,
		refill:   m / float64(window.Nanoseconds()),
		lastFill: time.Now(),
	}
}

func (b *bucket) allow() bool {
	b.mu.Lock()
	defer b.mu.Unlock()

	now := time.Now()
	elapsed := float64(now.Sub(b.lastFill).Nanoseconds())
	b.tokens += elapsed * b.refill
	if b.tokens > b.max {
		b.tokens = b.max
	}
	b.lastFill = now

	if b.tokens < 1 {
		return false
	}
	b.tokens--
	return true
}
